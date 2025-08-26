import { IsString } from 'class-validator';

export class EnrollStudentDto {
  @IsString()
  studentId: string;
}
