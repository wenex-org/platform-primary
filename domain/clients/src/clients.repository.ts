import { ClientInterface } from '@app/common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from '@app/common/core';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Client, ClientDocument } from './schemas';

@Injectable()
export class ClientsRepository extends Repository<ClientInterface> {
  constructor(@InjectModel(Client.name) readonly model: Model<ClientDocument>) {
    super(model);
  }
}
