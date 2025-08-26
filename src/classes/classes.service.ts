import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { classes } from 'src/drizzle/schema/classes.schema';
import type { DrizzleDB } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { eq } from 'drizzle-orm';
import { students } from 'src/drizzle/schema/students.schema';

@Injectable()
export class ClassesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // Create New Class
  async create(createClassDto: CreateClassDto) {
    const { name, section } = createClassDto;
    const [classData] = await this.db
      .insert(classes)
      .values({ name, section })
      .returning();

    return {
      success: true,
      message: 'Student created successfully',
      data: classData,
    };
  }

  // enroll student to a specific class
  async enrollStudent(classId: string, studentId: string) {
    // check class exists
    const [classExits] = await this.db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classExits) throw new NotFoundException('Class not found');

    // check student exists
    const [student] = await this.db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) throw new NotFoundException('Student not found');

    // check if already enrolled

    if (student.classId)
      throw new BadRequestException('Student already enrolled');

    // update the classId of student table
    await this.db
      .update(students)
      .set({ classId })
      .where(eq(students.id, studentId));

    return { message: 'Student enrolled successfully' };
  }

  findAll() {
    return `This action returns all classes`;
  }
}
