import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UpdateOneDto } from '@app/common/dto';
import { Type } from 'class-transformer';

import { UpdateGrantDto } from './update-grant.dto';
import { GrantDocument } from '../schemas';

export class UpdateGrantOneDto extends UpdateOneDto<GrantDocument> {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateGrantDto)
  update: UpdateGrantDto;
}
