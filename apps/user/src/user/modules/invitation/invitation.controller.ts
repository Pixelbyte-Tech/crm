import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Body, Post, Param, Query, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { CompanyIdValidator, CompanyInvitationIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, CompanyInvitationSubject } from '@crm/auth';

import { Invitation } from './domain';
import { InvitationService } from './services';
import { InviteUserDto, ListInvitationsDto } from './dto';

@ApiTags('Invitation')
@ApiExtraModels(InviteUserDto, ListInvitationsDto)
@Controller({ path: 'companies', version: '1' })
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  /**
   * Sends an invitation to an email address to join a company
   * @param companyId The company id to invite the user to
   * @param dto The invite user dto
   * @param req The authenticated request
   */
  @OpenApi()
  @Auth(Action.CREATE, CompanyInvitationSubject, { in: 'params', use: 'companyId', findBy: 'companyId' })
  @Post(':companyId/invitations')
  public async inviteUser(
    @Param('companyId', CompanyIdValidator) companyId: string,
    @Body() dto: InviteUserDto,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.inviteUser(dto, req.user.userId, companyId);
  }

  /**
   * Lists all invitations for a company
   * @param companyId The company id to list invitations for
   * @param dto The filter dto
   */
  @OpenApi({ type: Invitation, isPaginated: true })
  @Auth(Action.READ, CompanyInvitationSubject, { in: 'params', use: 'companyId', findBy: 'companyId' })
  @Get(':companyId/invitations')
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
  @Auth(Action.CREATE, CompanyInvitationSubject, { in: 'params', use: 'invitationId', findBy: 'id' })
  @Post(':companyId/invitations/:invitationId')
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
  @Auth(Action.DELETE, CompanyInvitationSubject, { in: 'params', use: 'invitationId', findBy: 'id' })
  @Delete(':companyId/invitations/:invitationId')
  public async deleteUserInvitation(
    @Param('invitationId', CompanyInvitationIdValidator) invitationId: string,
  ): Promise<void> {
    await this.service.deleteInvitation(invitationId);
  }
}
