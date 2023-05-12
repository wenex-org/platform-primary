import {
  Ability,
  AuthorizationRequest,
  AuthorizationResponse,
  Grant,
  Pagination,
  Projection,
  Query,
} from '@app/common/interfaces';
import { FILTER_PAGINATION_LIMIT_MAX } from '@app/common/consts';
import { subjects, toRaw } from '@app/common/utils';
import { lookup } from 'naming-conventions-modeler';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import AccessControl from 'abacl';

import { AuthorizationProvider } from './authorization.provider';

@Injectable()
export class AuthorizationService {
  constructor(private readonly provider: AuthorizationProvider) {}

  async can(auth: AuthorizationRequest): Promise<AuthorizationResponse> {
    if (typeof auth.token === 'string')
      auth.token = await lastValueFrom(
        this.provider.authentication.decrypt({ token: auth.token }),
      );

    if (auth.token.type === 'refresh') throw new Error('token is not valid');

    const { cid, roles, domain } = auth.token;
    const subject = subjects(roles, domain);

    const query: Query<Grant> = {
      clients: cid,
      subject: { $in: subject },
    };

    const projection: Projection<Grant> = {
      ...{ subject: 1, action: 1, object: 1 },
      ...{ field: 1, filter: 1, location: 1, times: 1 },
    };

    const pagination: Pagination = { limit: FILTER_PAGINATION_LIMIT_MAX };

    const { items } = await lastValueFrom(
      this.provider.grants.findMany(toRaw({ query, projection, pagination })),
    );

    const abilities = lookup<Ability[]>(items, { times: 'time' });

    const { action, resource, ip, strict } = auth;

    const ac = new AccessControl(abilities, { strict });

    const permission = ac.can(subject, action, resource, (perm) => {
      return ip ? perm.location(ip) && perm.time() : perm.time();
    });

    return { granted: permission.granted, abilities: permission.abilities() };
  }
}
