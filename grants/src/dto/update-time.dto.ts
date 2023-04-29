import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UpdateSubDto } from '@app/common/dto';

export class UpdateTimeDto extends UpdateSubDto<UpdateTimeDto> {
  @IsString()
  @IsNotEmpty()
  cron_exp: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;
}
