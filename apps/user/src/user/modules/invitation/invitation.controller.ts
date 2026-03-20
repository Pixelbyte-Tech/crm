import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Body, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { Auth, Action, CompanyInvitationSubject } from '@crm/auth';
import { UserIdValidator, CompanyIdValidator, CompanyInvitationIdValidator } from '@crm/validation';

import { Invitation } from './domain';
import { InvitationService } from './services';
import { InviteUserDto, ListInvitationsDto } from './dto';

@ApiTags('Invitation')
@ApiExtraModels(InviteUserDto, ListInvitationsDto)
@Controller({ version: '1' })
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  /**
   * Sends an invitation to an email address to join a company
   * @param userId The user id of the inviter
   * @param companyId The company id to invite the user to
   * @param dto The invite user dto
   */
  // todo fix
  @Auth(Action.CREATE, CompanyInvitationSubject, { in: 'query', param: 'userId' })
  @OpenApi()
  @Post('users/:userId/companies/:companyId/invitations')
  public async inviteUser(
    @Param('userId', UserIdValidator) userId: string,
    @Param('companyId', CompanyIdValidator) companyId: string,
    @Body() dto: InviteUserDto,
  ): Promise<void> {
    await this.service.inviteUser(dto, userId, companyId);
  }

  /**
   * Lists all invitations for a company
   * @param companyId The company id to list invitations for
   * @param dto The filter dto
   */
  // todo fix
  @Auth(Action.READ, CompanyInvitationSubject, { in: 'query', param: 'companyId' })
  @OpenApi({ type: Invitation, isPaginated: true })
  @Get('companies/:companyId/invitations')
  public async list(
    @Param('companyId', CompanyIdValidator) companyId: string,
    @Query() dto: ListInvitationsDto,
  ): Promise<PaginatedResDto<Invitation>> {
    return await this.service.listInvitations(companyId, dto);
  }

  /**
   * Resends a company invitation to a user by email
   * @param invitationId The invitation id to resend
   */
  @Auth(Action.CREATE, CompanyInvitationSubject, { in: 'query', param: 'invitationId' })
  @OpenApi()
  @Patch('companies/:companyId/invitations/:invitationId')
  public async resendInvitation(
    @Param('invitationId', CompanyInvitationIdValidator) invitationId: string,
  ): Promise<void> {
    await this.service.resendInvitation(invitationId);
  }

  /**
   * Deletes an invitation sent to an email address to join a company
   * @param invitationId The invitation id to delete
   */
  @Auth(Action.DELETE, CompanyInvitationSubject, { in: 'query', param: 'invitationId' })
  @OpenApi()
  @Delete('companies/:companyId/invitations/:invitationId')
  public async deleteUserInvitation(
    @Param('invitationId', CompanyInvitationIdValidator) invitationId: string,
  ): Promise<void> {
    await this.service.deleteInvitation(invitationId);
  }
}
