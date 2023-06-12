import { GrantInterface } from '@app/common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Grant, GrantDocument } from './schemas';

@Injectable()
export class GrantsRepository extends Repository<GrantInterface> {
  constructor(@InjectModel(Grant.name) readonly model: Model<GrantDocument>) {
    super(model);
  }
}
