import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLoanDto {
    @ApiProperty({ description: 'The ID of the client', example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    clientID: string;

    @ApiProperty({ enum: ['salary', 'personal', 'business'] })
    @IsEnum(['salary', 'personal', 'business'])
    type: 'salary' | 'personal' | 'business';

    @ApiProperty({ example: 1000000 })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: '12 months' })
    @IsString()
    tenure: string;

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
    @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'disbursed', 'fully_paid'] })
    @IsOptional()
    @IsEnum(['pending', 'approved', 'rejected', 'disbursed', 'fully_paid'])
    status?: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'fully_paid';
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    remarks?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    branchID?: number;

    // Mobile Money fields
    @ApiPropertyOptional({ enum: ['mtn', 'airtel'] })
    @IsOptional()
    @IsEnum(['mtn', 'airtel'])
    provider?: 'mtn' | 'airtel';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mobileNumber?: string;

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    signedDocumentID?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    transactionID?: string;
}

export class UpdateDisbursementDto extends PartialType(CreateDisbursementDto) {
    @ApiPropertyOptional({ enum: ['pending', 'disbursed'] })
    @IsOptional()
    @IsEnum(['pending', 'disbursed'])
    status?: 'pending' | 'disbursed';
}

export class DisbursementResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    loanID: number;

    @ApiProperty()
    branchID: number;

    @ApiProperty()
    date: string;

    @ApiProperty()
    type: string;

    @ApiPropertyOptional()
    remarks?: string;

    @ApiProperty()
    status: string;

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

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
