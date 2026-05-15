import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Convert Prisma `Decimal` instances to plain `number` in all response bodies.
 *
 * Prisma's default JSON serialization of `Decimal(12, 2)` produces a string
 * (`"350000.00"`) which forces every frontend to call `Number(...)`. This
 * interceptor walks the response tree recursively and replaces every
 * `Decimal` with its numeric value so clients receive `350000`.
 *
 * Date objects are converted to ISO strings (NestJS does this automatically
 * for top-level Date, but nested Dates inside arrays/objects sometimes leak).
 */
@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => transform(data)));
  }
}

function transform(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Decimal) return value.toNumber();
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(transform);

  if (typeof value === 'object') {
    // Don't recurse into Buffer, BigInt, etc.
    if (Buffer.isBuffer(value)) return value;

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = transform(v);
    }
    return out;
  }

  return value;
}
