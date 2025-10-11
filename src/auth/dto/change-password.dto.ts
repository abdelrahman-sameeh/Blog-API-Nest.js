import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsPassword } from "../decorators/is-password.decorator";


export class ChangePasswordDto{
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  oldPassword: string

  @IsPassword()
  newPassword: string
}