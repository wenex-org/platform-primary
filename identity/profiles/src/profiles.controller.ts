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
  CreateProfileDto,
  UpdateProfileBulkDto,
  UpdateProfileOneDto,
} from './dto';
import { ProfileSerializer, ProfilesSerializer } from './serializers';
import { ProfilesService } from './profiles.service';

@GrpcService()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(
  MetadataBindInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  @GrpcMethod(ProfilesService.name)
  async count(
    @Meta() meta: Metadata,
    @Body() data: CountFilterDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateProfileDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  cursor(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Observable<ProfileSerializer> {
    const subject = new Subject<ProfileSerializer>();

    from(this.service.cursor(data, meta)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ProfileSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ProfilesService.name)
  async findOne(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findOne(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async findMany(
    @Meta() meta: Metadata,
    @Body() data: FilterDto,
  ): Promise<ProfilesSerializer> {
    return ProfilesSerializer.build(await this.service.findMany(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async findById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findById(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.deleteById(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.restoreById(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async destroyById(
    @Meta() meta: Metadata,
    @Body() data: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.destroyById(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() data: UpdateProfileOneDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(
      await this.service.updateById(data.filter, data.update, meta),
    );
  }

  @GrpcMethod(ProfilesService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() data: UpdateProfileBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update, meta),
    );
  }
}
