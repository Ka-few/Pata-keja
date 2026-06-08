import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MpesaService } from './mpesa.service';

export const UNLOCK_FEE = 100; // KES

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mpesaService: MpesaService,
    ) { }

    /**
     * Simulate an instant unlock payment.
     * Creates a SUCCESS payment + UnlockRecord in one DB transaction.
     */
    async unlockContact(userId: string, propertyId: string, phone: string) {
        // Check property exists
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                landlord: { select: { phoneNumber: true, email: true } },
            },
        });
        if (!property) throw new NotFoundException('Property not found');

        // Check if already unlocked
        const existing = await this.prisma.unlockRecord.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });
        if (existing) {
            return {
                status: 'ALREADY_UNLOCKED',
                contact: {
                    phone: property.landlord.phoneNumber,
                    email: property.landlord.email,
                },
            };
        }

        // Simulate payment: create SUCCESS payment then link UnlockRecord
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                amount: UNLOCK_FEE,
                phone,
                status: 'SUCCESS',
                mpesaReceipt: `SIM${Date.now()}`,
            },
        });

        await this.prisma.unlockRecord.create({
            data: { userId, propertyId, paymentId: payment.id },
        });

        return {
            status: 'SUCCESS',
            contact: {
                phone: property.landlord.phoneNumber,
                email: property.landlord.email,
            },
        };
    }

    /**
     * Check if a user has already unlocked a property.
     * Also returns the contact info if they have.
     */
    async checkUnlockStatus(userId: string, propertyId: string) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                landlord: { select: { phoneNumber: true, email: true } },
            },
        });
        if (!property) throw new NotFoundException('Property not found');

        const record = await this.prisma.unlockRecord.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });

        if (record) {
            return {
                unlocked: true,
                contact: {
                    phone: property.landlord.phoneNumber,
                    email: property.landlord.email,
                },
            };
        }

        return { unlocked: false };
    }

    async initiateStkPush(userId: string, propertyId: string, phone: string) {
        const existing = await this.prisma.unlockRecord.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });
        if (existing) return { status: 'ALREADY_UNLOCKED' };

        const amount = UNLOCK_FEE;
        const result = await this.mpesaService.stkPush(phone, amount);

        await this.prisma.payment.create({
            data: { userId, amount, phone, status: 'PENDING' },
        });

        return result;
    }

    async handleCallback(data: any) {
        const { Body } = data;
        const resultCode = Body.stkCallback.ResultCode;
        if (resultCode === 0) {
            // Real M-Pesa integration: find pending payment by CheckoutRequestID and finalize
        }
    }

    async getUnlockRecord(userId: string, propertyId: string) {
        return this.prisma.unlockRecord.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });
    }
}
