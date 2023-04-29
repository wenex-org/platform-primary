import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { CreateGrantDto, UpdateGrantDto } from './dto';
import { Grant } from './schemas';

@Injectable()
export class GrantsRepository extends Repository<
  Grant,
  CreateGrantDto,
  UpdateGrantDto
> {}
