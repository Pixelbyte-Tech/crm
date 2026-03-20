import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Body, Post, Param, Patch, Query, Delete, Controller } from '@nestjs/common';

import { Auth } from '@crm/auth';
import { User } from '@crm/types';
import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { UserIdValidator } from '@crm/validation';
import { Action } from '@crm/auth/dist/modules/casl/types';
import { UserSubject } from '@crm/auth/dist/modules/casl/subjects';

import { UserService } from './services';
import { NewUserDto, ListUsersDto, CreateUserDto, UpdateUserDto } from './dto';

@ApiTags('User')
@ApiExtraModels(NewUserDto, CreateUserDto, ListUsersDto, UpdateUserDto)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly service: UserService) {}

  /**
   * Get a user by id
   * @param userId The user id to fetch
   */
  @Auth(Action.READ, UserSubject, { in: 'query', param: 'userId' })
  @OpenApi({ type: User })
  @Get(':userId')
  public async get(@Param('userId', UserIdValidator) userId: string): Promise<{ data: User }> {
    const result = await this.service.get(userId);
    return { data: result };
  }

  /**
   * Lists all users in the system
   * @param dto The dto with options to filter the results by.
   */
  // todo fix
  @Auth(Action.READ, UserSubject, { in: 'query', param: 'userId' })
  @OpenApi({ type: User, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListUsersDto): Promise<PaginatedResDto<User>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new user
   * @param dto The dto
   */
  @OpenApi({ type: NewUserDto })
  @Post()
  public async create(@Body() dto: CreateUserDto): Promise<{ data: NewUserDto }> {
    return { data: await this.service.create(dto) };
  }

  /**
   * Updates a user by id
   * @param userId The user id to update
   * @param dto The dto
   */
  @Auth(Action.UPDATE, UserSubject, { in: 'query', param: 'userId' })
  @OpenApi({ type: User })
  @Patch(':userId')
  public async update(
    @Param('userId', UserIdValidator) userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<{ data: User }> {
    // Only allow admins to update the status of any user
    // todo do not allow users to update their own status

    return { data: await this.service.update(userId, dto) };
  }

  /**
   * Deletes a user by id
   * @param userId The user id to delete
   */
  @Auth(Action.DELETE, UserSubject, { in: 'query', param: 'userId' })
  @OpenApi()
  @Delete(':userId')
  public async delete(@Param('userId', UserIdValidator) userId: string): Promise<void> {
    await this.service.delete(userId);
  }
}
