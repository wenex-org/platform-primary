import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { MetadataBindInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ValidationPipe } from '@app/common/pipes';

import { AuthorizationService } from './authorization.service';
import { AuthorizationSerializer } from './serializers';
import { AuthorizationDto } from './dto';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AuthorizationController {
  constructor(private readonly service: AuthorizationService) {}

  @GrpcMethod(AuthorizationService.name)
  async can(auth: AuthorizationDto): Promise<AuthorizationSerializer> {
    return AuthorizationSerializer.build(await this.service.can(auth));
  }
}
