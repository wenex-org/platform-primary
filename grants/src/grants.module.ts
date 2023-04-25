import { Module } from '@nestjs/common';
import { GrantsController } from './grants.controller';
import { GrantsService } from './grants.service';

@Module({
  imports: [],
  controllers: [GrantsController],
  providers: [GrantsService],
})
export class GrantsModule {}
