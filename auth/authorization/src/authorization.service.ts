import {
  Ability,
  AuthorizationRequest,
  AuthorizationResponse,
  Grant,
  JwtToken,
  Pagination,
  Projection,
  Query,
} from '@app/common/interfaces';
import {
  AUTH_CACHE_TOKEN_KEY,
  FILTER_PAGINATION_LIMIT_MAX,
} from '@app/common/consts';
import { BlacklistedService } from '@app/blacklisted';
import { subjects, toRaw } from '@app/common/utils';
import { lookup } from 'naming-conventions-modeler';
import { Injectable } from '@nestjs/common';
import { AES } from '@app/common/helpers';
import { JwtService } from '@nestjs/jwt';
import { Metadata } from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';
import AccessControl from 'abacl';

import { AuthorizationProvider } from './authorization.provider';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly provider: AuthorizationProvider,

    private readonly jwtService: JwtService,
    private readonly blacklisted: BlacklistedService,
  ) {}

  async can(
    auth: AuthorizationRequest,
    meta?: Metadata,
  ): Promise<AuthorizationResponse> {
    if (!auth.ip && meta) auth.ip = String(meta.get('x-user-ip'));
    if (!auth.token && meta) auth.token = String(meta.get('authorization'));

    if (typeof auth.token === 'string')
      auth.token = this.jwtService.verify<JwtToken>(AES.decrypt(auth.token));

    const { action, object, token, ip, strict } = auth;

    const isBlacklisted = await this.blacklisted.isBlacklisted(
      AUTH_CACHE_TOKEN_KEY,
      [token.session, ip],
    );
    if (isBlacklisted) throw new Error('your are blacklisted');

    if (token.type === 'refresh') throw new Error('token is not valid');

    const { cid, roles, domain } = token;
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

    const ac = new AccessControl(abilities, { strict });

    const permission = ac.can(subject, action, object, (perm) => {
      return ip ? perm.location(ip) && perm.time() : perm.time();
    });

    return { granted: permission.granted, abilities: permission.abilities() };
  }
}
