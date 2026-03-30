import { Request } from 'express';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Body, Post, Param, Patch, Query, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { Role, User } from '@crm/types';
import { PaginatedResDto } from '@crm/http';
import { UserIdValidator } from '@crm/validation';
import { Auth, Action, UserSubject, AuthenticatedReq } from '@crm/auth';

import { UserService } from './services';
import {
  NewUserDto,
  ListUsersDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserDetailsDto,
  UpdateUserSettingsDto,
} from './dto';

@ApiTags('User')
@ApiExtraModels(NewUserDto, CreateUserDto, ListUsersDto, UpdateUserDto, UpdateUserDetailsDto, UpdateUserSettingsDto)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly service: UserService) {}

  /**
   * Get a user by id
   * @param userId The user id to fetch
   */
  @Auth(Action.READ, UserSubject, { in: 'params', use: 'userId', findBy: 'id' })
  @OpenApi({ type: User })
  @Get(':userId')
  public async get(@Param('userId', UserIdValidator) userId: string): Promise<{ data: User }> {
    return { data: await this.service.get(userId) };
  }

  /**
   * Lists all users in the system
   * @param dto The payload dto with options to filter the results by.
   */
  @Auth(Action.READ, UserSubject)
  @OpenApi({ type: User, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListUsersDto): Promise<PaginatedResDto<User>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new user
   * @param dto The payload dto
   * @param req The request
   */
  @OpenApi({ type: NewUserDto })
  @Post()
  public async create(@Body() dto: CreateUserDto, @Req() req: Request): Promise<{ data: NewUserDto }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates a user by id
   * @param userId The user id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, UserSubject, { in: 'params', use: 'userId', findBy: 'id' })
  @OpenApi({ type: User })
  @Patch(':userId')
  public async update(
    @Param('userId', UserIdValidator) userId: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: User }> {
    // Only allow admins to update the status of any user
    if (req.user.roles.length === 1 && req.user.roles[0] === Role.USER) {
      dto.status = undefined;
    }

    return { data: await this.service.update(userId, dto, req) };
  }

  /**
   * Updates a user's settings by user id
   * @param userId The user id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, UserSubject, { in: 'params', use: 'userId', findBy: 'id' })
  @OpenApi({ type: User })
  @Patch(':userId/settings')
  public async updateSettings(
    @Param('userId', UserIdValidator) userId: string,
    @Body() dto: UpdateUserSettingsDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: User }> {
    return { data: await this.service.updateSettings(userId, dto, req) };
  }

  /**
   * Updates a user's details by user id
   * @param userId The user id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, UserSubject, { in: 'params', use: 'userId', findBy: 'id' })
  @OpenApi({ type: User })
  @Patch(':userId/details')
  public async updateDetails(
    @Param('userId', UserIdValidator) userId: string,
    @Body() dto: UpdateUserDetailsDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: User }> {
    return { data: await this.service.updateDetails(userId, dto, req) };
  }

  /**
   * Deletes a user by id
   * @param userId The user id to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, UserSubject, { in: 'params', use: 'userId', findBy: 'id' })
  @OpenApi()
  @Delete(':userId')
  public async delete(@Param('userId', UserIdValidator) userId: string, @Req() req: AuthenticatedReq): Promise<void> {
    await this.service.delete(userId, req);
  }
}
