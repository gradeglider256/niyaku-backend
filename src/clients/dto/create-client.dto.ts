/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
  Length,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateIf,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentUploadDto } from './document-upload.dto';

export enum ClientType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  county?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subcounty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parish?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;
}

class ContactDto {
  @ApiProperty({ enum: ['email', 'mobile', 'home', 'work'] })
  @IsEnum(['email', 'mobile', 'home', 'work'])
  contactType: 'email' | 'mobile' | 'home' | 'work';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contact: string;
}

export class BusinessRepresentativeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nin?: string;
}

// Salary details for employment history
export class CreateSalaryDetailsDto {
  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  allowances?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  deductions?: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @IsNotEmpty()
  year: string;
}

// Employment history for individual clients
export class CreateEmploymentHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employerName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ enum: ['permanent', 'contract', 'casual', 'other'] })
  @IsEnum(['permanent', 'contract', 'casual', 'other'])
  contractType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contractDuration?: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2023-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ enum: ['current', 'past'] })
  @IsEnum(['current', 'past'])
  status: string;

  @ApiProperty({
    type: [CreateSalaryDetailsDto],
    description: 'Array of salary records associated with this employment',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalaryDetailsDto)
  @IsNotEmpty()
  salaries: CreateSalaryDetailsDto[];
}

// Company earnings for business clients
export class CreateCompanyEarningsDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyEarning: number;

  @ApiProperty()
  @IsNumber()
  financialYear: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAudited?: boolean;
}

export class CreateClientDto {
  @ApiProperty({ enum: ClientType })
  @IsEnum(ClientType)
  type: ClientType;

  // Individual Client Fields
  @ApiPropertyOptional({ description: 'Required for Individual clients' })
  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nin?: string;

  @ApiPropertyOptional({ description: 'Required for Individual clients' })
  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Required for Individual clients' })
  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  // Business Client Fields
  @ApiPropertyOptional({ description: 'Required for Business clients' })
  @ValidateIf((o) => o.type === ClientType.BUSINESS)
  @IsString()
  @IsNotEmpty()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Required for Business clients' })
  @ValidateIf((o) => o.type === ClientType.BUSINESS)
  @IsString()
  @IsNotEmpty()
  registrationNumber?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.type === ClientType.BUSINESS)
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiPropertyOptional({
    type: [BusinessRepresentativeDto],
    description: 'Required for Business clients',
  })
  @ValidateIf((o) => o.type === ClientType.BUSINESS)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BusinessRepresentativeDto)
  representatives?: BusinessRepresentativeDto[];

  @ApiPropertyOptional({
    description:
      'Branch ID - requires branch management permissions if specified',
  })
  @IsNumber()
  @IsOptional()
  branchID?: number;

  @ApiProperty({
    type: [AddressDto],
    description: 'At least 1 address required',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @ApiProperty({
    type: [ContactDto],
    description: 'At least 1 mobile contact required',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];

  @ApiPropertyOptional({
    type: [DocumentUploadDto],
    description: 'Optional documents to upload with client creation',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DocumentUploadDto)
  documents?: DocumentUploadDto[];

  // Employment history for Individual clients
  @ApiPropertyOptional({
    type: CreateEmploymentHistoryDto,
    description:
      'Employment history with salary details for Individual clients',
  })
  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @ValidateNested()
  @Type(() => CreateEmploymentHistoryDto)
  @IsOptional()
  employmentHistory?: CreateEmploymentHistoryDto[];

  // Company earnings for Business clients
  @ApiPropertyOptional({
    type: [CreateCompanyEarningsDto],
    description: 'Company earnings history for Business clients',
  })
  @ValidateIf((o) => o.type === ClientType.BUSINESS)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyEarningsDto)
  @IsOptional()
  companyEarnings?: CreateCompanyEarningsDto[];
}
