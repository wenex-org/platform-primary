import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { SessionsRepository } from './sessions.repository';
import { Session } from './schemas';

@Injectable()
export class SessionsService extends Service<Session> {
  constructor(readonly repository: SessionsRepository) {
    super(repository);
  }
}
