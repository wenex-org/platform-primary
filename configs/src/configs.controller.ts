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
  CreateConfigDto,
  UpdateConfigBulkDto,
  UpdateConfigOneDto,
} from './dto';
import { ConfigSerializer, ConfigsSerializer } from './serializers';
import { ConfigsService } from './configs.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ConfigsController {
  constructor(private readonly service: ConfigsService) {}

  @GrpcMethod(ConfigsService.name)
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<ConfigSerializer> {
    const subject = new Subject<ConfigSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ConfigSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ConfigsService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<ConfigsSerializer> {
    return ConfigsSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateConfigOneDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(ConfigsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateConfigBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
