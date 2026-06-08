import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
    async uploadFile(file: Express.Multer.File, folder: string = 'listings') {
        const fileExtension = file.originalname.split('.').pop();
        const uuid = uuidv4();
        const fileName = `${uuid}.${fileExtension}`;
        
        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, file.buffer);
        
        // Return a reachable URL from the frontend
        const baseUrl = process.env.API_URL || 'http://localhost:4000';
        const url = `${baseUrl}/uploads/${folder}/${fileName}`;

        console.log(`[LOCAL UPLOAD]: Saved to ${filePath}`);

        return { url, key: `${folder}/${fileName}` };
    }
}
