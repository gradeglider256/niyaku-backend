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

export class BusinessRepresentativeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional()
  nin?: string;
}

export class DocumentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: ['national-id', 'pay-slip', 'employment-letter', 'other'],
  })
  documentType: string;

  @ApiProperty({ enum: ['pdf', 'docs', 'jpg', 'jpeg', 'png', 'webp'] })
  fileType: string;

  @ApiProperty()
  uploadedAt: Date;
}

export class ClientResponseDto {
  @ApiProperty({ description: 'Client UUID' })
  id: string;

  @ApiProperty({ enum: ['individual', 'business'] })
  type: string;

  // Individual Fields
  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  middleName?: string;

  @ApiPropertyOptional({ description: 'NIN (Individual Only)' })
  nin?: string;

  // Business Fields
  @ApiPropertyOptional()
  businessName?: string;

  @ApiPropertyOptional()
  registrationNumber?: string;

  @ApiPropertyOptional()
  businessType?: string;

  @ApiProperty()
  branchID: number;

  @ApiProperty({ type: [AddressResponseDto] })
  addresses: AddressResponseDto[];

  @ApiProperty({ type: [ContactResponseDto] })
  contacts: ContactResponseDto[];

  @ApiPropertyOptional({ type: [BusinessRepresentativeResponseDto] })
  representatives?: BusinessRepresentativeResponseDto[];

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
