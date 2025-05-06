import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schema/user.schema';
import { Model } from 'mongoose';
import { generateToken } from '../common/helper/generate-token';
import { UserSerializer } from './serializers/user.serializer';
import { isUnique } from '../common/helper/is-unique';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendResetCodeDto } from './dto/send-reset-code.dto';
import { generateCode } from 'src/common/helper/random-code';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetCode } from 'src/database/schemas/reset-code.schema';
import { decrypt } from 'src/common/helper/decrypt';
import { ChangeForgetPasswordDto } from './dto/changeForgetPasswordDto';
import * as bcrypt from "bcrypt"
import { encrypt } from 'src/common/helper/encrypt';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ResetCode.name) private resetCodeModel: Model<ResetCode>,
    private readonly mailService: MailerService,
  ) { }

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

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string): Promise<object> {
    const user = await this.userModel.findById(userId);

    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new HttpException('old password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    return {
      data: {
        status: "success",
        message: 'password changed successfully',
      }
    }
  }

  async sendResetCode(sendResetCodeDto: SendResetCodeDto) {
    const { email, username } = sendResetCodeDto;
    const query = {};

    if (email) query['email'] = email;
    if (username) query['username'] = username;

    const user = await this.userModel.findOne(query);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const resetCode = await this.resetCodeModel.findOne({ user: user._id });
    let codeToSend = '';

    if (resetCode) {
      codeToSend = decrypt(resetCode.code, resetCode.iv);
    } else {
      codeToSend = generateCode(5);
      const { encryptedStr, iv } = encrypt(codeToSend);
      await this.resetCodeModel.create({
        user,
        code: encryptedStr,
        iv,
      });
    }

    await this._sendPasswordResetEmail(user, codeToSend);

    return {
      data: {
        message: "reset code sent successfully"
      }
    }
  }

  async _sendPasswordResetEmail(user: any, codeToSend: string) {
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Password Reset Code - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #34495e;">
            Hello <strong>${user.firstName || "User"}</strong>,
          </p>
          <p style="font-size: 16px; color: #34495e;">
            We received a request to reset your password. Please use the code below to proceed with resetting your password.
          </p>
          <div style="background-color: #e9f7fc; padding: 15px; border-radius: 5px; font-size: 18px; color: #2980b9; font-weight: bold;">
            <p style="margin: 0;">Your password reset code is: <span style="font-size: 22px; color: #e74c3c;">${codeToSend}</span></p>
          </div>
          <p style="font-size: 16px; color: #34495e;">
            This code will expire in <strong>15 minutes</strong>, so please use it promptly.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <footer style="font-size: 14px; color: #7f8c8d;">
            <p>&copy; 2025 Article Verse. All rights reserved.</p>
          </footer>
        </div>
      `
    });
  }

  async changeForgetPassword(changeForgetPassword: ChangeForgetPasswordDto) {
    const { email, username, newPassword, code } = changeForgetPassword
    const query = {}
    if (email) query['email'] = email;
    if (username) query['username'] = username;
    const user = await this.userModel.findOne(query);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const resetCode = await this.resetCodeModel.findOne({ user: user._id });
    if (!resetCode) {
      throw new HttpException("code is not valid", 400)
    }
    // check if code created before 15 minute
    const codeTime = resetCode.createdAt;
    const currentDate = new Date()
    const difference = (currentDate.getTime() - codeTime.getTime()) / 60000
    if (difference >= 15) {
      throw new HttpException("code is not valid", 400)
    }
    // check if code same registered reset code
    const ivBuffer = Buffer.from(resetCode.iv, 'hex');
    const { encryptedStr } = encrypt(code, ivBuffer)
    if (encryptedStr != resetCode.code) {
      throw new HttpException("code is not valid", 400)
    }

    // change password
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    // delete reset code document
    await resetCode.deleteOne()

    return {
      data: {
        message: "password reset successfully"
      }
    }
  }

  // cron job work every 15 minute to delete invalid reset code
  @Cron("*/15 * * * *")
  async deleteInvalidResetCode() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await this.resetCodeModel.deleteMany({
      createdAt: { $lt: fifteenMinutesAgo },
    });
  }

}
