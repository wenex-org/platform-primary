import { ConfigInterface } from '@app/common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Config, ConfigDocument } from './schemas';

@Injectable()
export class ConfigsRepository extends Repository<ConfigInterface> {
  constructor(@InjectModel(Config.name) readonly model: Model<ConfigDocument>) {
    super(model);
  }
}
