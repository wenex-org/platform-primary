import { JwtToken } from '@app/common/interfaces';

export type AuthToken = {
  token: Omit<JwtToken, 'type' | 'session'>;

  state?: string;
  redirect_uri?: string;

  access_token_ttl: number;
  refresh_token_ttl: number;
};
