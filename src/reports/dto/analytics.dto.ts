import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// TypeScript Interface (for frontend consumption)
export interface AnalyticsResponse {
    metrics: {
        totalDisbursedYTD: number;
        collectionRate: number;
        defaultRate: number;
    };
    monthlyLoanPerformance: Array<{
        month: string;
        numberOfLoans: number;
        amountUGX: number;
    }>;
    collectionVsExpected: Array<{
        month: string;
        expected: number;
        collected: number;
    }>;
}

// Nested DTO Classes
class Metrics {
    @ApiProperty({ description: 'Total amount disbursed year-to-date' })
    @IsNumber()
    totalDisbursedYTD: number;

    @ApiProperty({ description: 'Collection rate as percentage (0-100)' })
    @IsNumber()
    collectionRate: number;

    @ApiProperty({ description: 'Default rate as percentage (0-100)' })
    @IsNumber()
    defaultRate: number;
}

class MonthlyLoanPerformanceData {
    @ApiProperty()
    @IsString()
    month: string;

    @ApiProperty()
    @IsNumber()
    numberOfLoans: number;

    @ApiProperty()
    @IsNumber()
    amountUGX: number;
}

class CollectionVsExpectedData {
    @ApiProperty()
    @IsString()
    month: string;

    @ApiProperty()
    @IsNumber()
    expected: number;

    @ApiProperty()
    @IsNumber()
    collected: number;
}

// Main DTO
export class AnalyticsDto implements AnalyticsResponse {
    @ApiProperty({ type: Metrics })
    @ValidateNested()
    @Type(() => Metrics)
    metrics: Metrics;

    @ApiProperty({ type: [MonthlyLoanPerformanceData] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonthlyLoanPerformanceData)
    monthlyLoanPerformance: MonthlyLoanPerformanceData[];

    @ApiProperty({ type: [CollectionVsExpectedData] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CollectionVsExpectedData)
    collectionVsExpected: CollectionVsExpectedData[];
}
