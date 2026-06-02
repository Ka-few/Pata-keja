import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

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
