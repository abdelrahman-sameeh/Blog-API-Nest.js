import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  username: string;

  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(25)
  @Matches(/^(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/^(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character' })
  password: string

}