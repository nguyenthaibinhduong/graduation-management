// decoded-id.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { JwtUtilityService } from 'src/common/jwtUtility.service';

type IdSource = 'params' | 'query' | 'body' | 'headers';

export const DecodedId = createParamDecorator(
  (source: IdSource | undefined, ctx: ExecutionContext): number | number[] => {
    const request = ctx.switchToHttp().getRequest();
    const jwtUtilityService = new JwtUtilityService();

    let rawId: string | string[] | undefined;

    switch (source) {
      case 'params':
        rawId = request.params?.id;
        break;
      case 'query':
        rawId = request.query?.id;
        break;
      case 'body':
        rawId = request.body?.ids ?? request.body?.id;
        break;
      case 'headers':
        rawId = request.headers?.['x-id'];
        break;
      default:
        rawId =
        request.body?.ids ??
        request.body?.id ??
        request.params?.id ??
        request.query?.id ??
        request.headers?.['x-id'];; 
    }

    if (!rawId || (Array.isArray(rawId) && rawId.length === 0)) {
      throw new BadRequestException(
        `ID is required${source ? ` in ${source}` : ''}`,
      );
    }

    try {
      if (Array.isArray(rawId)) {
        return rawId.map((id) => jwtUtilityService.decodeId(id));
      }
      return jwtUtilityService.decodeId(rawId);
    } catch (err) {
      throw new BadRequestException('Invalid or malformed ID');
    }
  },
);
