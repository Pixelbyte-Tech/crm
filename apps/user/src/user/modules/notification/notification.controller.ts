import { Post, Query, Controller } from '@nestjs/common';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';

import { OpenApi } from '@crm/swagger';

import { NotificationService } from './services';
import { ConfirmEmailDto, ForgotPasswordDto } from './dto';

@ApiTags('Notification')
@ApiExtraModels(ConfirmEmailDto, ForgotPasswordDto)
@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /**
   * Sends a forgot password mail to the provided address
   * @param dto The sending instructions
   */
  @OpenApi({ type: Boolean })
  @Post('forgot-password')
  public async get(@Query() dto: ForgotPasswordDto): Promise<{ data: boolean }> {
    return { data: await this.service.scheduleForgotPassword(dto) };
  }

  /**
   * Sends an email confirmation mail to the provided address
   * @param dto The sending instructions
   */
  @OpenApi({})
  @Post('confirm-email')
  public async list(@Query() dto: ConfirmEmailDto): Promise<{ data: boolean }> {
    return { data: await this.service.scheduleConfirmEmail(dto) };
  }
}
