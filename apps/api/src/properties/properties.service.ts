import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(landlordId: string, dto: CreatePropertyDto) {
        return this.prisma.property.create({
            data: {
                ...dto,
                landlordId,
            },
        });
    }

    async addMedia(propertyId: string, url: string) {
        return this.prisma.media.create({
            data: {
                propertyId,
                url,
            },
        });
    }

    async findAll(filters: any) {
        const { county, town, minPrice, maxPrice, bedrooms, type } = filters;
        return this.prisma.property.findMany({
            where: {
                status: 'AVAILABLE',
                county: county || undefined,
                town: town || undefined,
                price: {
                    gte: minPrice ? parseFloat(minPrice) : undefined,
                    lte: maxPrice ? parseFloat(maxPrice) : undefined,
                },
                bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
                type: type || undefined,
            },
            include: {
                media: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                media: true,
                landlord: {
                    select: {
                        id: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        return property;
    }
}
