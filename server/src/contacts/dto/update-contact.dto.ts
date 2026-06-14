import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateContactDto {
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
