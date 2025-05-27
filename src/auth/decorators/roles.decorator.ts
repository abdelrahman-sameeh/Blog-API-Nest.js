import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/common/constant';

export const Roles = (...roles: ["admin" | "user"]) => SetMetadata(ROLES, roles)
