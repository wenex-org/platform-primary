import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { QueryFilterDto, FilterDto, OneFilterDto } from '@app/common/dto';
import { MetadataBindInterceptor } from '@app/common/interceptors';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TotalSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
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
  async count(@Filter() filter: QueryFilterDto): Promise<TotalSerializer> {
    return TotalSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(SessionsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateSessionDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(SessionsService.name)
  cursor(@Filter() filter: FilterDto): Observable<SessionSerializer> {
    const subject = new Subject<SessionSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(SessionSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(SessionsService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(SessionsService.name)
  async find(@Filter() filter: FilterDto): Promise<SessionsSerializer> {
    return SessionsSerializer.build(await this.service.find(filter));
  }

  @GrpcMethod(SessionsService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(SessionsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(SessionsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(
      await this.service.restoreById(filter, meta),
    );
  }

  @GrpcMethod(SessionsService.name)
  async destroyById(
    @Filter() filter: OneFilterDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(SessionsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateSessionOneDto,
  ): Promise<SessionSerializer> {
    return SessionSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(SessionsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateSessionBulkDto,
  ): Promise<TotalSerializer> {
    return TotalSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
