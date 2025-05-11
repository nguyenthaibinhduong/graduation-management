import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtUtilityService {
  private readonly secretKey: any;

  constructor() {
    if (!process.env.JWT_SECRET_KEY) {
      throw new InternalServerErrorException('JWT_SECRET_KEY is not defined');
    }
    this.secretKey = process.env.JWT_SECRET_KEY;
  }

  // Encode an ID - stateless, no time-based claims
  encodeId(id: any): any {
    try {
      return sign({ id }, this.secretKey, {
        noTimestamp: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to encode ID');
    }
  }

  // Decode an ID - ignores expiration by design
  decodeId(encodedId: any): any {
    try {
      const decoded = verify(encodedId, this.secretKey, {
        ignoreExpiration: true,
      }) as { id: any };
      return decoded.id;
    } catch (error) {
      throw new BadRequestException('Invalid encoded ID');
    }
  }
}
