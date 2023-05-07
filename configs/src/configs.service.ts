import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { ConfigsRepository } from './configs.repository';
import { Config } from './schemas';

@Injectable()
export class ConfigsService extends Service<Config> {
  constructor(readonly repository: ConfigsRepository) {
    super(repository);
  }
}
