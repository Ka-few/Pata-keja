import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyStatus, VerificationStatus } from '@prisma/client';

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

    async removeAllMedia(propertyId: string) {
        return this.prisma.media.deleteMany({
            where: { propertyId },
        });
    }

    async findAll(filters: any) {
        const { county, town, minPrice, maxPrice, bedrooms, type, verificationStatus } = filters;
        return this.prisma.property.findMany({
            where: {
                status: 'AVAILABLE',
                verificationStatus: verificationStatus || undefined,
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

    async update(id: string, userId: string, role: string, dto: any) {
        const property = await this.findOne(id);
        if (property.landlordId !== userId && role !== 'ADMIN') {
            throw new NotFoundException('Property not found or unauthorized');
        }

        return this.prisma.property.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string, role: string) {
        const property = await this.findOne(id);
        if (property.landlordId !== userId && role !== 'ADMIN') {
            throw new NotFoundException('Property not found or unauthorized');
        }

        return this.prisma.property.delete({
            where: { id },
        });
    }

    // ── Admin moderation ──────────────────────────────────────────────────────

    /** Admin: get ALL properties regardless of status */
    async findAllAdmin() {
        return this.prisma.property.findMany({
            include: {
                media: true,
                landlord: { select: { id: true, email: true, phoneNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Admin: change property status */
    async updateStatus(id: string, status: PropertyStatus) {
        await this.ensurePropertyExists(id);
        return this.prisma.property.update({
            where: { id },
            data: { status },
            include: { media: true },
        });
    }

    /** Admin: change property verificationStatus */
    async updateVerification(id: string, verificationStatus: VerificationStatus) {
        await this.ensurePropertyExists(id);
        return this.prisma.property.update({
            where: { id },
            data: { verificationStatus },
            include: { media: true },
        });
    }

    private async ensurePropertyExists(id: string) {
        const p = await this.prisma.property.findUnique({ where: { id } });
        if (!p) throw new NotFoundException(`Property ${id} not found`);
        return p;
    }
}
