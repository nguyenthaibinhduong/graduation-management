// interceptors/encrypt-id.interceptor.ts
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
      map((data) => this.encodeIdRecursive(data)),
    );
  }

private encodeIdRecursive(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => this.encodeIdRecursive(item));
  } else if (data && typeof data === 'object') {
    // ❗ Bỏ qua instance của Date
    if (data instanceof Date) {
      return data;
    }

    const encoded = { ...data };
    if ('id' in encoded) {
      encoded.id = this.jwtUtilityService.encodeId(encoded.id);
    }

    for (const key of Object.keys(encoded)) {
      if (typeof encoded[key] === 'object') {
        encoded[key] = this.encodeIdRecursive(encoded[key]);
      }
    }

    return encoded;
  }
  return data;
}

}
