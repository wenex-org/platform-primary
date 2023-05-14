/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  App,
  AuthenticationRequest,
  AuthenticationResponse,
  Client,
  JwtToken,
  Query,
  Session,
  User,
} from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';

import {
  AUTH_CACHE_TOKEN_KEY,
  AUTH_CACHE_TOKEN_TTL,
  CLIENT_TTL,
} from '@app/common/consts';
import { isApplicable, isAvailable, toDate, toRaw } from '@app/common/utils';
import { GrantType, ResponseType } from '@app/common/enums';
import { AES, Bcrypt, MD5 } from '@app/common/helpers';
import { BlacklistedService } from '@app/blacklisted';
import { isNotEmptyObject } from 'class-validator';
import { intersection, uniq } from 'lodash';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';
import { Metadata } from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';

import { AuthenticationProvider } from './authentication.provider';

export type AuthToken = {
  token: Omit<JwtToken, 'type' | 'session'>;

  state?: string;
  redirect_uri?: string;

  access_token_ttl: number;
  refresh_token_ttl: number;
};

export type AuthenticationOptions = {
  app: App;
  user?: User;
  client: Client;
  metadata: Metadata;
};

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly blacklisted: BlacklistedService,

    private readonly provider: AuthenticationProvider,
  ) {}

  async token(
    data: AuthenticationRequest,
    metadata: Metadata,
  ): Promise<AuthenticationResponse> {
    if (data.code || data.response_type === ResponseType.Token)
      if (!data.client_secret) throw new Error('client secret is required');

    if (data.roles?.length && !data.domain)
      throw new Error('domain is required when roles is provided');

    const client = await this.validateClient(data);

    if (data.domain && data.roles?.length) {
      const domain = client.domains.find((d) => d.address === data.domain);

      data.roles = uniq(intersection(domain.roles, data.roles));
    }

    const app = await this.validateApplication(client, data);

    if (!(app ?? client).grant_types.includes(data.grant_type))
      throw new Error('grant type is not available');

    if (data.redirect_uri && data.redirect_uri !== (app ?? client).redirect_uri)
      throw new Error('redirect uri is not acceptable');

    if (data.scopes?.length)
      data.scopes = uniq(intersection(data.scopes, (app ?? client).scopes));
    else data.scopes = (app ?? client).scopes;

    if (!data.roles?.length) data.roles = ['guest'];
    if (!data.domain) data.domain = client.domains[0]?.address;

    return await this.handler(data, { metadata, client, app });
  }

  async logout(token: string, metadata: Metadata): Promise<'OK' | 'NOK'> {
    token = token ?? String(metadata.get('authorization'));

    const jwtToken = this.jwtService.verify<JwtToken>(AES.decrypt(token));

    return await this.blacklisted.put(jwtToken.session, {
      prefix: AUTH_CACHE_TOKEN_KEY,
      ttl: CLIENT_TTL.MAXIMUM_REFRESH_TOKEN,
    });
  }

  async decrypt(token: string, metadata: Metadata): Promise<JwtToken> {
    token = token ?? String(metadata.get('authorization'));

    return this.jwtService.verify<JwtToken>(AES.decrypt(token));
  }

  // Grant types handler

  async handler(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ) {
    switch (data.grant_type) {
      case GrantType.OTP:
        return await this.otp(data, { metadata, client, app });
      case GrantType.Password:
        return await this.password(data, { metadata, client, app });
      case GrantType.RefreshToken:
        return await this.refreshToken(data, { metadata, client, app });
      case GrantType.ClientCredential:
        return await this.clientCredential(data, { metadata, client, app });
      case GrantType.AuthorizationCode:
        return await this.authorizationCode(data, { metadata, client, app });
      default:
        throw new Error('grant type is not supported');
    }
  }

  async otp(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ): Promise<AuthenticationResponse> {
    throw new Error('otp grant type not implemented');
  }

  async password(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ): Promise<AuthenticationResponse> {
    const { username, email, password } = data;

    if (!password || !(username || email))
      throw new Error('username or email and password are required');

    const query: Query<User> = { $or: [{ username }, { email }] };

    const user = await lastValueFrom(
      this.provider.users.findOne(toRaw({ query })),
    );

    if (!user.id || !isAvailable(user) || !isApplicable(user))
      throw new Error('user is not available or not applicable');

    if (!Bcrypt.compare(password, user.password))
      throw new Error('password is not correct');

    const authToken = await this.authToken(data, { client, user, app });

    if (data.response_type === ResponseType.Token)
      return await this.generateToken(authToken, { metadata });
    else {
      return await this.generateCode(authToken);
    }
  }

  async refreshToken(
    data: AuthenticationRequest,
    { client, app }: AuthenticationOptions,
  ): Promise<AuthenticationResponse> {
    const { refresh_token, client_secret } = data;

    if (!refresh_token) throw new Error('refresh token is required');
    if (!client_secret) throw new Error('client secret is required');

    const token = this.jwtService.verify<JwtToken>(AES.decrypt(refresh_token));

    const isBlacklisted = await this.blacklisted.isBlacklisted(
      AUTH_CACHE_TOKEN_KEY,
      [token.session],
    );
    if (isBlacklisted) throw new Error('your session is blacklisted');

    if (token.type !== 'refresh') throw new Error('token is not refresh');

    if (token.cid !== client.id || token.client_id !== client.client_id)
      throw new Error('incompatible client id detected');

    const query: Query<User> = { id: token.uid ?? token.cid };

    const user = await lastValueFrom(
      this.provider.users.findById(toRaw({ query })),
    );

    const entity = isNotEmptyObject(user) ? user : client;

    if (!isAvailable(entity) || !isApplicable(entity))
      throw new Error('user is not available or not applicable');

    const authToken = await this.authToken(data, { client, user, app });

    return await this.generateToken(authToken, {
      session: { id: token.session },
    });
  }

  async clientCredential(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ): Promise<AuthenticationResponse> {
    const { client_secret } = data;

    if (!client_secret) throw new Error('client secret is required');

    const authToken = await this.authToken(data, { client, app });

    if (data.response_type === ResponseType.Code)
      return await this.generateCode(authToken);
    else {
      return await this.generateToken(authToken, { metadata });
    }
  }

  async authorizationCode(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ): Promise<AuthenticationResponse> {
    const { code } = data;

    if (!code) throw new Error('code is required');

    const key = [AUTH_CACHE_TOKEN_KEY, (app ?? client).id, code].join(':');
    const authToken: AuthToken = JSON.parse(await this.redis.get(key));

    if (!authToken) throw new Error('code is not valid');

    return await this.generateToken(authToken, { metadata });
  }

  // Generate token/code

  async authToken(
    data: AuthenticationRequest,
    { client, user, app }: Omit<AuthenticationOptions, 'metadata'>,
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

    const access_token_ttl = Number((app ?? client).access_token_ttl);
    const refresh_token_ttl = Number((app ?? client).refresh_token_ttl);

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

  async generateToken(
    authToken: AuthToken,
    options: { session?: Partial<Session>; metadata?: Metadata } = {},
  ): Promise<AuthenticationResponse> {
    const { token, state, access_token_ttl, refresh_token_ttl } = authToken;

    if (!options.session) {
      const { metadata } = options;

      options.session = await lastValueFrom(
        this.provider.sessions.create({
          owner: token.uid ?? token.cid,
          clients: [token.cid],
          created_by: token.uid ?? token.cid,
          created_in: token.aid ?? token.cid,
          agent: String(metadata?.get('x-user-agent')),
        }),
      );
    }

    const access_token: JwtToken = {
      ...token,
      type: 'access',
      session: options.session.id,
    };

    const refresh_token: JwtToken = {
      ...token,
      type: 'refresh',
      session: options.session.id,
    };

    return {
      token_type: 'Bearer',
      domain: token.domain,
      session: options.session.id,
      expires_in: access_token_ttl,
      role: token.roles.sort().join(' '),
      scope: token.scopes.sort().join(' '),
      access_token: AES.encrypt(
        this.jwtService.sign(access_token, { expiresIn: access_token_ttl }),
      ),
      refresh_token: AES.encrypt(
        this.jwtService.sign(refresh_token, { expiresIn: refresh_token_ttl }),
      ),
      state,
    };
  }

  // Validation methods

  async validateClient(data: AuthenticationRequest): Promise<Client> {
    const { client_id, client_secret } = data;

    if (!client_id) throw new Error('client id is required');

    const query: Query<Client> = {
      $or: [{ client_id }, { _id: client_id }],
      client_secret: client_secret ? MD5.hash(client_secret) : undefined,
    };

    const client = await lastValueFrom(
      this.provider.clients.findOne(toRaw({ query })),
    );

    if (!client.id || !isAvailable(client) || !isApplicable(client))
      throw new Error('client is not available or not applicable');

    if (data.domain && !client.domains.find((d) => d.address === data.domain))
      throw new Error('domain is not belongs to this client');

    const expirationDate = toDate(client.expiration_date);
    if (expirationDate < new Date()) throw new Error('client is expired');

    return client;
  }

  async validateApplication(client: Client, data: AuthenticationRequest) {
    if (!data.app_id) return null;

    const query: Query<App> = { _id: data.app_id, cid: client.id };

    const app = await lastValueFrom(
      this.provider.apps.findOne(toRaw({ query })),
    );

    if (!app.id || !isAvailable(app) || !isApplicable(app))
      throw new Error('application is not available or not applicable');

    return app;
  }
}
