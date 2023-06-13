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
  async count(@Filter() filter: QueryFilterDto): Promise<TotalSerializer> {
    return TotalSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(ConfigsService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(ConfigsService.name)
  cursor(@Filter() filter: FilterDto): Observable<ConfigSerializer> {
    const subject = new Subject<ConfigSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ConfigSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ConfigsService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(ConfigsService.name)
  async find(@Filter() filter: FilterDto): Promise<ConfigsSerializer> {
    return ConfigsSerializer.build(await this.service.find(filter));
  }

  @GrpcMethod(ConfigsService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(ConfigsService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.restoreById(filter, meta));
  }

  @GrpcMethod(ConfigsService.name)
  async destroyById(@Filter() filter: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(ConfigsService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateConfigOneDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(ConfigsService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateConfigBulkDto,
  ): Promise<TotalSerializer> {
    return TotalSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
