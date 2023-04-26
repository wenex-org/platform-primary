import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTimeDto {
  @IsString()
  @IsNotEmpty()
  cron_exp: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  constructor(data?: Partial<CreateTimeDto>) {
    if (data) Object.assign(this, data);
  }
}
