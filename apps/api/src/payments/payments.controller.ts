import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Simulate an instant M-Pesa payment to unlock a property's contact info.
     * POST /payments/unlock/:propertyId  { phone: "07..." }
     */
    @UseGuards(JwtAuthGuard)
    @Post('unlock/:propertyId')
    async unlockContact(
        @Request() req: any,
        @Param('propertyId') propertyId: string,
        @Body('phone') phone: string,
    ) {
        return this.paymentsService.unlockContact(req.user.id, propertyId, phone);
    }

    /**
     * Check whether the authenticated user has already unlocked a property.
     * GET /payments/unlock/:propertyId/status
     */
    @UseGuards(JwtAuthGuard)
    @Get('unlock/:propertyId/status')
    async checkUnlock(
        @Request() req: any,
        @Param('propertyId') propertyId: string,
    ) {
        return this.paymentsService.checkUnlockStatus(req.user.id, propertyId);
    }

    /** Legacy STK-push endpoint */
    @UseGuards(JwtAuthGuard)
    @Post('stk-push')
    async initiateStkPush(@Request() req: any, @Body() body: any) {
        const { propertyId, phone } = body;
        return this.paymentsService.initiateStkPush(req.user.id, propertyId, phone);
    }

    @HttpCode(HttpStatus.OK)
    @Post('callback')
    async mpesaCallback(@Body() body: any) {
        return this.paymentsService.handleCallback(body);
    }
}
