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
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentUploadDto } from './document-upload.dto';

export enum ClientType {
    INDIVIDUAL = 'individual',
    BUSINESS = 'business',
}

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

export class BusinessRepresentativeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    role: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    nin?: string;
}

export class CreateClientDto {
    @ApiProperty({ enum: ClientType })
    @IsEnum(ClientType)
    type: ClientType;

    // Individual Client Fields
    @ApiPropertyOptional({ description: 'Required for Individual clients' })
    @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    nin?: string;

    @ApiPropertyOptional({ description: 'Required for Individual clients' })
    @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
    @IsString()
    @IsNotEmpty()
    firstName?: string;

    @ApiPropertyOptional({ description: 'Required for Individual clients' })
    @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
    @IsString()
    @IsNotEmpty()
    lastName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    middleName?: string;

    // Business Client Fields
    @ApiPropertyOptional({ description: 'Required for Business clients' })
    @ValidateIf((o) => o.type === ClientType.BUSINESS)
    @IsString()
    @IsNotEmpty()
    businessName?: string;

    @ApiPropertyOptional({ description: 'Required for Business clients' })
    @ValidateIf((o) => o.type === ClientType.BUSINESS)
    @IsString()
    @IsNotEmpty()
    registrationNumber?: string;

    @ApiPropertyOptional()
    @ValidateIf((o) => o.type === ClientType.BUSINESS)
    @IsString()
    @IsOptional()
    businessType?: string;

    @ApiPropertyOptional({ type: [BusinessRepresentativeDto], description: 'Required for Business clients' })
    @ValidateIf((o) => o.type === ClientType.BUSINESS)
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BusinessRepresentativeDto)
    representatives?: BusinessRepresentativeDto[];

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

    @ApiProperty({ type: [ContactDto], description: 'At least 1 mobile contact required' })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ContactDto)
    contacts: ContactDto[];

    @ApiPropertyOptional({ type: [DocumentUploadDto], description: 'Optional documents to upload with client creation' })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DocumentUploadDto)
    documents?: DocumentUploadDto[];
}
