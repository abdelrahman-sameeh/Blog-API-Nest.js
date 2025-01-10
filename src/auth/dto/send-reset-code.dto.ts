import { IsEmail, IsOptional, IsString, Validate } from "class-validator";
import { EitherEmailOrUsernameConstraint } from "./login.dto";

export class SendResetCodeDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username: string

  @Validate(EitherEmailOrUsernameConstraint)
  eitherEmailOrUsername?: boolean;
}