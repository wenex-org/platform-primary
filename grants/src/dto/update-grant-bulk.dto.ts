import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UpdateBulkDto } from '@app/common/dto';
import { Type } from 'class-transformer';

import { UpdateGrantDto } from './update-grant.dto';
import { GrantDocument } from '../schemas';

export class UpdateGrantBulkDto extends UpdateBulkDto<GrantDocument> {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateGrantDto)
  update: UpdateGrantDto;
}
