import { IsEnum, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { InvitationStatus } from '@crm/types';

export class ListInvitationsDto extends PaginatedReqDto {
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}
