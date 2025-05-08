import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { JwtUtilityService } from 'src/common/jwtUtility.service';

type IdSource = 'params' | 'query' | 'body' | 'headers';

export const DecodedId = createParamDecorator(
  (
    data: [IdSource?, string?], // [source, fieldName]
    ctx: ExecutionContext,
  ): number | number[] => {
    const request = ctx.switchToHttp().getRequest();
    const jwtUtilityService = new JwtUtilityService(); // Nếu dùng static thì gọi class trực tiếp

    const [source, fieldName] = data || [];

    let rawId: string | string[] | undefined;

    const getField = (
      source: IdSource | undefined,
      field: string | undefined,
    ) => {
      if (!source) {
        return (
          request.body?.[field ?? 'id'] ??
          request.params?.[field ?? 'id'] ??
          request.query?.[field ?? 'id'] ??
          request.headers?.[field ?? 'x-id']
        );
      }

      const sourceObj = {
        params: request.params,
        query: request.query,
        body: request.body,
        headers: request.headers,
      }[source];

      return sourceObj?.[field ?? 'id'];
    };

    rawId = getField(source, fieldName);

    try {
      if (rawId) {
        if (Array.isArray(rawId)) {
          return rawId.map((id) => jwtUtilityService.decodeId(id));
        }
        return jwtUtilityService.decodeId(rawId);
      } else {
        return null;
      }
    } catch (err) {
      throw new BadRequestException('Invalid or malformed ID');
    }
  },
);
