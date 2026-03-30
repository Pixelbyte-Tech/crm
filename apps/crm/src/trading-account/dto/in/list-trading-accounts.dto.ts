import { Type, Transform } from 'class-transformer';
import { IsEnum, IsDate, Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { Platform, Monetisation, IntegrationName, TradingAccountStatus } from '@crm/types';
import {
  toArray,
  toBoolean,
  UserIdValidator,
  BooleanValidator,
  ServerIdValidator,
  IntegrationIdValidator,
  TradingAccountSchemaIdValidator,
} from '@crm/validation';

export class ListTradingAccountsDto extends PaginatedReqDto {
  /** The registration from date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registeredAtFrom?: Date | null;

  /** The registration end date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registeredAtTo?: Date | null;

  /** Filter by trading account status */
  @IsOptional()
  @IsEnum(IntegrationName, { each: true })
  @Transform(toArray(String))
  status?: TradingAccountStatus[];

  /** Filter by platform */
  @IsOptional()
  @IsEnum(Platform, { each: true })
  @Transform(toArray(String))
  platform?: Platform[];

  /** Filter by monetisation */
  @IsOptional()
  @IsEnum(IntegrationName, { each: true })
  @Transform(toArray(String))
  monetisation?: Monetisation[];

  /** Filter by integration */
  @IsOptional()
  @Validate(IntegrationIdValidator)
  integrationId?: string;

  /** Filter by server */
  @IsOptional()
  @Validate(ServerIdValidator)
  serverId?: string;

  /** Filter by schema */
  @IsOptional()
  @Validate(TradingAccountSchemaIdValidator)
  schemaId?: string;

  /** Filter by user */
  @IsOptional()
  @Validate(UserIdValidator)
  userId?: string;

  /** Whether to include the account balance */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incBalance?: boolean;

  /** Whether to include the account user group */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incUserGroup?: boolean;
}
