import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT as string,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            },
        });
        this.bucketName = process.env.R2_BUCKET_NAME as string;
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'listings') {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // Assuming a public CDN URL or R2 public access is configured
        const publicUrl = `${process.env.CDN_URL}/${fileName}`;
        return { url: publicUrl, key: fileName };
    }
}
