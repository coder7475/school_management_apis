import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsInt({ message: 'Age must be an integer' })
  @Min(3, { message: 'Age must be at least 3' })
  @Max(120, { message: 'Age must not exceed 120' })
  age: number;

  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
