import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SESTransport from 'nodemailer/lib/ses-transport';
import { Transporter, createTransport } from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

import { MailConfig } from '../config/mail-config.type';
import { SendEmailOpts, TransportService } from '../types';

@Injectable()
export class SesTransport implements TransportService {
  constructor(private readonly config: ConfigService<{ mail: MailConfig }>) {}

  /** The SES transporter client */
  #client: Transporter<SESTransport.SentMessageInfo, SESTransport.Options>;

  /**
   * Bootstrap the SES client if not already initialized
   */
  #bootstrapClient(): void {
    if (this.#client) {
      return;
    }

    const sesClient = new SESv2Client({
      credentials: {
        accessKeyId: this.config.getOrThrow('mail.ses.accessKeyId', { infer: true }),
        secretAccessKey: this.config.getOrThrow('mail.ses.secretAccessKey', { infer: true }),
      },
      region: this.config.getOrThrow('mail.ses.awsRegion', { infer: true }),
    });

    this.#client = createTransport({ SES: { sesClient, SendEmailCommand } });
  }

  /**
   * Sends an email using AWS SES
   * @param opts The email options
   */
  async sendMail(opts: SendEmailOpts): Promise<boolean> {
    this.#bootstrapClient();

    const from = opts.from
      ? opts.from
      : `"${this.config.get('mail.defaultName', { infer: true })}" <${this.config.get('mail.defaultEmail', { infer: true })}>`;

    await this.#client.sendMail({
      to: opts.to,
      from,
      html: opts.html,
      subject: opts.subject,
    });

    return true;
  }
}
