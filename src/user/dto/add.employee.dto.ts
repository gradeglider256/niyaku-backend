import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Length,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddEmployeeDTO {
  @ApiProperty({
    example: '12345678901234',
    description: '14-character Employee ID',
  })
  @IsString()
  @Length(14, 14)
  id: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Quincy', description: 'Middle Name' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email Address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Mobile Number' })
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of Birth' })
  @IsString()
  dateOfBirth: string;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female'],
    description: 'Gender',
  })
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({ example: 1, description: 'Branch ID' })
  @IsNumber()
  @IsOptional()
  branchID: number;

  @ApiProperty({ example: '2023-01-01', description: 'Date Hired' })
  @IsString()
  dateHired: string;

  @ApiProperty({ example: [1, 2], description: 'Array of Role IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  roles: string[];
}
