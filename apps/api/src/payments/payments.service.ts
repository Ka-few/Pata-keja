import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MpesaService } from './mpesa.service';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mpesaService: MpesaService,
    ) { }

    async initiateStkPush(userId: string, propertyId: string, phone: string) {
        // Check if already unlocked
        const existing = await this.prisma.unlockRecord.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });

        if (existing) {
            return { status: 'ALREADY_UNLOCKED' };
        }

        // In a real app, amount should be configurable
        const amount = 50;
        const result = await this.mpesaService.stkPush(phone, amount);

        // Save PENDING payment
        await this.prisma.payment.create({
            data: {
                userId,
                amount,
                phone,
                status: 'PENDING',
                // In a real app, you'd store the CheckoutRequestID to link the callback
            },
        });

        return result;
    }

    async handleCallback(data: any) {
        const { Body } = data;
        const resultCode = Body.stkCallback.ResultCode;

        if (resultCode === 0) {
            // Payment successful
            // Logic to find payment by CheckoutRequestID and update status
            // Then create UnlockRecord
        }
    }

    async getUnlockRecord(userId: string, propertyId: string) {
        return this.prisma.unlockRecord.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });
    }
}
