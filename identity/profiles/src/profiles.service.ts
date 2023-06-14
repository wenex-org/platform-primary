import { ProfileInterface } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Service } from '@app/common/core';

import { ProfilesRepository } from './profiles.repository';

@Injectable()
export class ProfilesService extends Service<ProfileInterface> {
  constructor(readonly repository: ProfilesRepository) {
    super(repository);
  }
}
