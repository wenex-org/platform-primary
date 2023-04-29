import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateSubDto } from '@app/common/dto';

export class CreateTimeDto extends CreateSubDto<CreateTimeDto> {
  @IsString()
  @IsNotEmpty()
  cron_exp: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;
}
