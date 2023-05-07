import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { ClientsRepository } from './clients.repository';
import { Client } from './schemas';

@Injectable()
export class ClientsService extends Service<Client> {
  constructor(readonly repository: ClientsRepository) {
    super(repository);
  }
}
