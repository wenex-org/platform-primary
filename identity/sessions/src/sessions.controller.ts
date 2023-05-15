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

import {
  CreateSessionDto,
  UpdateSessionBulkDto,
  UpdateSessionOneDto,
} from './dto';
import { SessionSerializer, SessionsSerializer } from './serializers';
import { SessionsService } from './sessions.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @GrpcMethod(SessionsService.name)
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateSessionDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<SessionSerializer> {
    const subject = new Subject<SessionSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(SessionSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(SessionsService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<SessionsSerializer> {
    return SessionsSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateSessionOneDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(SessionsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateSessionBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
