import {
  Body,
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  QueryFilterDto,
  FilterDto,
  OneFilterDto,
  UniqueFilterDto,
  UpdateProfileUniqueDto,
} from '@app/common/dto';
import { ProfileInterface, Metadata } from '@app/common/interfaces';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { mapToInstance, toInstance } from '@app/common/utils';
import { CacheInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TotalSerializer } from '@app/common/serializers';
import { Filter, Meta } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Observable, Subject, from } from 'rxjs';
import { Cache } from '@app/common/metadatas';

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
  CacheInterceptor,
  ClassSerializerInterceptor,
  new SentryInterceptor({ version: true }),
)
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  @Cache('profiles', 'fill')
  @GrpcMethod(ProfilesService.name)
  count(@Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return this.service
      .count(filter)
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateProfileDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .create(data, meta)
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'fill')
  @GrpcMethod(ProfilesService.name)
  find(@Filter() filter: FilterDto): Observable<ProfilesSerializer> {
    return this.service
      .find(filter)
      .pipe(mapToInstance(ProfilesSerializer, 'array'));
  }

  @GrpcMethod(ProfilesService.name)
  cursor(@Filter() filter: FilterDto): Observable<ProfileSerializer> {
    const subject = new Subject<ProfileInterface>();

    from(this.service.cursor(filter)).subscribe({
      complete: () => subject.complete(),
      next: (value) => subject.next(toInstance(ProfileSerializer, value)),
    });

    return subject.asObservable();
  }

  @Cache('profiles', 'fill')
  @GrpcMethod(ProfilesService.name)
  findOne(@Filter() filter: OneFilterDto): Observable<ProfileSerializer> {
    return this.service.findOne(filter).pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'fill')
  @GrpcMethod(ProfilesService.name)
  findById(@Filter() filter: UniqueFilterDto): Observable<ProfileSerializer> {
    return this.service.findById(filter).pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .deleteOne(filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  deleteById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .deleteById(filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: OneFilterDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .restoreOne(filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  restoreById(
    @Meta() meta: Metadata,
    @Filter() filter: UniqueFilterDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .restoreById(filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  destroyOne(@Filter() filter: OneFilterDto): Observable<ProfileSerializer> {
    return this.service
      .destroyOne(filter)
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  destroyById(
    @Filter() filter: UniqueFilterDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .destroyById(filter)
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  updateOne(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateProfileOneDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .updateOne(data, filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  updateBulk(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateProfileBulkDto,
  ): Observable<TotalSerializer> {
    return this.service
      .updateBulk(data, filter, { meta })
      .pipe(mapToInstance(TotalSerializer, 'total'));
  }

  @Cache('profiles', 'flush')
  @GrpcMethod(ProfilesService.name)
  updateById(
    @Meta() meta: Metadata,
    @Body() { data, filter }: UpdateProfileUniqueDto,
  ): Observable<ProfileSerializer> {
    return this.service
      .updateById(data, filter, { meta })
      .pipe(mapToInstance(ProfileSerializer));
  }
}
