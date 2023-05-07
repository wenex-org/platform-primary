import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Profile, ProfileDocument } from './schemas';

@Injectable()
export class ProfilesRepository extends Repository<Profile> {
  constructor(
    @InjectModel(Profile.name) readonly model: Model<ProfileDocument>,
  ) {
    super(model);
  }
}
