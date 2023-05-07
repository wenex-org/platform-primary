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
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ConfigsController {
  constructor(private readonly service: ConfigsService) {}

  @GrpcMethod(ConfigsService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(ConfigsService.name)
  async create(@Body() data: CreateConfigDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(ConfigsService.name)
  cursor(@Body() data: FilterDto): Observable<ConfigSerializer> {
    const subject = new Subject<ConfigSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ConfigSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ConfigsService.name)
  async findOne(@Body() data: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(ConfigsService.name)
  async findMany(@Body() data: FilterDto): Promise<ConfigsSerializer> {
    return ConfigsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(ConfigsService.name)
  async findById(@Body() data: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(ConfigsService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(ConfigsService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<ConfigSerializer> {
    return ConfigSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(ConfigsService.name)
  async updateById(
    @Body() data: UpdateConfigOneDto,
  ): Promise<ConfigSerializer> {
    return ConfigSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(ConfigsService.name)
  async updateBulk(
    @Body() data: UpdateConfigBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
