import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Session, SessionDocument } from './schemas';

@Injectable()
export class SessionsRepository extends Repository<Session> {
  constructor(
    @InjectModel(Session.name) readonly model: Model<SessionDocument>,
  ) {
    super(model);
  }
}
