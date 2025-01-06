import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class ChangePasswordDto{
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  oldPassword: string

  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(25)
  @Matches(/^(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/^(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character' })
  newPassword: string
}