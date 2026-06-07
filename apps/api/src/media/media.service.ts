import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
    async uploadFile(file: Express.Multer.File, folder: string = 'listings') {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        // MOCK: Because the .env has dummy R2 keys, sending to S3 will crash.
        // For development, we return a generic placeholder or pretend we uploaded.
        const mockUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2673';
        
        console.log(`[MOCK UPLOAD]: Pretending to upload ${fileName}`);

        return { url: mockUrl, key: fileName };
    }
}
