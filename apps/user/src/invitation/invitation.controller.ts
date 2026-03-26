import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Body, Post, Param, Query, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { InvitationIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, InvitationSubject } from '@crm/auth';

import { Invitation } from './domain';
import { InvitationService } from './services';
import { InviteUserDto, ListInvitationsDto } from './dto';

@ApiTags('Invitation')
@ApiExtraModels(InviteUserDto, ListInvitationsDto)
@Controller({ path: 'invitations', version: '1' })
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  /**
   * Sends an invitation to an email address to join
   * @param dto The invite user dto
   * @param req The authenticated request
   */
  @OpenApi()
  @Auth(Action.CREATE, InvitationSubject)
  @Post()
  public async inviteUser(@Body() dto: InviteUserDto, @Req() req: AuthenticatedReq): Promise<void> {
    await this.service.inviteUser(dto, req.user.userId);
  }

  /**
   * Lists all invitations based on filter criteria
   * @param dto The filter dto
   */
  @OpenApi({ type: Invitation, isPaginated: true })
  @Auth(Action.READ, InvitationSubject)
  @Get()
  public async list(@Query() dto: ListInvitationsDto): Promise<PaginatedResDto<Invitation>> {
    return await this.service.listInvitations(dto);
  }

  /**
   * Resends an invitation to a user by email
   * @param invitationId The invitation id to resend
   */
  @OpenApi()
  @Auth(Action.CREATE, InvitationSubject)
  @Post(':invitationId')
  public async resendInvitation(@Param('invitationId', InvitationIdValidator) invitationId: string): Promise<void> {
    await this.service.resendInvitation(invitationId);
  }

  /**
   * Deletes an invitation sent to an email address to join
   * @param invitationId The invitation id to delete
   */
  @OpenApi()
  @Auth(Action.DELETE, InvitationSubject)
  @Delete(':invitationId')
  public async deleteUserInvitation(@Param('invitationId', InvitationIdValidator) invitationId: string): Promise<void> {
    await this.service.deleteInvitation(invitationId);
  }
}
