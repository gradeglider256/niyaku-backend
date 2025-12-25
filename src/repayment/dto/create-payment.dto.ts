import {
    IsNumber,
    IsNotEmpty,
    IsString,
    IsDateString,
    Min,
    IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty()
    @IsNumber()
    @Min(0.01)
    amountPaid: number;

    @ApiProperty({ enum: ['mobile-money', 'cash', 'bank', 'cheque'] })
    @IsEnum(['mobile-money', 'cash', 'bank', 'cheque'])
    @IsNotEmpty()
    paymentMethod: 'mobile-money' | 'cash' | 'bank' | 'cheque';

    @ApiProperty({ example: '2023-01-01' })
    @IsDateString()
    @IsNotEmpty()
    paymentDate: string;
}
