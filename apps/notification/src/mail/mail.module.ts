import * as path from 'path';

import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver } from 'nestjs-i18n';

import { MailService } from './services';
import { TransportFactory } from './factories';
import { MailController } from './mail.controller';
import { SesTransport, SmtpTransport } from './transports';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      resolvers: [{ use: QueryResolver, options: ['lang'] }],
    }),
  ],
  providers: [MailService, SesTransport, SmtpTransport, TransportFactory],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
