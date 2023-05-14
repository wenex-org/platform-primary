import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CountFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { CountSerializer } from '@app/common/serializers';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';

import { CreateUserDto, UpdateUserBulkDto, UpdateUserOneDto } from './dto';
import { UserSerializer, UsersSerializer } from './serializers';
import { UsersService } from './users.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @GrpcMethod(UsersService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(UsersService.name)
  async create(@Body() data: CreateUserDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(UsersService.name)
  cursor(@Body() data: FilterDto): Observable<UserSerializer> {
    const subject = new Subject<UserSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(UserSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(UsersService.name)
  async findOne(@Body() data: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(UsersService.name)
  async findMany(@Body() data: FilterDto): Promise<UsersSerializer> {
    return UsersSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(UsersService.name)
  async findById(@Body() data: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(UsersService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(UsersService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(UsersService.name)
  async destroyById(@Body() data: OneFilterDto): Promise<UserSerializer> {
    return UserSerializer.build(await this.service.destroyById(data));
  }

  @GrpcMethod(UsersService.name)
  async updateById(@Body() data: UpdateUserOneDto): Promise<UserSerializer> {
    return UserSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(UsersService.name)
  async updateBulk(@Body() data: UpdateUserBulkDto): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
