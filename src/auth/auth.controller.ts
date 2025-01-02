import { Body, ClassSerializerInterceptor, Controller, Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller({version: '1'})
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post("register")
  register(@Body() createUserDto: CreateUserDto ){
    return this.authService.register(createUserDto)
  }
  
  @Post("login")
  login(@Body() loginDto: LoginDto ){
    return this.authService.login(loginDto)
  }

}
