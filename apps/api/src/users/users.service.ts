import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto, UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    /** Public: list all REALTORs with their listing counts */
    async findAllAgents() {
        return this.prisma.user.findMany({
            where: { role: 'REALTOR' },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                isVerified: true,
                createdAt: true,
                role: true,
                _count: { select: { properties: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Public: single agent profile + their available listings */
    async findOneAgent(id: string) {
        const agent = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                isVerified: true,
                createdAt: true,
                role: true,
                properties: {
                    where: { status: 'AVAILABLE' },
                    include: { media: true },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { properties: true } },
            },
        });

        if (!agent || (agent.role !== 'REALTOR' && agent.role !== 'ADMIN')) {
            throw new NotFoundException('Agent not found');
        }

        return agent;
    }

    /** Admin: get ALL users (any role) */
    async findAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: { select: { properties: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Admin: update any user's role / email / phone */
    async updateAgent(id: string, dto: UpdateUserDto) {
        await this.ensureExists(id);
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: { id: true, email: true, role: true, phoneNumber: true, isVerified: true },
        });
    }

    /** Admin: ban agent (set isVerified = false) */
    async banAgent(id: string) {
        await this.ensureExists(id);
        return this.prisma.user.update({
            where: { id },
            data: { isVerified: false },
            select: { id: true, email: true, isVerified: true },
        });
    }

    /** Admin: unban agent (set isVerified = true) */
    async unbanAgent(id: string) {
        await this.ensureExists(id);
        return this.prisma.user.update({
            where: { id },
            data: { isVerified: true },
            select: { id: true, email: true, isVerified: true },
        });
    }

    /** Admin: hard-delete a user and all their properties */
    async deleteAgent(id: string) {
        await this.ensureExists(id);
        // cascade: delete media → properties → unlock records → payments → user
        const properties = await this.prisma.property.findMany({
            where: { landlordId: id },
            select: { id: true },
        });
        for (const p of properties) {
            await this.prisma.media.deleteMany({ where: { propertyId: p.id } });
            await this.prisma.propertyAmenity.deleteMany({ where: { propertyId: p.id } });
            await this.prisma.favorite.deleteMany({ where: { propertyId: p.id } });
            await this.prisma.unlockRecord.deleteMany({ where: { propertyId: p.id } });
        }
        await this.prisma.property.deleteMany({ where: { landlordId: id } });
        await this.prisma.favorite.deleteMany({ where: { userId: id } });
        await this.prisma.unlockRecord.deleteMany({ where: { userId: id } });
        await this.prisma.payment.deleteMany({ where: { userId: id } });
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: 'User deleted' };
    }

    /** Self: get own profile */
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: { select: { properties: true } },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    /** Self: update own phone number */
    async updateMe(userId: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: { id: true, email: true, phoneNumber: true, role: true },
        });
    }

    /** Self: get own property listings */
    async getMyProperties(userId: string) {
        return this.prisma.property.findMany({
            where: { landlordId: userId },
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    private async ensureExists(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }
}
