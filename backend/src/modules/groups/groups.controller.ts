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
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

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
    @Query('status') status?: string,
    @DecodedId(['query','department_id']) department_id?: number | string,
   @Query('search') search?: string,
  @Query('limit') limit?: number,
  @Query('page') page?: number,
  @Query('orderBy') orderBy: 'asc' | 'desc' = 'asc',
  ): Promise<
    Response<{ items: Group[]; total: number; limit?: number; page?: number }>
  > {
    try {
     const groups = await this.groupsService.getAllGroup(status,department_id,search,limit,page,orderBy);
      return new Response(groups, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@DecodedId(["params"]) id: number): Promise<Response<Group>> {
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
    @DecodedId(["params"]) id: number,
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
  async remove(@DecodedId(["params"]) id: number): Promise<Response<void>> {
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
    @DecodedId(["body","group_id"]) groupId: number,
    @DecodedId(["body","project_id"]) projectId: number,
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

  @Post('invite-response/:type')
  async respondToInvite(
  @Param('type') type: 'accept' | 'reject',
  @DecodedId(["body","group_id"]) groupId: number,
  @Request() request: any,
): Promise<Response<any>> {
  try {
    const userId = request.user?.id;

    if (!userId || !groupId) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: 'Thiếu thông tin' },
        HttpStatus.ERROR,
      );
    }

    const result = await this.groupsService.handleInviteResponse(userId, groupId, type);
      return new Response(result, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('update-status/:groupId')
  async updateStatusGroup(
    @DecodedId(["params","groupId"]) groupId: string | number,
    @Body('status') status: number,
    @Request() request: any,
): Promise<Response<any>> {
  try {
    const userId = request.user?.id;

    if (!userId || !groupId) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: 'Thiếu thông tin ' },
        HttpStatus.ERROR,
      );
    }

    const result = await this.groupsService.updateStatusGroup(userId, groupId, status);
      return new Response(result, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('lock-group')
  async lockGroup(
    @DecodedId(["body","department_id"]) department_id: number,
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

    const result = await this.groupsService.lockGroup(department_id,userId);
      return new Response(result, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('change-teacher')
  async changeTeacher(
    @DecodedId(["body", "groupId"]) groupId: number,
    @Body("teacher_code") teacher_code: number,
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

    const result = await this.groupsService.changeTeacher(teacher_code, groupId);
      return new Response(result, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
