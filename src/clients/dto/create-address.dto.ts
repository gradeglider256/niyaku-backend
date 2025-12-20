import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
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
