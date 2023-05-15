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
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateAppDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(AppsService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<AppSerializer> {
    const subject = new Subject<AppSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(AppSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(AppsService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<AppsSerializer> {
    return AppsSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(AppsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateAppOneDto,
  ): Promise<AppSerializer> {
    return AppSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(AppsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateAppBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
