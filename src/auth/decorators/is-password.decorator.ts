import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regexUpper = /^(?=.*[A-Z])/;
          const regexLower = /^(?=.*[a-z])/;
          const regexDigit = /^(?=.*\d)/;
          const regexSpecialChar = /^(?=.*[!@#$%^&*])/;

          return typeof value === 'string' &&
            value.length >= 4 &&
            value.length <= 25 &&
            regexUpper.test(value) &&
            regexLower.test(value) &&
            regexDigit.test(value) &&
            regexSpecialChar.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'password must be between 4 and 25 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
        }
      },
    });
  };
}
