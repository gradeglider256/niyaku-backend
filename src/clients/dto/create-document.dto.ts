import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
    @ApiProperty({
        enum: ['national-id', 'pay-slip', 'employment-letter', 'other'],
    })
    @IsEnum(['national-id', 'pay-slip', 'employment-letter', 'other'])
    @IsNotEmpty()
    documentType: 'national-id' | 'pay-slip' | 'employment-letter' | 'other';

    @ApiProperty({
        enum: ['pdf', 'docs', 'jpg', 'jpeg', 'png', 'webp'],
    })
    @IsEnum(['pdf', 'docs', 'jpg', 'jpeg', 'png', 'webp'])
    @IsNotEmpty()
    fileType: 'pdf' | 'docs' | 'jpg' | 'jpeg' | 'png' | 'webp';
}
