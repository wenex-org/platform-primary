import { ClientInterface } from '@app/common/interfaces';
import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService extends Service<ClientInterface> {
  constructor(readonly repository: ClientsRepository) {
    super(repository);
  }
}
