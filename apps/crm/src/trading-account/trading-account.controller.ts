import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Patch, Query, Delete, Controller } from '@nestjs/common';

import { Role } from '@crm/types';
import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { TradingAccountIdValidator } from '@crm/validation';
import { Auth, Action, AuthenticatedReq, TradingAccountSubject } from '@crm/auth';

import { GetTradingAccountDto } from './dto/in/get-trading-account.dto';

import { TradingAccount } from './domain';
import { TradingAccountService } from './services';
import { ListTradingAccountsDto, CreateTradingAccountDto, UpdateTradingAccountDto } from './dto';

@ApiTags('Trading Account')
@ApiExtraModels(
  TradingAccount,
  CreateTradingAccountDto,
  GetTradingAccountDto,
  ListTradingAccountsDto,
  UpdateTradingAccountDto,
)
@Controller({ path: 'trading-accounts', version: '1' })
export class TradingAccountController {
  constructor(private readonly service: TradingAccountService) {}

  /**
   * Fetch a single trading account by id
   * @param tradingAccountId The trading account id to fetch
   * @param dto The payload dto
   */
  @Auth(Action.READ, TradingAccountSubject, { use: 'tradingAccountId', in: 'query', findBy: 'id' })
  @OpenApi({ type: TradingAccount })
  @Get()
  public async get(
    @Param('tradingAccountId', TradingAccountIdValidator) tradingAccountId: string,
    @Query() dto: GetTradingAccountDto,
  ): Promise<{ data: TradingAccount }> {
    return { data: await this.service.get(tradingAccountId, dto) };
  }

  /**
   * Lists trading accounts based on filter criteria.
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.READ, TradingAccountSubject, { use: 'userId', in: 'query', findBy: 'userId' })
  @OpenApi({ type: TradingAccount, isPaginated: true })
  @Get()
  public async list(
    @Query() dto: ListTradingAccountsDto,
    @Req() req: AuthenticatedReq,
  ): Promise<PaginatedResDto<TradingAccount>> {
    // todo test this as it will not work due to the subject
    // If the req is from an end user, scope the accounts
    if (req.user.roles.length === 1 && req.user.roles.includes(Role.USER)) {
      dto.userId = req.user.userId;
    }

    return await this.service.list(dto);
  }

  /**
   * Create a new trading account
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, TradingAccountSubject, { use: 'userId', in: 'query', findBy: 'userId' })
  @OpenApi({ type: TradingAccount })
  @Post()
  public async create(
    @Query() dto: CreateTradingAccountDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: TradingAccount }> {
    return { data: await this.service.create(dto, req) };
  }

  /**
   * Updates an existing trading account
   * @param tradingAccountId The trading account id to update
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.UPDATE, TradingAccountSubject, { use: 'tradingAccountId', in: 'query', findBy: 'id' })
  @OpenApi({ type: TradingAccount })
  @Patch(':tradingAccountId')
  public async update(
    @Param('tradingAccountId', TradingAccountIdValidator) tradingAccountId: string,
    @Query() dto: UpdateTradingAccountDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: TradingAccount }> {
    // Only allow admins to update the status of any trading account
    if (req.user.roles[0] === Role.USER) {
      dto.status = undefined;
    }

    return { data: await this.service.update(tradingAccountId, dto, req) };
  }

  /**
   * Deletes an existing trading account.
   * Closes any open trades and moves all funds from the trading account back to the user's wallet. The trading account
   * will be placed in a suspended state.
   * @param tradingAccountId The trading account to delete
   * @param req The authenticated request
   */
  @Auth(Action.DELETE, TradingAccountSubject, { use: 'tradingAccountId', in: 'query', findBy: 'id' })
  @OpenApi()
  @Delete(':tradingAccountId')
  public async delete(
    @Param('tradingAccountId', TradingAccountIdValidator) tradingAccountId: string,
    @Req() req: AuthenticatedReq,
  ): Promise<void> {
    await this.service.delete(tradingAccountId, req);
  }
}
