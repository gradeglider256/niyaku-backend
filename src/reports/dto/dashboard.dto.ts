import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, ValidateNested, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// TypeScript Interface (for frontend consumption)
export interface DashboardResponse {
    metrics: {
        totalLoans: {
            amount?: number;
            count: number;
            percentageChange: number;
        };
        pendingApprovals: {
            count: number;
            percentageChange: number;
        };
        overdueRepayments: {
            count: number;
            percentageChange: number;
        };
        activeLoans: {
            count: number;
            percentageChange: number;
        };
    };
    disbursementsVsRepayments: Array<{
        month: string;
        disbursed: number;
        repaid: number;
    }>;
    loanStatusDistribution: {
        approved: number;
        pending: number;
        rejected: number;
        disbursed: number;
        fullyPaid: number;
    };
    monthlyTrends: Array<{
        month: string;
        disbursed: number;
        repaid: number;
    }>;
}

// Nested DTO Classes
class MetricValue {
    @ApiProperty()
    @IsNumber()
    amount?: number;

    @ApiProperty()
    @IsNumber()
    count: number;

    @ApiProperty()
    @IsNumber()
    percentageChange: number;
}

class Metrics {
    @ApiProperty({ type: MetricValue })
    @ValidateNested()
    @Type(() => MetricValue)
    totalLoans: MetricValue;

    @ApiProperty({ type: MetricValue })
    @ValidateNested()
    @Type(() => MetricValue)
    pendingApprovals: MetricValue;

    @ApiProperty({ type: MetricValue })
    @ValidateNested()
    @Type(() => MetricValue)
    overdueRepayments: MetricValue;

    @ApiProperty({ type: MetricValue })
    @ValidateNested()
    @Type(() => MetricValue)
    activeLoans: MetricValue;
}

class MonthlyData {
    @ApiProperty()
    @IsString()
    month: string;

    @ApiProperty()
    @IsNumber()
    disbursed: number;

    @ApiProperty()
    @IsNumber()
    repaid: number;
}

class LoanStatusDistribution {
    @ApiProperty()
    @IsNumber()
    approved: number;

    @ApiProperty()
    @IsNumber()
    pending: number;

    @ApiProperty()
    @IsNumber()
    rejected: number;

    @ApiProperty()
    @IsNumber()
    disbursed: number;

    @ApiProperty()
    @IsNumber()
    fullyPaid: number;
}

// Main DTO
export class DashboardDto implements DashboardResponse {
    @ApiProperty({ type: Metrics })
    @ValidateNested()
    @Type(() => Metrics)
    metrics: Metrics;

    @ApiProperty({ type: [MonthlyData] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonthlyData)
    disbursementsVsRepayments: MonthlyData[];

    @ApiProperty({ type: LoanStatusDistribution })
    @ValidateNested()
    @Type(() => LoanStatusDistribution)
    loanStatusDistribution: LoanStatusDistribution;

    @ApiProperty({ type: [MonthlyData] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonthlyData)
    monthlyTrends: MonthlyData[];
}
