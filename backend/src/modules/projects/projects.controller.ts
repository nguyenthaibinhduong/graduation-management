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
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post('create/:type')
  async create(
    @Param('type') type: string,
    @Body(new ValidationPipe()) project: CreateProjectDto,
  ): Promise<Response<Project>> {
    try {
      const newProject = await this.projectService.createProject(project, type);
      return new Response(newProject, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
  @Post('update-status/:type')
  async updateStatus(
    @Param('type') type: string,
    @Body() data: any,
  ): Promise<Response<void>> {
    try {
      const updatedProject = await this.projectService.updateStatus(data, type);
      return new Response(updatedProject, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('public-project/:type')
  async publicProject(
    @Param('type') type: string,
    @Body() data: any,
  ): Promise<Response<void>> {
    try {
      const updatedProject = await this.projectService.publicProject(
        data,
        type,
      );
      return new Response(updatedProject, HttpStatus.SUCCESS, Message.SUCCESS);
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
    @Query('status') status?: string,
    @Query('student_id') student_id?: number,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: Project[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const projects = await this.projectService.getAllProjectForObject(
        teacher_id,
        course_id,
        student_id,
        search,
        limit,
        page,
        status,
      );
      return new Response(projects, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get('find/:type/:id/:obj_id')
  async findOne(
    @Param('type') type: string,
    @DecodedId(["params"]) id: number,
    @Param('obj_id') obj_id: number,
  ): Promise<Response<Project>> {
    try {
      const project = await this.projectService.getProjectById(
        id,
        obj_id,
        type,
      );
      return new Response(project, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Put('update/:type/:id')
  async update(
    @Param('type') type: string,
    @DecodedId(["params"]) id: number,
    @Body(new ValidationPipe()) project: CreateProjectDto,
  ): Promise<Response<Project>> {
    try {
      const updatedProject = await this.projectService.updateProject(
        id,
        project,
        type,
      );
      return updatedProject
        ? new Response(updatedProject, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Delete('delete/:type/:id/:obj_id')
  async remove(
    @Param('type') type: string,
    @DecodedId(["params"]) id: number,
    @Param('obj_id') obj_id: number,
  ): Promise<Response<void>> {
    try {
      await this.projectService.deleteProject(id, obj_id, type);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
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
    @Body() body: { ids: number[]; obj_id: number },
  ): Promise<Response<void> | HttpException> {
    try {
      if (type == 'student') {
        const { ids, obj_id } = body;
        await this.projectService.deleteProject(ids, obj_id, type);
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
