import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../database/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../common/helper/generate-token';
import { UserSerializer } from './serializers/user.serializer';
import { isUnique } from '../common/helper/is-unique';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async register(createUserDto: CreateUserDto) {
    await isUnique(this.userModel, 'email', createUserDto.email)
    await isUnique(this.userModel, 'username', createUserDto.username)

    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    const user = await this.userModel.create(createUserDto)
    const token = await generateToken(user)
    const serializedData = new UserSerializer(user.toObject())

    return {
      success: true,
      data: {
        user: serializedData,
        token
      }
    }
  }


  async login(loginDto: LoginDto) {
    const { email, username, password } = loginDto;
    const filterKey = email ? 'email' : 'username';
    const filterValue = email || username;
    const filterUser = { [filterKey]: filterValue };
    const user = await this.userModel.findOne(filterUser);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ForbiddenException(`${filterKey} or password is incorrect`);
    }
    const token = await generateToken(user)
    const serializedData = new UserSerializer(user.toObject())

    return {
      success: true,
      data: {
        user: serializedData,
        token
      }
    }
  }

}
