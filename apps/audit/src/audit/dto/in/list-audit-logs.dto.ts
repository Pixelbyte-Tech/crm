import { Type, Transform } from 'class-transformer';
import { IsIP, IsEnum, IsUUID, IsDate, Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toArray, UserIdValidator } from '@crm/validation';
import { AuditAction, AuditTarget, AuditResult } from '@crm/types';

export class ListAuditLogsDto extends PaginatedReqDto {
  /** The starting date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date | null;

  /** The ending date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date | null;

  /** Filter by action */
  @IsOptional()
  @IsEnum(AuditAction, { each: true })
  @Transform(toArray(String))
  action?: AuditAction[];

  /** Filter by target */
  @IsOptional()
  @IsEnum(AuditTarget, { each: true })
  @Transform(toArray(String))
  target?: AuditTarget[];

  /** Filter by a specific target id */
  @IsOptional()
  @IsUUID()
  targetId?: string;

  /** Filter by result */
  @IsOptional()
  @IsEnum(AuditResult, { each: true })
  @Transform(toArray(String))
  result?: AuditResult[];

  /** Filter by a specific ip address */
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  /** Filter by a specific trace id */
  @IsOptional()
  traceId?: string;

  /** Filter by actions performed by a specific user */
  @IsOptional()
  @Validate(UserIdValidator)
  userId?: string;
}
