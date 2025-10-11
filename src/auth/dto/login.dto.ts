import { IsEmail, IsOptional, IsString, IsNotEmpty, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, MaxLength } from 'class-validator';

// Custom Validator
@ValidatorConstraint({ name: 'EitherEmailOrUsername', async: false })
export class EitherEmailOrUsernameConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return (object.email || object.username) && !(object.email && object.username);
  }

  defaultMessage(args: ValidationArguments) {
    return 'either email or username must be provided, but not both.';
  }
}

export class LoginDto {
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  username?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;

  @Validate(EitherEmailOrUsernameConstraint)
  eitherEmailOrUsername?: boolean;
}
