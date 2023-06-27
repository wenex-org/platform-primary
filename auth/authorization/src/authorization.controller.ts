import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ValidationPipe } from '@app/common/pipes';
import { mapToInstance } from '@app/common/utils';
import { Meta } from '@app/common/decorators';
import { Metadata } from '@grpc/grpc-js';
import { Observable, from } from 'rxjs';

import { AuthorizationService } from './authorization.service';
import { AuthorizationSerializer } from './serializers';
import { AuthorizationDto } from './dto';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AuthorizationController {
  constructor(private readonly service: AuthorizationService) {}

  @GrpcMethod(AuthorizationService.name)
  can(
    @Meta() meta: Metadata,
    @Body() auth: AuthorizationDto,
  ): Observable<AuthorizationSerializer> {
    return from(this.service.can(auth, meta)).pipe(
      mapToInstance(AuthorizationSerializer),
    );
  }
}
