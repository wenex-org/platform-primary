/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { repl } from '@nestjs/core';

import { OtpModule } from './otp.module';

async function bootstrap() {
  await repl(OtpModule);
}
bootstrap();
