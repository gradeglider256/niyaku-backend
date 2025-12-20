import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({ enum: ['email', 'mobile', 'home', 'work'] })
    @IsEnum(['email', 'mobile', 'home', 'work'])
    contactType: 'email' | 'mobile' | 'home' | 'work';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    contact: string;
}
