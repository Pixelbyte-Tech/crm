import { Validate } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { CompanyIdValidator } from '@crm/validation';

export class ListUsersDto extends PaginatedReqDto {
  @Validate(CompanyIdValidator)
  companyId: string;
}
