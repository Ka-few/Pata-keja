import { IsBoolean, IsNumber, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsIn, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';
import { ALLOWED_ESTATES, ALLOWED_TOWNS, ALLOWED_COUNTIES } from '../constants/location-constants';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    deposit: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    bedrooms: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    bathrooms: number;

    @IsEnum(PropertyType)
    type: PropertyType;

    // @Transform must run before @IsBoolean so the string is coerced to a boolean first
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    @IsOptional()
    furnished?: boolean;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_ESTATES, { message: `Estate must be one of: ${ALLOWED_ESTATES.join(', ')}` })
    estate: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_TOWNS, { message: `Town must be one of: ${ALLOWED_TOWNS.join(', ')}` })
    town: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_COUNTIES, { message: `County must be one of: ${ALLOWED_COUNTIES.join(', ')}` })
    county: string;

    @IsString()
    @IsOptional()
    coordinates?: string;
}
