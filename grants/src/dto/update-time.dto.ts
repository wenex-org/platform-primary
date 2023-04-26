import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateTimeDto {
  @IsString()
  @IsNotEmpty()
  cron_exp: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  constructor(data?: Partial<UpdateTimeDto>) {
    if (data) Object.assign(this, data);
  }
}
