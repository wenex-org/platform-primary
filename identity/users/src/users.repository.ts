import { UserInterface } from '@app/common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas';

@Injectable()
export class UsersRepository extends Repository<UserInterface> {
  constructor(@InjectModel(User.name) readonly model: Model<UserDocument>) {
    super(model);
  }
}
