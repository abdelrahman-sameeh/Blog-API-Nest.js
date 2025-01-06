import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpException, HttpStatus, Post, Req, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { IsAuth } from './decorators/is-auth.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';

@Controller({ version: '1' })
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("change-password")
  @IsAuth()
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request: Request) {
    const userId = request.user._id
    return this.authService.changePassword(changePasswordDto, userId)
  }



}
