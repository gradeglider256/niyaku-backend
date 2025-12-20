import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadDto {
    @ApiProperty({
        enum: ['national-id', 'pay-slip', 'employment-letter', 'other'],
    })
    @IsEnum(['national-id', 'pay-slip', 'employment-letter', 'other'])
    @IsNotEmpty()
    documentType: 'national-id' | 'pay-slip' | 'employment-letter' | 'other';

    @ApiProperty({ description: 'Base64 encoded file content' })
    @IsString()
    @IsNotEmpty()
    fileContent: string;

    @ApiProperty({ description: 'Original filename with extension' })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({ description: 'MIME type of the file (e.g., image/png, application/pdf)' })
    @IsString()
    @IsNotEmpty()
    mimeType: string;
}
