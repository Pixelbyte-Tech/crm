import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Transport, TransportService } from '../types';
import { MailConfig } from '../config/mail-config.type';
import { UnknownTransportException } from '../exceptions';
import { SesTransport, SmtpTransport } from '../transports';

@Injectable()
export class TransportFactory {
  constructor(
    private readonly config: ConfigService<{ mail: MailConfig }>,
    private readonly smtpTransport: SmtpTransport,
    private readonly sesTransport: SesTransport,
  ) {}

  /**
   * Return an email transport for the application
   */
  make(): TransportService {
    let transport: TransportService;
    const type = this.config.getOrThrow<string>('mail.transport', { infer: true });
    switch (type) {
      case Transport.SES:
        transport = this.sesTransport;
        break;
      case Transport.SMTP:
        transport = this.smtpTransport;
        break;
      default:
        throw new UnknownTransportException(type);
    }

    return transport;
  }
}
