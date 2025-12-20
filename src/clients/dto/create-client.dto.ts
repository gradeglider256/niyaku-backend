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
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

class EmploymentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    employer: string;

    @ApiProperty({ enum: ['current', 'terminated'] })
    @IsEnum(['current', 'terminated'])
    status: 'current' | 'terminated';

    @ApiProperty({ enum: ['self-employed', 'part-time', 'full-time', 'contract'] })
    @IsEnum(['self-employed', 'part-time', 'full-time', 'contract'])
    type: 'self-employed' | 'part-time' | 'full-time' | 'contract';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    startedAt: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    contractEnd?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    endedAt?: string;

    @ApiProperty()
    @IsNumber()
    monthlyGeneratedIncome: number;
}

export class CreateClientDto {
    @ApiProperty({ example: '1234567890123456789012', description: 'National ID (NIN)' })
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    id: string; // NIN

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    middleName?: string;

    @ApiPropertyOptional({ description: 'Branch ID - requires branch management permissions if specified' })
    @IsNumber()
    @IsOptional()
    branchID?: number;

    @ApiProperty({ type: [AddressDto], description: 'At least 1 address required' })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AddressDto)
    addresses: AddressDto[];

    @ApiProperty({ type: [ContactDto], description: 'At least 1 mobile contact required', })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ContactDto)
    contacts: ContactDto[];

    @ApiProperty({ type: EmploymentDto })
    @ValidateNested()
    @Type(() => EmploymentDto)
    employment: EmploymentDto;
}
