import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(
    /^(\+?61|0)[2-478](\d{8}|\d{4}\s?\d{4})$|^(\+?61|0)4\d{2}\s?\d{3}\s?\d{3}$|^(\+?61|0)4\d{8}$|^1[38]00\s?\d{3}\s?\d{3}$|^13\s?\d{4}$/,
    { message: 'Please provide a valid Australian phone number' },
  )
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Note must not exceed 1000 characters' })
  note?: string;
}
