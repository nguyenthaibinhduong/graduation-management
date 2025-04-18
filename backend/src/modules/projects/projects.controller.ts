import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ValidationPipe,
  UseGuards,
  HttpException,
} from '@nestjs/common';

import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from 'src/entities/project.entity';
import { Response } from 'src/common/globalClass';

@Controller('projects')
// @UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post('create/:type')
  async create(
    @Param('type') type: string,
    @Body(new ValidationPipe()) project: CreateProjectDto,
  ): Promise<Response<Project>> {
    try {
      if (type == 'student') {
        const newProject = await this.projectService.createProjectByStudent(project);
        return new Response(newProject, HttpStatus.SUCCESS, Message.SUCCESS);
      }
      
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('teacher_id') teacher_id?: number,
    @Query('course_id') course_id?: number,
    @Query('student_id') student_id?: number,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: Project[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const projects = await this.projectService.getAllProjectForObject(teacher_id,course_id,student_id,search, limit, page);
      return new Response(projects, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<Project>> {
    try {
      const project = await this.projectService.getById({ where: { id } });
      return project
        ? new Response(project, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put('update/:type/:id')
  async update(
    @Param('type') type: string,
    @Param('id') id: number,
    @Body(new ValidationPipe()) project: CreateProjectDto,
  ): Promise<Response<Project>> {
    try {
      if (type == 'student') {
        const updatedProject = await this.projectService.updateProjectByStudent(id, project);
         return updatedProject
        ? new Response(updatedProject, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
      }
      
     
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Delete('delete/:type/:id/:student_id')
  async remove( @Param('type') type: string ,@Param('id') id: number, @Param('student_id') student_id: number): Promise<Response<void>> {
    try {
      if (type == "student") {
        await this.projectService.deleteByStudent(id,student_id);
        return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
      }
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('remove-multi/:type')
  async removeMulti(
     @Param('type') type: string,
    @Body() body:  {ids: number[] ,student_id: number},
  ): Promise<Response<void> | HttpException> {
    try {
      if (type == "student") {
        const {ids , student_id } = body
        await this.projectService.deleteByStudent(ids,student_id);
        return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
      }
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
