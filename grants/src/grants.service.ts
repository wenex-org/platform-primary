import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { CreateGrantDto, UpdateGrantDto } from './dto';
import { GrantsRepository } from './grants.repository';
import { Grant } from './schemas';

@Injectable()
export class GrantsService extends Service<
  Grant,
  CreateGrantDto,
  UpdateGrantDto
> {
  constructor(readonly repository: GrantsRepository) {
    super(repository);
  }
}
