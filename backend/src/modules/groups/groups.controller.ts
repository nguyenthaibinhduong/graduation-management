import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  HttpException,
  Query,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { Response } from 'src/common/globalClass';
import { Group } from 'src/entities/group.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @Body() createGroupDto: any,
    @Request() request: any,
  ): Promise<Response<Group>> {
    try {
      const newGroup = await this.groupsService.createGroup(
        createGroupDto,
        request.user?.id,
      );
      return new Response( newGroup, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: Group[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const groups = await this.groupsService.getAll(search, limit, page);
      return new Response(groups, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<Group>> {
    try {
      const group = await this.groupsService.getById({ where: { id } });
      return group
        ? new Response(group, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) updateGroupDto: UpdateGroupDto,
  ): Promise<Response<Group>> {
    try {
      const updatedGroup = await this.groupsService.update(
        id,
        { where: { id } },
        updateGroupDto,
      );
      return new Response(updatedGroup, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      const deletedGroup = await this.groupsService.delete(id);
      return new Response(deletedGroup, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('remove-multi')
  async removeMulti(
    @Body('ids', new ValidationPipe({ transform: true })) ids: number[],
  ): Promise<Response<void>> {
    try {
      const deletedGroups = await this.groupsService.delete(ids);
      return new Response(deletedGroups, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('register-project')
  async registerProject(
    @Body('groupId', new ValidationPipe({ transform: true })) groupId: number,
    @Body('projectId', new ValidationPipe({ transform: true }))
    projectId: number,
  ): Promise<Response<void>> {
    try {
      const registeredGroup = await this.groupsService.registerProject(
        groupId,
        projectId,
      );
      return new Response(registeredGroup, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('get-my-group')
  async getMyGroup(
     @Request() request: any,
  ): Promise<Response<any>> {
    try {
      const id = request.user?.id
      const group = await this.groupsService.getGroupByUser(id,'leader');
      return new Response(group, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('get-my-invite')
  async getMyInvite(
     @Request() request: any,
  ): Promise<Response<any>> {
    try {
      const id = request.user?.id
      const group = await this.groupsService.getGroupByUser(id,'invite');
      return new Response(group, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
