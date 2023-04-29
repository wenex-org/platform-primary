import { MONGO_CONFIG } from '@app/common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { GrantsController } from './grants.controller';
import { GrantsRepository } from './grants.repository';
import { GrantsService } from './grants.service';
import { Grant, GrantSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_CONFIG()),
    MongooseModule.forFeature([{ name: Grant.name, schema: GrantSchema }]),
  ],
  controllers: [GrantsController],
  providers: [GrantsService, GrantsRepository],
})
export class GrantsModule {}
