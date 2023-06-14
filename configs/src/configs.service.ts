import { ConfigInterface } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Service } from '@app/common/core';

import { ConfigsRepository } from './configs.repository';

@Injectable()
export class ConfigsService extends Service<ConfigInterface> {
  constructor(readonly repository: ConfigsRepository) {
    super(repository);
  }
}
