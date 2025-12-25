import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({
    description: 'The ID of the client',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  clientID: string;

  @ApiProperty({ enum: ['salary', 'personal', 'business'] })
  @IsEnum(['salary', 'personal', 'business'])
  type: 'salary' | 'personal' | 'business';

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '12 months' })
  @IsNumber()
  tenure: number;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  interestRate: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  processingFee: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  branchID?: number;
}

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiPropertyOptional({
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'fully_paid'],
  })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'disbursed', 'fully_paid'])
  status?: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'fully_paid';
}

export class DocumentData {
  @ApiProperty()
  @IsString()
  base64Content: string;

  @ApiProperty()
  @IsString()
  originalName: string;

  @ApiProperty()
  @IsString()
  mimeType: string;
}

export class CreateDisbursementDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  loanID: number;

  @ApiProperty({ example: '2023-12-18' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['mobile', 'bank', 'person'] })
  @IsEnum(['mobile', 'bank', 'person'])
  type: 'mobile' | 'bank' | 'person';

  @ApiProperty({ enum: ['mobile', 'bank', 'person'] })
  @IsEnum(['mobile', 'bank', 'person'])
  remarks: 'mobile' | 'bank' | 'person';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  branchID?: number;

  @ApiProperty({ enum: ['pending', 'disbursed'], default: 'pending' })
  @IsOptional()
  @IsEnum(['pending', 'disbursed'])
  status?: 'pending' | 'disbursed';

  // Person
  @ApiPropertyOptional()
  @IsOptional()
  document?: DocumentData;

  // Mobile Money fields
  @ApiPropertyOptional({ enum: ['mtn', 'airtel'] })
  @IsOptional()
  @IsEnum(['mtn', 'airtel'])
  provider?: 'mtn' | 'airtel';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionID?: string;

  // Bank fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string;

  // Shared / Person fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class ConfirmDisbursementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionID?: string;

  @ApiPropertyOptional()
  @IsOptional()
  document?: DocumentData;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ enum: ['mtn', 'airtel'] })
  @IsOptional()
  @IsEnum(['mtn', 'airtel'])
  provider?: 'mtn' | 'airtel';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string;
}

export class UpdateDisbursementDto extends PartialType(CreateDisbursementDto) { }

export class DisbursementResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  loanID: number;

  @ApiProperty({ enum: ['pending', 'disbursed'] })
  status: 'pending' | 'disbursed';

  @ApiProperty()
  branchID: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  remarks: string;

  @ApiPropertyOptional()
  provider?: string;

  @ApiPropertyOptional()
  mobileNumber?: string;

  @ApiPropertyOptional()
  bankName?: string;

  @ApiPropertyOptional()
  accountNumber?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  transactionID?: string;

  @ApiPropertyOptional()
  signedDocumentID?: string;
}

export class LoanResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  clientID: string;

  @ApiProperty()
  branchID: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  tenure: string;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  processingFee: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [DisbursementResponseDto] })
  disbursements: DisbursementResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
