import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { User } from './schemas';

@Injectable()
export class UsersService extends Service<User> {
  constructor(readonly repository: UsersRepository) {
    super(repository);
  }
}
