import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    district: string;

    @ApiProperty()
    address: string;

    @ApiPropertyOptional()
    county?: string;

    @ApiPropertyOptional()
    subcounty?: string;

    @ApiPropertyOptional()
    parish?: string;

    @ApiProperty()
    city: string;
}

export class ContactResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: ['email', 'mobile', 'home', 'work'] })
    contactType: string;

    @ApiProperty()
    contact: string;
}

export class EmploymentResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    employer: string;

    @ApiProperty({ enum: ['current', 'terminated'] })
    status: string;

    @ApiProperty({ enum: ['self-employed', 'part-time', 'full-time', 'contract'] })
    type: string;

    @ApiProperty()
    startedAt: string;

    @ApiPropertyOptional()
    contractEnd?: string;

    @ApiPropertyOptional()
    endedAt?: string;

    @ApiProperty()
    monthlyGeneratedIncome: number;
}

export class DocumentResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: ['national-id', 'pay-slip', 'employment-letter', 'other'] })
    documentType: string;

    @ApiProperty({ enum: ['pdf', 'docs', 'jpg', 'jpeg', 'png', 'webp'] })
    fileType: string;

    @ApiProperty()
    uploadedAt: Date;
}

export class ClientResponseDto {
    @ApiProperty({ description: 'National ID (NIN)' })
    id: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiPropertyOptional()
    middleName?: string;

    @ApiProperty()
    branchID: number;

    @ApiProperty({ type: [AddressResponseDto] })
    addresses: AddressResponseDto[];

    @ApiProperty({ type: [ContactResponseDto] })
    contacts: ContactResponseDto[];

    @ApiProperty({ type: [EmploymentResponseDto] })
    employments: EmploymentResponseDto[];

    @ApiProperty({ type: [DocumentResponseDto] })
    documents: DocumentResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class PaginatedClientsResponseDto {
    @ApiProperty({ type: [ClientResponseDto] })
    data: ClientResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
