import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/schema/user.schema';
import { IS_AUTH, IS_OPTIONAL_AUTH, ROLES } from 'src/common/constant';


@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuth = this.reflector.getAllAndOverride<boolean>(IS_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    const roles = this.reflector.getAllAndOverride<string[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAuth && !roles && !isOptionalAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      request.headers['authorization']?.split(' ')[1] || request.cookies?.jwt;

    if (isOptionalAuth && !token) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('no token provided');
    }

    let decoded = undefined;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      throw new UnauthorizedException('invalid token');
    }

    const user = await this.userModel.findById(decoded._id).exec();
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    const { password, ...userDetails } = user.toObject();

    const serverUrl = `${request.protocol}://${request.get("host")}`;
    userDetails.picture = userDetails.picture.startsWith("http") ?
      userDetails.picture :
      `${serverUrl}${userDetails.picture}`;

    request.user = userDetails;

    if (roles && !roles.includes(user.role)) {
      throw new ForbiddenException('you do not have permission to access this resource');
    }

    return true;
  }
}
