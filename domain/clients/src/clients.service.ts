import { ClientInterface } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Service } from '@app/common/core';
import { AES } from '@app/common/helpers';
import { JwtService } from '@nestjs/jwt';

import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService extends Service<ClientInterface> {
  constructor(
    readonly repository: ClientsRepository,
    private readonly jwtService: JwtService,
  ) {
    super(repository);
  }

  generateApiKey(cid: string, whitelist: string[], expiration_date: Date) {
    const expiresIn = expiration_date.getTime() - Date.now();

    return AES.encrypt(
      this.jwtService.sign(
        { cid, whitelist },
        { expiresIn: Math.ceil(expiresIn / 1000) },
      ),
    );
  }
}
