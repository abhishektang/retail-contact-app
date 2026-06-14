import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
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
  note?: string;
}
