import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Action, Resource } from '@app/common/enums';
import { UpdateDto } from '@app/common/dto';
import { Type } from 'class-transformer';

import { UpdateTimeDto } from './update-time.dto';

export class UpdateGrantDto extends UpdateDto<UpdateGrantDto> {
  @IsString()
  @IsOptional()
  subject: string;

  @IsOptional()
  @IsEnum(Action)
  action: Action;

  @IsOptional()
  @IsEnum(Resource)
  object: Resource;

  @IsOptional()
  @IsString({ each: true })
  field?: string[];

  @IsOptional()
  @IsString({ each: true })
  filter?: string[];

  @IsOptional()
  @IsString({ each: true })
  location?: string[];

  @IsOptional()
  @Type(() => UpdateTimeDto)
  @ValidateNested({ each: true })
  times?: UpdateTimeDto[];
}
