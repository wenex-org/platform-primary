import { AppInterface } from '@app/common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { App, AppDocument } from './schemas';

@Injectable()
export class AppsRepository extends Repository<AppInterface> {
  constructor(@InjectModel(App.name) readonly model: Model<AppDocument>) {
    super(model);
  }
}
