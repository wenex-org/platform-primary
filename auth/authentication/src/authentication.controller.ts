import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { MetadataTokenInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@grpc/grpc-js';

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
    data: AuthenticationDto,
    metadata: Metadata,
  ): Promise<AuthenticationSerializer> {
    return AuthenticationSerializer.build(
      await this.service.token(data, metadata),
    );
  }

  @GrpcMethod(AuthenticationService.name)
  @UseInterceptors(MetadataTokenInterceptor)
  async decrypt({ token }: TokenDto): Promise<JwtTokenSerializer> {
    return JwtTokenSerializer.build(await this.service.decrypt(token));
  }

  @GrpcMethod(AuthenticationService.name)
  @UseInterceptors(MetadataTokenInterceptor)
  async logout({ token }: TokenDto): Promise<ResultSerializer> {
    return ResultSerializer.build(await this.service.logout(token));
  }
}
