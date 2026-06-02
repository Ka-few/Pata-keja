import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import moment from 'moment';

@Injectable()
export class MpesaService {
    constructor(private readonly httpService: HttpService) { }

    async getAccessToken() {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const response = await firstValueFrom(
            this.httpService.get(
                'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                {
                    headers: { Authorization: `Basic ${auth}` },
                },
            ),
        );

        return response.data.access_token;
    }

    async stkPush(phone: string, amount: number) {
        const token = await this.getAccessToken();
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: 'PataNyumba',
            TransactionDesc: 'Contact Unlock Fee',
        };

        const response = await firstValueFrom(
            this.httpService.post(
                'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query', // Should be /stkpush/v1/processrequest for actual push
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            ),
        );

        return response.data;
    }
}
