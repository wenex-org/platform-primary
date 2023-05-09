import {
  AuthenticationRequest,
  AuthenticationResponse,
  JwtToken,
} from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { AuthenticationProvider } from './authentication.provider';

@Injectable()
export class AuthenticationService {
  constructor(private readonly provider: AuthenticationProvider) {}

  async token(data: AuthenticationRequest): Promise<AuthenticationResponse> {
    throw new Error('not implemented');
  }

  async logout(token: string): Promise<'OK' | 'NOK'> {
    throw new Error('not implemented');
  }

  async decrypt(token: string): Promise<JwtToken> {
    throw new Error('not implemented');
  }
}
