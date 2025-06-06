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
  Request,
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
    @DecodedId(['body', 'student_id']) student_id: any,
    @DecodedId(['body', 'teacher_id']) teacher_id: any,
    @Body(new ValidationPipe()) project: CreateProjectDto,
  ): Promise<Response<Project>> {
    try {
      const data = {...project,student_id, teacher_id};
      const newProject = await this.projectService.createProject(data, type);
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
    @DecodedId(['body']) id: any,
    @DecodedId(['body','obj_id']) obj_id: any,
    @Body() data: any,
  ): Promise<Response<void>> {
    try {
      const newData = {...data,id, obj_id};
      const updatedProject = await this.projectService.updateStatus(newData, type);
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
    @DecodedId(['body']) id: any,
    @DecodedId(['body','session_id']) session_id: any,
    @Request() request: any
  ): Promise<Response<void>> {
    try {
      const user = request.user;

      if (!user) {
        throw new HttpException(
          { statusCode: HttpStatus.ERROR, message: 'Thiếu thông tin ' },
          HttpStatus.ERROR,
        );
      }
      const data = { id,session_id}
      const updatedProject = await this.projectService.publicProject(
        data,
        type,
        user?.id
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
    @DecodedId(['query', 'teacher_id']) teacher_id?: number,
    @DecodedId(['query', 'course_id']) course_id?: number,
    @Query('status') status?: string,
    @DecodedId(['query', 'student_id']) student_id?: number,
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

  @Get('find/:type/:id')
  async findOne(
    @Param('type') type: string,
    @DecodedId(["params"]) id: number,
    @Request() request: any
  ): Promise<Response<Project>> {
    try {

    const user = request.user;

    if (!user) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: 'Thiếu thông tin ' },
        HttpStatus.ERROR,
      );
    }
      const project = await this.projectService.getProjectById(
        id,
        type,
        user
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

   @Post('assign-group')
      async assignGroup(
        @DecodedId(["body", "group_ids"]) group_ids: number[],
        @DecodedId(["body", "project_id"]) project_id: number,
        @Request() request: any,
    ): Promise<Response<any>> {
      try {
        const userId = request.user?.id;
    
        if (!userId) {
          throw new HttpException(
            { statusCode: HttpStatus.ERROR, message: 'Thiếu thông tin ' },
            HttpStatus.ERROR,
          );
        }
    
        const result = await this.projectService.assignGroupForProject(group_ids,project_id,userId);
          return new Response(result, HttpStatus.SUCCESS, Message.SUCCESS);
        } catch (error) {
          throw new HttpException(
            { statusCode: HttpStatus.ERROR, message: error.message },
            HttpStatus.ERROR,
          );
        }
      }
}
