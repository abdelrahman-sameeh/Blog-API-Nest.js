import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/database/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../common/helper/generate-token';
import { UserSerializer } from './serializers/user.serializer';
import { isUnique } from 'src/common/helper/is-unique';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async register(createUserDto: CreateUserDto) {
    await isUnique(this.userModel, 'email', createUserDto.email)
    await isUnique(this.userModel, 'username', createUserDto.username)

    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    const user = await this.userModel.create(createUserDto)
    const token = await generateToken({ _id: user._id, username: user.username })
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
