import { SessionInterface } from '@app/common/interfaces';
import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { SessionsRepository } from './sessions.repository';

@Injectable()
export class SessionsService extends Service<SessionInterface> {
  constructor(readonly repository: SessionsRepository) {
    super(repository);
  }
}
