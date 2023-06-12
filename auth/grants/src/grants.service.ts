import { GrantInterface } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Service } from '@app/common/core';

import { GrantsRepository } from './grants.repository';

@Injectable()
export class GrantsService extends Service<GrantInterface> {
  constructor(readonly repository: GrantsRepository) {
    super(repository);
  }
}
