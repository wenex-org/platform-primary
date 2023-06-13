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
  async count(@Filter() filter: QueryFilterDto): Promise<TotalSerializer> {
    return TotalSerializer.build(await this.service.count(filter));
  }

  @GrpcMethod(ProfilesService.name)
  async create(
    @Meta() meta: Metadata,
    @Body() data: CreateProfileDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.create(data, meta));
  }

  @GrpcMethod(ProfilesService.name)
  cursor(@Filter() filter: FilterDto): Observable<ProfileSerializer> {
    const subject = new Subject<ProfileSerializer>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ProfileSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ProfilesService.name)
  async findOne(@Filter() filter: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findOne(filter));
  }

  @GrpcMethod(ProfilesService.name)
  async find(@Filter() filter: FilterDto): Promise<ProfilesSerializer> {
    return ProfilesSerializer.build(await this.service.find(filter));
  }

  @GrpcMethod(ProfilesService.name)
  async findById(@Filter() filter: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findById(filter));
  }

  @GrpcMethod(ProfilesService.name)
  async deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.deleteById(filter, meta));
  }

  @GrpcMethod(ProfilesService.name)
  async restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(
      await this.service.restoreById(filter, meta),
    );
  }

  @GrpcMethod(ProfilesService.name)
  async destroyById(
    @Filter() filter: OneFilterDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.destroyById(filter));
  }

  @GrpcMethod(ProfilesService.name)
  async updateById(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateProfileOneDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(
      await this.service.updateById(filter, update, meta),
    );
  }

  @GrpcMethod(ProfilesService.name)
  async updateBulk(
    @Meta() meta: Metadata,
    @Body() { filter, update }: UpdateProfileBulkDto,
  ): Promise<TotalSerializer> {
    return TotalSerializer.build(
      await this.service.updateBulk(filter, update, meta),
    );
  }
}
