import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, Validate } from "class-validator";
import { EitherEmailOrUsernameConstraint } from "./login.dto";
import { IsPassword } from "../decorators/is-password.decorator";


export class ChangeForgetPasswordDto{
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  username: string

  @IsPassword()
  newPassword: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  code: string

  @Validate(EitherEmailOrUsernameConstraint)
  eitherEmailOrUsername?: boolean;

}