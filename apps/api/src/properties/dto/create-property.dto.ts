import { IsBoolean, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    price: number;

    @IsNotEmpty()
    deposit: number;

    @IsInt()
    bedrooms: number;

    @IsInt()
    bathrooms: number;

    @IsEnum(PropertyType)
    type: PropertyType;

    @IsBoolean()
    @IsOptional()
    furnished?: boolean;

    @IsString()
    @IsNotEmpty()
    estate: string;

    @IsString()
    @IsNotEmpty()
    town: string;

    @IsString()
    @IsNotEmpty()
    county: string;

    @IsString()
    @IsOptional()
    coordinates?: string;
}
