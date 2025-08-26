import { Inject, Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { classes } from 'src/drizzle/schema/classes.schema';
import type { DrizzleDB } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';

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

  findAll() {
    return `This action returns all classes`;
  }
}
