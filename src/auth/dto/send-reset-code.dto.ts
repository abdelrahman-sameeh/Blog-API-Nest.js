import { IsEmail, IsOptional, IsString, MaxLength, Validate } from "class-validator";
import { EitherEmailOrUsernameConstraint } from "./login.dto";

export class SendResetCodeDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  username: string

  @Validate(EitherEmailOrUsernameConstraint)
  eitherEmailOrUsername?: boolean;
}