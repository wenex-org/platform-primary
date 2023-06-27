/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { ProfilesModule } from './profiles.module';

async function bootstrap() {
  await repl(ProfilesModule);
}
bootstrap();
