import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { IsAuth } from '../common/decorators/is-auth.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendResetCodeDto } from './dto/send-reset-code.dto';
import { ChangeForgetPasswordDto } from './dto/changeForgetPasswordDto';

@Controller({ version: '1' })
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("change-password")
  @IsAuth()
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request) {
    const userId = request.user._id
    return this.authService.changePassword(changePasswordDto, userId)
  }

  @Post("send-reset-code")
  @HttpCode(HttpStatus.OK)
  sendResetCode(@Body() sendResetCodeDto: SendResetCodeDto){
    return this.authService.sendResetCode(sendResetCodeDto)
  }


  @Post("change-forget-password")
  @HttpCode(HttpStatus.OK)
  changeForgetPassword(@Body() changeForgetPasswordDto: ChangeForgetPasswordDto){
    return this.authService.changeForgetPassword(changeForgetPasswordDto)
  }
  

  @Get("auth")
  @IsAuth()
  getLoggedInUser(@Req() request){
    return this.authService.getLoggedInUser(request.user)
  }

}
