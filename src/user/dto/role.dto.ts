import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RoleDto {
    @IsString()
    @IsNotEmpty()
    userID: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    roleIDs: string[];
}

export class AddRoleDto extends RoleDto { }
export class RemoveRoleDto extends RoleDto { }


export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    roleName: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    permissionIDs: number[];
}
