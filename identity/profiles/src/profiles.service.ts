import { Service } from '@app/common/core';
import { Injectable } from '@nestjs/common';

import { ProfilesRepository } from './profiles.repository';
import { Profile } from './schemas';

@Injectable()
export class ProfilesService extends Service<Profile> {
  constructor(readonly repository: ProfilesRepository) {
    super(repository);
  }
}
