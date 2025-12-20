import { IsOptional, IsString } from 'class-validator';

export class ChangeProfileDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    middleName?: string;
}
