import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Role } from '../../types';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase().trim() : undefined,
  )
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  name: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;

  @IsEnum(Role, {
    message: 'Role must be one of: admin, teacher, student',
  })
  role: Role;
}
