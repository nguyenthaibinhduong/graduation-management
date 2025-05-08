import { Injectable, BadRequestException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtUtilityService {
  private readonly secretKey = process.env.JWT_SECRET_KEY;
  // Encode an ID
  encodeId(id: any): any {
    return sign({ id }, this.secretKey, { expiresIn: '1d' });
  }

  // Decode an ID
  decodeId(encodedId: any): any {
    try {
      const decoded = verify(encodedId, this.secretKey) as { id: any };
      return decoded.id;
    } catch (error) {
      throw new BadRequestException('Invalid or expired encoded ID');
    }
  }
}
