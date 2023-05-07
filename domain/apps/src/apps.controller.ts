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

import { CreateAppDto, UpdateAppBulkDto, UpdateAppOneDto } from './dto';
import { AppSerializer, AppsSerializer } from './serializers';
import { AppsService } from './apps.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class AppsController {
  constructor(private readonly service: AppsService) {}

  @GrpcMethod(AppsService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(AppsService.name)
  async create(@Body() data: CreateAppDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(AppsService.name)
  cursor(@Body() data: FilterDto): Observable<AppSerializer> {
    const subject = new Subject<AppSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(AppSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(AppsService.name)
  async findOne(@Body() data: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(AppsService.name)
  async findMany(@Body() data: FilterDto): Promise<AppsSerializer> {
    return AppsSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(AppsService.name)
  async findById(@Body() data: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(AppsService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(AppsService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<AppSerializer> {
    return AppSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(AppsService.name)
  async updateById(@Body() data: UpdateAppOneDto): Promise<AppSerializer> {
    return AppSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(AppsService.name)
  async updateBulk(@Body() data: UpdateAppBulkDto): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
