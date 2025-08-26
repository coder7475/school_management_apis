import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/types';
import { EnrollStudentDto } from './dto/enroll-student.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // create class
  @Post()
  @Roles(Role.Admin)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  // student enroll in an specific class
  @Post(':id/enroll')
  @Roles(Role.Admin, Role.Teacher)
  async enroll(@Param('id') id: string, @Body() dto: EnrollStudentDto) {
    return await this.classesService.enrollStudent(id, dto.studentId);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.classesService.findAll();
  }
}
