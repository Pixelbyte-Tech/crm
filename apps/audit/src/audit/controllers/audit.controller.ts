import { Get, Query, Controller } from '@nestjs/common';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { Auth, Action, AuditLogSubject } from '@crm/auth';

import { AuditLog } from '../domain';
import { ListAuditLogsDto } from '../dto';
import { AuditService } from '../services';

@ApiTags('Audit')
@ApiExtraModels(ListAuditLogsDto)
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly service: AuditService) {}

  /**
   * Lists audit log entries based on filter criteria
   * @param dto The payload dto with options to filter the results by.
   */
  @Auth(Action.READ, AuditLogSubject)
  @OpenApi({ type: AuditLog, isPaginated: true })
  @Get()
  public async list(@Query() dto: ListAuditLogsDto): Promise<PaginatedResDto<AuditLog>> {
    return await this.service.list(dto);
  }
}
