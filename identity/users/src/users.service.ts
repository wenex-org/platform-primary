import { UserInterface } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Service } from '@app/common/core';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService extends Service<UserInterface> {
  constructor(readonly repository: UsersRepository) {
    super(repository);
  }
}
