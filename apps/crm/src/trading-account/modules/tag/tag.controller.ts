import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { TagIdValidator } from '@crm/validation';
import { Auth, Action, TagSubject, AuthenticatedReq } from '@crm/auth';

import { Tag } from './domain';
import { TagService } from './services';
import { ListTagsDto, UpdateTagDto, CreateTagDto } from './dto';

@ApiTags('Tag')
@ApiExtraModels(Tag, CreateTagDto, ListTagsDto, UpdateTagDto)
@Controller({ path: 'tags', version: '1' })
export class TagController {
  constructor(private readonly service: TagService) {}

  /**
   * Fetch a single tag by id
   * @param tagId The tag id to fetch
   */
  @Auth(Action.READ, TagSubject)
  @OpenApi({ type: Tag })
  @Get(':tagId')
  public async get(@Param('tagId', TagIdValidator) tagId: string): Promise<{ data: Tag }> {
    return { data: await this.service.get(tagId) };
  }

  /**
   * Lists tags based on filter criteria.
   * @param dto The payload dto
   */
  @Auth(Action.READ, TagSubject)
  @OpenApi({ type: Tag, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListTagsDto): Promise<PaginatedResDto<Tag>> {
    return await this.service.list(dto);
  }

  /**
   * Create a new tag
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, TagSubject)
  @OpenApi({ type: Tag })
  @Post()
  public async create(@Query() dto: CreateTagDto, @Req() req: AuthenticatedReq): Promise<{ data: Tag }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing tag
   * @param tagId The tag id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, TagSubject)
  @OpenApi({ type: Tag })
  @Patch(':tagId')
  public async update(
    @Param('tagId', TagIdValidator) tagId: string,
    @Query() dto: UpdateTagDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: Tag }> {
    return { data: await this.service.update(tagId, dto, req) };
  }

  /**
   * Deletes an existing tag
   * @param tagId The tag to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, TagSubject)
  @OpenApi()
  @Delete(':tagId')
  public async delete(@Param('tagId', TagIdValidator) tagId: string, @Req() req: AuthenticatedReq): Promise<void> {
    await this.service.delete(tagId, req);
  }
}
