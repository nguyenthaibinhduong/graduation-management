import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { JwtUtilityService } from 'src/common/jwtUtility.service';

@Injectable()
export class EncryptIdInterceptor implements NestInterceptor {
  constructor(private readonly jwtUtilityService: JwtUtilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.encodeIdRecursive(data, new WeakSet())),
    );
  }

  private encodeIdRecursive(data: any, seen: WeakSet<object>): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.encodeIdRecursive(item, seen));
    }

    if (data && typeof data === 'object') {
      if (data instanceof Date) return data;

      // Ngăn vòng lặp vô hạn
      if (seen.has(data)) {
        return data;
      }
      seen.add(data);

      const encoded = { ...data };
      if ('id' in encoded && typeof encoded.id !== 'string') {
        encoded.id = this.jwtUtilityService.encodeId(encoded.id);
      }

      for (const key of Object.keys(encoded)) {
        if (typeof encoded[key] === 'object') {
          encoded[key] = this.encodeIdRecursive(encoded[key], seen);
        }
      }

      return encoded;
    }

    return data;
  }
}
