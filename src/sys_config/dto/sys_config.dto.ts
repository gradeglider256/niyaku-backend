import { IsNumber, IsInt, Min, Max } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50000)
  minAmount: number;

  @IsInt()
  @Min(6)
  minTenure: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(12)
  @Max(100)
  defaultInterestRate: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(100000000)
  maximumLoan: number;

  @IsInt()
  @Min(60)
  maxTenure: number;

  @IsInt()
  @Min(0)
  gracePeriod: number;
}
