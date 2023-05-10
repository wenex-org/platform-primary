/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  App,
  AuthenticationRequest,
  AuthenticationResponse,
  Client,
  JwtToken,
  Query,
  User,
} from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';

import { isApplicable, isAvailable, toDate } from '@app/common/utils';
import { GrantType, ResponseType } from '@app/common/enums';
import { BlacklistedService } from '@app/blacklisted';
import { Bcrypt, MD5 } from '@app/common/helpers';
import { intersection, uniq } from 'lodash';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

import {
  AUTH_CACHE_TOKEN_KEY,
  AUTH_CACHE_TOKEN_TTL,
} from './authentication.const';
import { AuthenticationProvider } from './authentication.provider';
import { AuthToken } from './authentication.type';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly blacklist: BlacklistedService,

    private readonly provider: AuthenticationProvider,
  ) {}

  async token(data: AuthenticationRequest): Promise<AuthenticationResponse> {
    if (data.code || data.response_type === ResponseType.Token)
      if (!data.client_secret) throw new Error('client secret is required');

    const client = await this.validateClient(data);

    const app = await this.validateApplication(client, data);

    if (!(app ?? client).grant_types.includes(data.grant_type))
      throw new Error('grant type is not available');

    if (data.redirect_uri && data.redirect_uri !== (app ?? client).redirect_uri)
      throw new Error('redirect uri is not acceptable');

    if (data.scopes?.length)
      data.scopes = uniq(intersection(data.scopes, (app ?? client).scopes));
    else data.scopes = (app ?? client).scopes;

    if (!data.roles?.length) data.roles = ['guest'];

    return await this.handler(data, { client, app });
  }

  async logout(token: string): Promise<'OK' | 'NOK'> {
    throw new Error('not implemented');
  }

  async decrypt(token: string): Promise<JwtToken> {
    throw new Error('not implemented');
  }

  // Grant types handler

  async handler(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ) {
    switch (data.grant_type) {
      case GrantType.OTP:
        return await this.otp(data, { client, app });
      case GrantType.Password:
        return await this.password(data, { client, app });
      case GrantType.RefreshToken:
        return await this.refreshToken(data, { client, app });
      case GrantType.ClientCredential:
        return await this.clientCredential(data, { client, app });
      case GrantType.AuthorizationCode:
        return await this.authorizationCode(data, { client, app });
      default:
        throw new Error('grant type is not supported');
    }
  }

  async otp(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ): Promise<AuthenticationResponse> {
    throw new Error('otp grant type not implemented');
  }

  async password(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ): Promise<AuthenticationResponse> {
    const { username, email, password } = data;

    if (!password || !(username || email))
      throw new Error('username or email and password are required');

    const query: Query<User> = { $or: [{ username }, { email }] };

    const user = await lastValueFrom(
      this.provider.usersService.findOne({ query }),
    );

    if (!user || !isAvailable(user) || !isApplicable(user))
      throw new Error('user is not available or not applicable');

    if (Bcrypt.compare(password, user.password))
      throw new Error('password is not correct');

    const authToken = await this.authToken(data, { client, user, app });

    if (data.response_type === ResponseType.Token)
      return await this.generateToken(authToken);
    else {
      return await this.generateCode(authToken);
    }
  }

  async refreshToken(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ): Promise<AuthenticationResponse> {
    throw new Error('refresh token grant type not implemented');
  }

  async clientCredential(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ): Promise<AuthenticationResponse> {
    throw new Error('client credential grant type not implemented');
  }

  async authorizationCode(
    data: AuthenticationRequest,
    { client, app }: { client: Client; app: App },
  ): Promise<AuthenticationResponse> {
    const { code } = data;

    if (!code) throw new Error('code is required');

    const key = [AUTH_CACHE_TOKEN_KEY, (app ?? client).id, code].join(':');
    const authToken: AuthToken = JSON.parse(await this.redis.get(key));

    if (!authToken) throw new Error('code is not valid');

    return await this.generateToken(authToken);
  }

  // Generate token/code

  async authToken(
    data: AuthenticationRequest,
    { client, user, app }: { client: Client; user?: User; app?: App },
  ): Promise<AuthToken> {
    const token: AuthToken['token'] = {
      cid: client.id,
      aid: app?.id,
      uid: user?.id,
      roles: data.roles,
      domain: data.domain,
      scopes: data.scopes,
      client_id: client.client_id,
    };

    const { state, redirect_uri } = data;
    const access_token_ttl = (app ?? client).access_token_ttl;
    const refresh_token_ttl = (app ?? client).refresh_token_ttl;

    return { token, state, redirect_uri, access_token_ttl, refresh_token_ttl };
  }

  async generateCode(authToken: AuthToken) {
    const {
      redirect_uri,
      token: { cid, aid },
    } = authToken;

    const value = JSON.stringify(authToken);
    const code = MD5.hash(value);
    const key = [AUTH_CACHE_TOKEN_KEY, aid ?? cid, code].join(':');

    await this.redis.setex(key, AUTH_CACHE_TOKEN_TTL, value);

    return { code, redirect_uri, state: authToken.state };
  }

  async generateToken(authToken: AuthToken): Promise<AuthenticationResponse> {
    const { token, state, access_token_ttl, refresh_token_ttl } = authToken;

    const session = await lastValueFrom(
      this.provider.sessionsService.create({
        owner: token.uid,
        clients: [token.cid],
        created_by: token.uid ?? token.cid,
        created_in: token.aid ?? token.cid,
      }),
    );

    const access_token: JwtToken = {
      ...token,
      type: 'access',
      session: session.id,
    };

    const refresh_token: JwtToken = {
      ...token,
      type: 'refresh',
      session: session.id,
    };

    return {
      token_type: 'Bearer',
      session: session.id,
      expires_in: access_token_ttl,
      access_token: this.jwtService.sign(access_token, {
        expiresIn: access_token_ttl,
      }),
      refresh_token: this.jwtService.sign(refresh_token, {
        expiresIn: refresh_token_ttl,
      }),
      state,
    };
  }

  // Validation methods

  async validateClient(data: AuthenticationRequest): Promise<Client> {
    const { client_id, client_secret } = data;

    const query: Query<Client> = {
      client_secret,
      $or: [{ client_id }, { _id: client_id }],
    };

    const client = await lastValueFrom(
      this.provider.clientsService.findOne({ query }),
    );

    if (!client || !isAvailable(client) || !isApplicable(client))
      throw new Error('client is not available or not applicable');

    if (!client.domains.find((d) => d.address === data.domain))
      throw new Error('domain is not belongs to this client');

    const expirationDate = toDate(client.expiration_date);
    if (expirationDate < new Date()) throw new Error('client is expired');

    return client;
  }

  async validateApplication(client: Client, data: AuthenticationRequest) {
    if (!data.app_id) return null;

    const query: Query<App> = { _id: data.app_id, cid: client.id };

    const app = await lastValueFrom(
      this.provider.appsService.findOne({ query }),
    );

    if (!app || !isAvailable(app) || !isApplicable(app))
      throw new Error('application is not available or not applicable');

    return app;
  }
}
