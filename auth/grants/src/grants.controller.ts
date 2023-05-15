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
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<GrantSerializer> {
    const subject = new Subject<GrantSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(GrantSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(GrantsService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<GrantsSerializer> {
    return GrantsSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(GrantsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateGrantOneDto,
  ): Promise<GrantSerializer> {
    return GrantSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(GrantsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateGrantBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
