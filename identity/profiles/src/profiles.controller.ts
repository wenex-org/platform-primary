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
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  @GrpcMethod(ProfilesService.name)
  async count(@Body() data: CountFilterDto): Promise<CountSerializer> {
    return CountSerializer.build(await this.service.count(data));
  }

  @GrpcMethod(ProfilesService.name)
  async create(@Body() data: CreateProfileDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.create(data));
  }

  @GrpcMethod(ProfilesService.name)
  cursor(@Body() data: FilterDto): Observable<ProfileSerializer> {
    const subject = new Subject<ProfileSerializer>();

    from(this.service.cursor(data)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(ProfileSerializer.build(value)),
    });

    return subject.asObservable();
  }

  @GrpcMethod(ProfilesService.name)
  async findOne(@Body() data: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findOne(data));
  }

  @GrpcMethod(ProfilesService.name)
  async findMany(@Body() data: FilterDto): Promise<ProfilesSerializer> {
    return ProfilesSerializer.build(await this.service.findMany(data));
  }

  @GrpcMethod(ProfilesService.name)
  async findById(@Body() data: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.findById(data));
  }

  @GrpcMethod(ProfilesService.name)
  async deleteById(@Body() data: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.deleteById(data));
  }

  @GrpcMethod(ProfilesService.name)
  async restoreById(@Body() data: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.restoreById(data));
  }

  @GrpcMethod(ProfilesService.name)
  async destroyById(@Body() data: OneFilterDto): Promise<ProfileSerializer> {
    return ProfileSerializer.build(await this.service.destroyById(data));
  }

  @GrpcMethod(ProfilesService.name)
  async updateById(
    @Body() data: UpdateProfileOneDto,
  ): Promise<ProfileSerializer> {
    return ProfileSerializer.build(
      await this.service.updateById(data.filter, data.update),
    );
  }

  @GrpcMethod(ProfilesService.name)
  async updateBulk(
    @Body() data: UpdateProfileBulkDto,
  ): Promise<CountSerializer> {
    return CountSerializer.build(
      await this.service.updateBulk(data.filter, data.update),
    );
  }
}
