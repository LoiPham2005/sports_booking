import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Yêu cầu user phải có TẤT CẢ permission liệt kê (AND).
 * SUPER_ADMIN luôn pass.
 *
 * @example
 * @RequirePermission('venue.approve')
 * @Post(':id/approve')
 * approve() {}
 */
export const RequirePermission = (...keys: string[]) => SetMetadata(PERMISSIONS_KEY, keys);
