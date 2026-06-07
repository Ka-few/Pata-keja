import { IsBoolean, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsIn, Max, Min } from 'class-validator';
import { PropertyType } from '@prisma/client';
import { ALLOWED_ESTATES, ALLOWED_TOWNS } from '../constants/location-constants';

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
    @Min(0)
    @Max(3)
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
    @IsIn(ALLOWED_ESTATES, { message: `Estate must be one of the following: ${ALLOWED_ESTATES.join(', ')}` })
    estate: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_TOWNS, { message: `Town must be one of the following: ${ALLOWED_TOWNS.join(', ')}` })
    town: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_TOWNS, { message: `County must be one of the following: ${ALLOWED_TOWNS.join(', ')}` })
    county: string;

    @IsString()
    @IsOptional()
    coordinates?: string;
}
