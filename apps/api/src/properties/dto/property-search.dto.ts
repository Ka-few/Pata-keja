import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { PropertyType } from '@prisma/client';

export class PropertySearchDto {
    @IsOptional()
    @IsString()
    county?: string;

    @IsOptional()
    @IsString()
    town?: string;

    @IsOptional()
    @IsNumberString()
    minPrice?: string;

    @IsOptional()
    @IsNumberString()
    maxPrice?: string;

    @IsOptional()
    @IsNumberString()
    bedrooms?: string;

    @IsOptional()
    @IsEnum(PropertyType)
    type?: PropertyType;
}
