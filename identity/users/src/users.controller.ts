import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CountFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { MetadataBindInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { CountSerializer } from '@app/common/serializers';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Meta } from '@app/common/decorators';
import { Metadata } from '@grpc/grpc-js';

import { CreateUserDto, UpdateUserBulkDto, UpdateUserOneDto } from './dto';
import { UserSerializer, UsersSerializer } from './serializers';
import { UsersService } from './users.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @GrpcMethod(UsersService.name)
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(UsersService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<UserSerializer> {
    const subject = new Subject<UserSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(UserSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(UsersService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<UsersSerializer> {
    return UsersSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(UsersService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateUserOneDto,
  ): Promise<UserSerializer> {
    return UserSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(UsersService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateUserBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
