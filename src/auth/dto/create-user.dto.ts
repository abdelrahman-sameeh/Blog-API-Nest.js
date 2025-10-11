import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsPassword } from "../decorators/is-password.decorator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  lastName: string;

  @IsEmail({}, { message: 'invalid email address' })
  @MaxLength(50)
  email: string;

  @IsPassword()
  password: string

}