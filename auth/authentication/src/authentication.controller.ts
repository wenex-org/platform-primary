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
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { Observable, from } from 'rxjs';

import {
  AuthenticationSerializer,
  JwtTokenSerializer,
  ResultSerializer,
} from './serializers';
import { AuthenticationService } from './authentication.service';
import { AuthenticationDto, TokenDto } from './dto';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AuthenticationController {
  constructor(private readonly service: AuthenticationService) {}

  @GrpcMethod(AuthenticationService.name)
  token(
    @Meta() meta: Metadata,
    @Body() data: AuthenticationDto,
  ): Observable<AuthenticationSerializer> {
    return from(this.service.token(data, meta)).pipe(
      mapToInstance(AuthenticationSerializer),
    );
  }

  @GrpcMethod(AuthenticationService.name)
  decrypt(
    @Meta() meta: Metadata,
    @Body() token: TokenDto,
  ): Observable<JwtTokenSerializer> {
    return from(this.service.decrypt(token, meta)).pipe(
      mapToInstance(JwtTokenSerializer),
    );
  }

  @GrpcMethod(AuthenticationService.name)
  logout(
    @Meta() meta: Metadata,
    @Body() token: TokenDto,
  ): Observable<ResultSerializer> {
    return from(this.service.logout(token, meta)).pipe(
      mapToInstance(ResultSerializer, 'result'),
    );
  }
}
