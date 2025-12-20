import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
    private readonly uploadDir = './uploads';

    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
    ) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async saveDocument(
        base64Content: string,
        originalName: string,
        mimeType: string,
    ): Promise<Document> {
        try {
            // Decode base64
            // Remove header if present (e.g., "data:image/png;base64,")
            const matches = base64Content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            let buffer: Buffer;

            if (matches && matches.length === 3) {
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                buffer = Buffer.from(base64Content, 'base64');
            }

            const fileExt = path.extname(originalName) || `.${mimeType.split('/')[1]}`;
            const filename = `${crypto.randomUUID()}${fileExt}`;
            const filePath = path.join(this.uploadDir, filename);

            // Write file
            fs.writeFileSync(filePath, buffer);

            const size = buffer.length;

            // Save entity
            const document = this.documentRepository.create({
                originalName,
                mimeType,
                filename,
                path: filePath,
                size,
            });

            return await this.documentRepository.save(document);
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload document');
        }
    }

    async getDocument(id: string): Promise<Document | null> {
        return this.documentRepository.findOne({ where: { id } });
    }
}
