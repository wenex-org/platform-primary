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
import { CountSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

import { CreateAppDto, UpdateAppBulkDto, UpdateAppOneDto } from './dto';
import { AppSerializer, AppsSerializer } from './serializers';
import { AppsService } from './apps.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AppsController {
  constructor(private readonly service: AppsService) {}

  @GrpcMethod(AppsService.name)
  async count(@Filter() filter: QueryFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(AppsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateAppDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(AppsService.name)
  cursor(@Filter() filter: FilterDto): Observable<AppSerializer> {
    const subject = new Subject<AppSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(AppSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(AppsService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(AppsService.name)
  async findMany(@Filter() filter: FilterDto): Promise<AppsSerializer> {
    return AppsSerializer.build(await this.service.findMany(filter));
  }

  @GrpcMethod(AppsService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(AppsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(AppsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.restoreById(filter, meta));
  }

  @GrpcMethod(AppsService.name)
  async destroyById(@Filter() filter: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(AppsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateAppOneDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(AppsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateAppBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
