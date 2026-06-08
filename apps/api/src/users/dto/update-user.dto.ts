import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    phoneNumber?: string;
}
