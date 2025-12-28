import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  isHeadOffice: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  countryName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  countryCode: string; // e.g., 'UG'

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  address: string;

  @IsString()
  @IsOptional()
  @Length(1, 15)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @Length(1, 255)
  email?: string;
}
