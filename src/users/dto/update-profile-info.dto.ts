import { IsNotEmpty, IsOptional } from "class-validator";


export class UpdateProfileInfoDto {

  @IsOptional()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsNotEmpty()
  bio: string;

}