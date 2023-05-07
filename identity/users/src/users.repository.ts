import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(@InjectModel(User.name) readonly model: Model<UserDocument>) {
    super(model);
  }
}
