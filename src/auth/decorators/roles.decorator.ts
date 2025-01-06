import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/common/constant';

export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles)
