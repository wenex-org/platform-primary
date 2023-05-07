import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { AppsRepository } from './apps.repository';
import { App } from './schemas';

@Injectable()
export class AppsService extends Service<App> {
  constructor(readonly repository: AppsRepository) {
    super(repository);
  }
}
