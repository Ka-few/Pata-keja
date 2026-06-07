import { IsOptional, IsString, IsNumberString, IsEnum, IsIn } from 'class-validator';
import { PropertyType } from '@prisma/client';
import { ALLOWED_ESTATES } from '../constants/location-constants';

export class PropertySearchDto {
    @IsOptional()
    @IsString()
    county?: string;

    @IsOptional()
    @IsString()
    town?: string;

    @IsOptional()
    @IsString()
    @IsIn(ALLOWED_ESTATES)
    estate?: string;

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
