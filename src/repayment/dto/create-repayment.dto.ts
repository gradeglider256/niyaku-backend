import {
    IsNumber,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsDateString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRepaymentDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    loanID: number;

    @ApiProperty()
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    interest?: number;

    @ApiProperty({ example: '2023-01-01' })
    @IsDateString()
    @IsNotEmpty()
    datePaid: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}
