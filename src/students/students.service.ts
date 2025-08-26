import { Inject, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { type DrizzleDB } from 'src/drizzle/types/drizzle';
import { students } from 'src/drizzle/schema/students.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class StudentsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // create new student
  async create(createStudentDto: CreateStudentDto) {
    const { name, age, userId } = createStudentDto;
    const [student] = await this.db
      .insert(students)
      .values({ name, age, userId })
      .returning();

    return {
      success: true,
      message: 'Student created successfully',
      data: student,
    };
  }

  findAll() {
    return `This action returns all students`;
  }

  async findOne(id: string) {
    const [student] = await this.db
      .select()
      .from(students)
      .where(eq(students.id, String(id)))
      .limit(1);
    if (!student) {
      return {
        success: false,
        message: `Student with id #${id} not found`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Student retrieved successfully',
      data: student,
    };
  }
}
