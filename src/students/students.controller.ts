import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/types';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Teacher)
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Teacher)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }
}
