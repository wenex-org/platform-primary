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
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

import { CreateGrantDto, UpdateGrantBulkDto, UpdateGrantOneDto } from './dto';
import { GrantSerializer, GrantsSerializer } from './serializers';
import { GrantsService } from './grants.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class GrantsController {
  constructor(private readonly service: GrantsService) {}

  @GrpcMethod(GrantsService.name)
  async count(@Filter() filter: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(GrantsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  cursor(@Filter() filter: FilterDto): Observable<GrantSerializer> {
    const subject = new Subject<GrantSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(GrantSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(GrantsService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(GrantsService.name)
  async findMany(@Filter() filter: FilterDto): Promise<GrantsSerializer> {
    return GrantsSerializer.build(await this.service.findMany(filter));
  }

  @GrpcMethod(GrantsService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(GrantsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(GrantsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.restoreById(filter, meta));
  }

  @GrpcMethod(GrantsService.name)
  async destroyById(@Filter() filter: OneFilterDto): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(GrantsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateGrantOneDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(GrantsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateGrantBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
