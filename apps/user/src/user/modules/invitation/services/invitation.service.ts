import { DateTime } from 'luxon';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  Logger,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PaginatedResDto } from '@crm/http';
import { Role, InvitationStatus } from '@crm/types';
import { UserEntity, InvitationEntity } from '@crm/database';

import { Invitation } from '../domain';
import { InvitationMapper } from '../mappers';
import { InviteUserDto, ListInvitationsDto } from '../dto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationMapper: InvitationMapper,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(InvitationEntity)
    private readonly invitationRepo: Repository<InvitationEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Invites a new user to the system. Sends an invitation email to the user.
   * @param dto The invite user dto
   * @param fromUserId The id of the user sending the invite
   */
  async inviteUser(dto: InviteUserDto, fromUserId: string): Promise<boolean> {
    const msg = `Inviting '${dto.email}' by user '${fromUserId}'`;
    this.#logger.log(`${msg} - Start`);

    // Fetch the user sending the invite
    const user = await this.userRepo.findOne({ where: { id: fromUserId } });
    if (!user) {
      this.#logger.error(`${msg}. Cannot find inviting user - Failed`);
      throw new UnprocessableEntityException('Inviting user not found');
    }

    let invitation: Invitation;

    try {
      // Create the invitation
      invitation = await this.#createInvitation(dto.email, dto.roles);
    } catch (err) {
      this.#logger.error(`${msg}. Unable to create the invitation - Failed`, err);
      throw new InternalServerErrorException('Failed to create the invitation');
    }

    try {
      // Send the invitation email and mark as sent
      // todo send invitation email
      await this.#markInvitationSent(invitation.id);

      this.#logger.log(`${msg} - Complete`);
      return true;
    } catch (err) {
      this.#logger.error(`${msg}. Unable to send invitation email - Failed`, err);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  /**
   * Lists all invitations
   * @param dto The dto with options to filter the results by.
   */
  async listInvitations(dto: ListInvitationsDto): Promise<PaginatedResDto<Invitation>> {
    // Find all invitations
    const invitations = await paginate(
      this.invitationRepo,
      { limit: dto.limit, page: dto.page },
      { where: { ...(dto.status ? { status: dto.status } : {}) }, order: { createdAt: dto.sortDir } },
    );

    return {
      data: invitations.items.map(this.invitationMapper.toInvitation),
      page: invitations.meta.currentPage,
      limit: invitations.meta.itemsPerPage,
      total: invitations.meta.totalItems,
    };
  }

  /**
   * Resends an invitation to a user.
   * @param invitationId The id of the invitation to resend
   */
  async resendInvitation(invitationId: string): Promise<boolean> {
    const msg = `Resending invitation '${invitationId}' email`;
    this.#logger.log(`${msg} - Start`);

    // Find the invitation
    const invitation = await this.invitationRepo.findOne({ where: { id: invitationId } });
    if (!invitation) {
      this.#logger.warn(`${msg}. Invitation not found - Failed`);
      throw new NotFoundException('Invitation not found');
    }

    if (InvitationStatus.PENDING !== invitation.status) {
      throw new UnprocessableEntityException('Invitation must be in pending status to be resent');
    }

    try {
      // Send the invitation email and mark as sent
      // todo send invitation email
      await this.#markInvitationSent(invitation.id);

      this.#logger.log(`${msg} - Complete`);
      return true;
    } catch (err) {
      this.#logger.error(`${msg}. Unable to send invitation email - Failed`, err);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  /**
   * Deletes an existing invitation.
   * @param invitationId The id of the invitation to delete
   */
  async deleteInvitation(invitationId: string): Promise<boolean> {
    const msg = `Deleting invitation '${invitationId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the invitation
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      this.#logger.warn(`${msg}. Invitation not found - Failed`);
      throw new NotFoundException('Invitation not found');
    }

    if (InvitationStatus.PENDING !== invitation.status) {
      throw new UnprocessableEntityException('Invitation must be in pending status to be deleted');
    }

    // Delete the invitation
    const res = await this.invitationRepo.delete({ id: invitation.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    return true;
  }

  /**
   * Accepts an invitation by their token.
   * Applies the roles present in the invitation to the user being invited.
   * @param token The token of the invitation to accept
   */
  async accept(token: string): Promise<boolean> {
    const msg = `Accepting invitation from token '${token}'`;

    // Find the invitation by token
    const invitation = await this.invitationRepo.findOne({
      where: { token, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      this.#logger.warn(`${msg}. Invitation not found or already processed - Failed`);
      throw new NotFoundException('Invalid or expired invitation token');
    }

    // Find the user by email
    const user = await this.userRepo.findOne({ where: { email: invitation.email } });
    if (!user) {
      this.#logger.warn(`${msg}. User linked to invitation not found - Failed`);
      throw new NotFoundException('User linked to invitation not found');
    }

    try {
      // Assign the user roles based on the invitation
      await this.userRepo.update({ id: user.id }, { roles: invitation.roles });

      // Update the invitation status to 'accepted'
      const res = await this.invitationRepo.update({ token: token }, { status: InvitationStatus.ACCEPTED });
      if (res.affected && res.affected > 0) {
        this.#logger.log(`${msg} - Complete`);
        return true;
      }
    } catch (err) {
      this.#logger.error(`${msg} - Failed to assign user to company`, err);
      return false;
    }

    this.#logger.error(`${msg} - Failed`);
    return false;
  }

  /**
   * Rejects an invitation by their token.
   * @param token The token of the invitation to reject
   */
  async reject(token: string): Promise<boolean> {
    const msg = `Rejecting invitation from token '${token}'`;

    // Find the invitation by token
    const invitation = await this.invitationRepo.findOne({ where: { token, status: InvitationStatus.PENDING } });
    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation token');
    }

    // Update the invitation status to rejected
    const res = await this.invitationRepo.update({ token }, { status: InvitationStatus.REJECTED });
    if (res.affected && res.affected > 0) {
      this.#logger.log(`${msg} - Complete`);
      return true;
    }

    this.#logger.error(`${msg} - Failed`);
    return false;
  }

  /**
   * Marks an invitation as sent by updating the firstSentAt and lastSentAt timestamps.
   * @param invitationId The id of the invitation to mark as sent
   */
  async #markInvitationSent(invitationId: string): Promise<void> {
    const result = await this.invitationRepo.update(
      { id: invitationId, firstSentAt: IsNull(), status: InvitationStatus.PENDING },
      { firstSentAt: DateTime.utc().toJSDate() },
    );

    if (!result.affected || result.affected === 0) {
      await this.invitationRepo.update(
        { id: invitationId, status: InvitationStatus.PENDING },
        { lastSentAt: DateTime.utc().toJSDate() },
      );
    }
  }

  /**
   * Creates a new invitation.
   * @param email The email of the invited user
   * @param roles The roles to assign to the user
   */
  async #createInvitation(email: string, roles: Role[]): Promise<Invitation> {
    // Check if an invitation already exists for the email
    const existingInvitation = await this.invitationRepo.findOne({
      where: { email, status: InvitationStatus.PENDING },
    });

    if (existingInvitation) {
      return this.invitationMapper.toInvitation(existingInvitation);
    }

    // Generate a unique token for the invitation
    const token = [...Array(30)].map(() => Math.random().toString(36)[2]).join('');

    // Otherwise, create a new invitation
    const invitation = new InvitationEntity();
    invitation.email = email;
    invitation.roles = roles;
    invitation.token = token;
    invitation.status = InvitationStatus.PENDING;

    return this.invitationMapper.toInvitation(await this.invitationRepo.save(invitation));
  }
}
