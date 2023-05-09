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
  async token(
    @Body() data: AuthenticationDto,
  ): Promise<AuthenticationSerializer> {
    return AuthenticationSerializer.build(await this.service.token(data));
  }

  @GrpcMethod(AuthenticationService.name)
  async logout(@Body() { token }: TokenDto): Promise<ResultSerializer> {
    return ResultSerializer.build(await this.service.logout(token));
  }

  @GrpcMethod(AuthenticationService.name)
  async decrypt(@Body() { token }: TokenDto): Promise<JwtTokenSerializer> {
    return JwtTokenSerializer.build(await this.service.decrypt(token));
  }
}
