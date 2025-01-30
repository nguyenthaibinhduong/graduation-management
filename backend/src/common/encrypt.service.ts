import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EncryptionService {
  private readonly secretKey = 'your-encryption-key'; // Khóa mã hóa
  private readonly jwtSecret = 'your-jwt-secret'; // Khóa JWT

  encryptPayload(payload: any): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.secretKey, 'salt', 32); // Derive a 32-byte key from the secret key
    const iv = Buffer.alloc(16, 0); // Initialization vector (IV) of 16 bytes, filled with zeros

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptPayload(encrypted: string): any {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.secretKey, 'salt', 32); // Derive a 32-byte key from the secret key
    const iv = Buffer.alloc(16, 0); // Initialization vector (IV) of 16 bytes, filled with zeros

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  createToken(payload: any, expire_time: string | null): string {
    const encryptedPayload = this.encryptPayload(payload);
    return jwt.sign({ data: encryptedPayload }, this.jwtSecret, {
      expiresIn: expire_time || '1h',
    });
  }

  verifyToken(token: string): any {
    const decoded = jwt.verify(token, this.jwtSecret);
    return this.decryptPayload(decoded['data']);
  }
}
