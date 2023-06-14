import { AppInterface } from '@app/common/interfaces';
import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { AppsRepository } from './apps.repository';

@Injectable()
export class AppsService extends Service<AppInterface> {
  constructor(readonly repository: AppsRepository) {
    super(repository);
  }
}
