import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MpesaService } from './mpesa.service';

@Module({
  imports: [HttpModule],
  providers: [PaymentsService, MpesaService],
  controllers: [PaymentsController],
})
export class PaymentsModule { }
