import { CreateDto } from '@app/common/dto';
import { Action, Resource } from '@app/common/enums';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateTimeDto } from './create-time.dto';

export class CreateGrantDto extends CreateDto<CreateGrantDto> {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  @IsEnum(Action)
  action: Action;

  @IsNotEmpty()
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
  @Type(() => CreateTimeDto)
  @ValidateNested({ each: true })
  time?: CreateTimeDto[];
}
