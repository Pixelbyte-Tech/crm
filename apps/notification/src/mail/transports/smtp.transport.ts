import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { MailConfig } from '../config/mail-config.type';
import { SendEmailOpts, TransportService } from '../types';

@Injectable()
export class SmtpTransport implements TransportService {
  constructor(private readonly config: ConfigService<{ mail: MailConfig }>) {}

  /** The SMTP transporter client */
  #client: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

  /**
   * Bootstrap the SMTP client if not already initialised
   */
  #bootstrapClient(): void {
    if (this.#client) {
      return;
    }

    this.#client = createTransport({
      host: this.config.getOrThrow('mail.smtp.host', { infer: true }),
      port: this.config.getOrThrow('mail.smtp.port', { infer: true }),
      secure: false,
    });
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

    console.log(opts);

    await this.#client.sendMail({
      to: opts.to,
      from,
      html: opts.html,
      subject: opts.subject,
    });

    return true;
  }
}
