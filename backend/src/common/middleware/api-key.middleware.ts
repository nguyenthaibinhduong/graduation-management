import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const encryptedApiKey = req.headers['x-api-key'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!encryptedApiKey || !timestamp) {
      throw new UnauthorizedException('Missing headers');
    }

    // Kiểm tra thời gian chênh lệch quá lớn
    const now = Date.now();
    const timeDiff = Math.abs(now - parseInt(timestamp));
    const maxDiff = 5 * 60 * 1000; // 5 phút

    if (timeDiff > maxDiff) {
      throw new UnauthorizedException('Request expired');
    }

    const apiSecret = process.env.API_SECRET;
    const originalApiKey = process.env.API_KEY;

    const expectedEncryptedKey = crypto
      .createHmac('sha256', apiSecret)
      .update(timestamp + originalApiKey)
      .digest('hex');

    if (expectedEncryptedKey !== encryptedApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    next();
  }
}
