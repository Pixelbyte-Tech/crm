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
  @OpenApi()
  @Auth(Action.CREATE, CompanyInvitationSubject, { in: 'query', use: 'userId', findBy: 'sentByUserId' })
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
  @OpenApi({ type: Invitation, isPaginated: true })
  @Auth(Action.READ, CompanyInvitationSubject, { in: 'query', use: 'companyId', findBy: 'companyId' })
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
  @OpenApi()
  @Auth(Action.UPDATE, CompanyInvitationSubject, { in: 'query', use: 'invitationId', findBy: 'id' })
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
  @OpenApi()
  @Auth(Action.DELETE, CompanyInvitationSubject, { in: 'query', use: 'invitationId', findBy: 'id' })
  @Delete('companies/:companyId/invitations/:invitationId')
  public async deleteUserInvitation(
    @Param('invitationId', CompanyInvitationIdValidator) invitationId: string,
  ): Promise<void> {
    await this.service.deleteInvitation(invitationId);
  }
}
