import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  Min,
  // IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 1. Create a sub-dto for the salary details to be used inside employment
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

export class CreateEmploymentHistoryDto {
  @ApiProperty({ description: 'Client ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  clientID: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  branchID: number;

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
  @ValidateNested({ each: true }) // 'each: true' tells class-validator to check every item in the array
  @Type(() => CreateSalaryDetailsDto)
  @IsNotEmpty()
  salaries: CreateSalaryDetailsDto[];
}

export class CreateSalaryHistoryDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  employmentHistoryID: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  allowances?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  deductions?: number;

  @ApiProperty({ description: 'Full month name or abbreviated' })
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiPropertyOptional({ example: '2023-01-28' })
  @IsDateString()
  @IsOptional()
  payDate?: string;
}

export class CreateCompanyEarningsDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  clientID: string;

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

export class CreateAssessmentRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  clientID: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  crbScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  liabilities?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  findings?: string;
}
