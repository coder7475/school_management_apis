/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  MinLength,
  Matches,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
} from 'class-validator';

export class SignupDto {
  @IsString()
  user_name: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one number and one special character',
  })
  password: string;

  @IsArray({ message: 'Shop names must be an array' })
  @ArrayMinSize(3, { message: 'You must provide at least 3 shop names' })
  @ArrayUnique({ message: 'Shop names must be unique' })
  @IsString({ each: true, message: 'Each shop name must be a string' })
  shopNames: string[];
}

export class SigninDto {
  @IsString()
  user_name: string;

  @IsString()
  password: string;

  rememberMe?: boolean;
}
