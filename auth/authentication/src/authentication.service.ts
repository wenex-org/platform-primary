import {
  App,
  AuthenticationRequest,
  AuthenticationResponse,
  Client,
  JwtToken,
  Metadata,
  Query,
  Session,
  Token,
  User,
} from '@app/common/interfaces';
import {
  AUTH_CACHE_TOKEN_KEY,
  AUTH_CACHE_TOKEN_TTL,
  CLIENT_TTL,
} from '@app/common/consts';
import {
  isApplicable,
  isAvailable,
  toDate,
  toGrpcMeta,
  toRaw,
} from '@app/common/utils';
import { GrantType, ResponseType, Role } from '@app/common/enums';
import { AES, Bcrypt, MD5 } from '@app/common/helpers';
import { BlacklistedService } from '@app/blacklisted';
import { isNotEmptyObject } from 'class-validator';
import { intersection, uniq } from 'lodash';
import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';
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

  /**
   * This is an async function that validates and processes authentication requests, returning an
   * authentication response.
   *
   * @param {AuthenticationRequest} data - The `data` parameter is an object of type
   * `AuthenticationRequest` which contains information about the authentication request being made. It
   * includes properties such as `code`, `response_type`, `client_secret`, `domain`, `roles`,
   * `grant_type`, `redirect_uri`, and `scopes`.
   * @param {Metadata} metadata - Metadata is an object that contains additional information about the
   * authentication request, such as the IP address of the client making the request, the user agent
   * string of the client, and any other relevant contextual information. This information can be used
   * to help validate the request and ensure that it is coming from a trusted source
   *
   * @returns a Promise that resolves to an AuthenticationResponse object.
   */
  async token(
    data: AuthenticationRequest,
    metadata: Metadata,
  ): Promise<AuthenticationResponse> {
    if (data.code || data.response_type === ResponseType.Token)
      if (!data.client_secret) throw new Error('client secret is required');

    const client = await this.validateClient(data);

    if (!data.domain) data.domain = client.domains[0]?.address;
    if (!data.roles?.length) {
      data.roles = [Role.Guest];
    } else {
      const domain = client.domains.find((d) => d.address === data.domain);
      data.roles = uniq(intersection(domain.roles, data.roles));
    }

    const app = await this.validateApplication(client, data);

    if (!(app ?? client).grant_types.includes(data.grant_type))
      throw new Error('grant type is not available');

    if (
      data.redirect_uri &&
      !(app ?? client).redirect_uri.includes(data.redirect_uri)
    )
      throw new Error('redirect uri is not acceptable');

    if (data.scopes?.length)
      data.scopes = uniq(intersection(data.scopes, (app ?? client).scopes));
    else data.scopes = (app ?? client).scopes;

    return this.handler(data, { metadata, client, app });
  }

  /**
   * This is an async function that logs out a user by blacklisting their session token.
   *
   * @param {Token}  - 1. `token`: A string representing the authentication token of the user.
   * @param {Metadata} [meta] - The `meta` parameter is an optional object that contains additional
   * metadata related to the request. In this case, it may contain an `authorization` property that
   * holds the JWT token that needs to be invalidated. If `token` is not provided, the function will
   * attempt to extract the token from `meta
   *
   * @returns a Promise that resolves to the string 'OK'.
   */
  async logout({ token }: Token, meta?: Metadata): Promise<'OK'> {
    if (!token && meta) token = meta.authorization;

    const jwtToken = this.jwtService.verify<JwtToken>(AES.decrypt(token));

    return await this.blacklisted.put(jwtToken.session, {
      prefix: AUTH_CACHE_TOKEN_KEY,
      ttl: CLIENT_TTL.MAXIMUM_REFRESH_TOKEN,
    });
  }

  /**
   * This is an asynchronous function that decrypts a token using AES encryption and returns a Promise
   * containing a verified JWT token.
   *
   * @param {Token}  - - `token`: a string representing the encrypted JWT token that needs to be
   * decrypted.
   * @param {Metadata} [meta] - The `meta` parameter is an optional object that contains metadata
   * related to the token. In this case, it may contain an `authorization` property that holds the
   * token to be decrypted. If `meta` is provided and `token` is not, the `authorization` property of
   * `meta` will
   *
   * @returns A Promise that resolves to a decrypted JWT token of type JwtToken.
   */
  async decrypt({ token }: Token, meta?: Metadata): Promise<JwtToken> {
    if (!token && meta) token = meta.authorization;

    return this.jwtService.verify<JwtToken>(AES.decrypt(token));
  }

  /**
   * This function handles different types of authentication requests based on the grant type provided.
   *
   * @param {AuthenticationRequest} data - The `data` parameter is an object of type
   * `AuthenticationRequest` which contains the information required for authentication, such as the
   * user's credentials and the grant type being used.
   * @param {AuthenticationOptions}  - - `data`: an object containing the authentication request data,
   * such as the grant type, username, password, etc.
   *
   * @returns The `handler` function is returning the result of one of the following functions based on
   * the `grant_type` value in the `data` parameter: `this.password`, `this.refreshToken`,
   * `this.clientCredential`, or `this.authorizationCode`. The function being called will receive the
   * `data` parameter and an object containing `metadata`, `client`, and `app` properties as its
   * arguments.
   */
  async handler(
    data: AuthenticationRequest,
    { metadata, client, app }: AuthenticationOptions,
  ) {
    switch (data.grant_type) {
      // case GrantType.OTP:
      //   return await this.otp(data, { metadata, client, app });
      case GrantType.Password:
        return this.password(data, { metadata, client, app });
      case GrantType.RefreshToken:
        return this.refreshToken(data, { metadata, client, app });
      case GrantType.ClientCredential:
        return this.clientCredential(data, { metadata, client, app });
      case GrantType.AuthorizationCode:
        return this.authorizationCode(data, { metadata, client, app });
      default:
        throw new Error('grant type is not supported');
    }
  }

  /**
   * This is an async function that handles password authentication for a user and generates an
   * authentication token.
   *
   * @param {AuthenticationRequest} data - An object containing the authentication request data,
   * including the username or email and password.
   * @param {AuthenticationOptions}  - - `data`: an object containing the authentication request data,
   * including the username or email and password.
   *
   * @returns a Promise that resolves to an AuthenticationResponse object. The specific type of
   * AuthenticationResponse object returned depends on the value of the "response_type" property in the
   * "data" parameter. If "response_type" is set to "ResponseType.Token", the function will return a
   * token-based AuthenticationResponse object generated by the "generateToken" method. Otherwise, it
   * will return a code-based Authentication
   */
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
      return this.generateToken(authToken, { metadata });
    else {
      return this.generateCode(authToken);
    }
  }

  /**
   * This function refreshes an authentication token using a refresh token and verifies the client and
   * user information before generating a new token.
   *
   * @param {AuthenticationRequest} data - An object containing the refresh_token and client_secret
   * needed to refresh an authentication token.
   * @param {AuthenticationOptions}  - - `data`: an object containing the refresh token and client
   * secret
   *
   * @returns a Promise that resolves to an AuthenticationResponse object.
   */
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

    const user = await lastValueFrom(
      this.provider.users.findById({ query: { id: token.uid ?? token.cid } }),
    );

    const entity = isNotEmptyObject(user) ? user : client;

    if (!isAvailable(entity) || !isApplicable(entity))
      throw new Error('user is not available or not applicable');

    const authToken = await this.authToken(data, { client, user, app });

    return await this.generateToken(authToken, {
      session: { id: token.session },
    });
  }

  /**
   * This function handles client credential authentication requests and generates either a code or
   * token based on the response type.
   *
   * @param {AuthenticationRequest} data - The `data` parameter is an object that contains the
   * authentication request data, such as the `client_secret` and `response_type`.
   * @param {AuthenticationOptions}  - - `data`: an object containing the authentication request data,
   * including the `client_secret` and `response_type`.
   *
   * @returns The function `clientCredential` returns a Promise that resolves to an
   * `AuthenticationResponse` object. The specific type of response depends on the `response_type`
   * parameter in the `data` object passed to the function. If `response_type` is set to
   * `ResponseType.Code`, the function will generate a code and return it in the response. If
   * `response_type` is set to `ResponseType.Token`,
   */
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

  /**
   * This is an async function that takes in authentication data and options, checks if a code is
   * valid, retrieves an auth token from Redis, and generates a token.
   *
   * @param {AuthenticationRequest} data - An object containing the authentication request data, which
   * includes a code.
   * @param {AuthenticationOptions}  - - `data`: an object containing the authentication request data,
   * which includes a `code` property.
   *
   * @returns a Promise that resolves to an AuthenticationResponse object.
   */
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

  /**
   * This function generates an authentication token with specified parameters and returns it as a
   * promise.
   *
   * @param {AuthenticationRequest} data - An object containing the authentication request data,
   * including roles, domain, scopes, state, and redirect_uri.
   * @param  - - `data`: an object containing the authentication request data, including roles, domain,
   * scopes, state, and redirect_uri.
   *
   * @returns A Promise that resolves to an object of type `AuthToken`. The object contains a `token`
   * property which is an object with various properties such as `cid`, `aid`, `uid`, `roles`,
   * `domain`, and `scopes`. The object also contains `state`, `redirect_uri`, `access_token_ttl`, and
   * `refresh_token_ttl` properties.
   */
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

  /**
   * This function generates a code using an authentication token and stores it in Redis cache.
   *
   * @param {AuthToken} authToken - The `authToken` parameter is an object that contains information
   * about an authentication token. It has the following properties:
   *
   * @returns An object containing the generated code, the redirect URI, and the state of the provided
   * `authToken`.
   */
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

  /**
   * This is an async function that generates an authentication response with access and refresh
   * tokens.
   *
   * @param {AuthToken} authToken - The authToken parameter is an object that contains information
   * about the user's authentication token, including the token itself, its expiration times, and other
   * metadata.
   * @param options - The `options` parameter is an optional object that can contain two properties:
   *
   * @returns The function `generateToken` returns a Promise that resolves to an
   * `AuthenticationResponse` object. This object contains information about the generated access and
   * refresh tokens, including their encrypted values, token type, domain, session ID, expiration time,
   * role, scope, and state.
   */
  async generateToken(
    authToken: AuthToken,
    options: { session?: Partial<Session>; metadata?: Metadata } = {},
  ): Promise<AuthenticationResponse> {
    const { token, state, access_token_ttl, refresh_token_ttl } = authToken;

    if (!options.session) {
      const { metadata } = options;

      metadata.token = JSON.stringify(token);

      options.session = await lastValueFrom(
        this.provider.sessions.create(
          {
            owner: token.uid ?? token.cid,
            clients: [token.cid],
            created_by: token.uid ?? token.cid,
            created_in: token.aid ?? token.cid,
            agent: metadata['x-user-agent'],
          },
          toGrpcMeta(metadata),
        ),
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

  /**
   * This function validates a client's authentication request by checking their client ID, secret,
   * availability, applicability, domain, and expiration date.
   *
   * @param {AuthenticationRequest} data - The input data for client authentication, which includes the
   * client ID and client secret.
   *
   * @returns The function `validateClient` returns a `Promise` that resolves to a `Client` object.
   */
  async validateClient(data: AuthenticationRequest): Promise<Client> {
    const { client_id, client_secret } = data;

    if (!client_id) throw new Error('client id is required');

    const query: Query<Client> = {
      client_secret,
      $or: [{ client_id }, { _id: client_id }],
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

  /**
   * This function validates an application by checking if it is available and applicable for a given
   * client.
   *
   * @param {Client} client - The `client` parameter is an object of type `Client` which represents the
   * client making the authentication request.
   * @param {AuthenticationRequest} data - The `data` parameter is an object of type
   * `AuthenticationRequest` which contains information related to the authentication request being
   * validated.
   *
   * @returns The function `validateApplication` returns either `null` or an `App` object.
   */
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
