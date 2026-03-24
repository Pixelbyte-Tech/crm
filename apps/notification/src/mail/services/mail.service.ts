import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import { ConfigService } from '@nestjs/config';

import { SendEmailOpts } from '../types';
import { TransportFactory } from '../factories';
import { MailConfig } from '../config/mail-config.type';
import ResetPassword from '../templates/reset-password';
import { InviteEmail } from '../templates/invite-email';
import { ConfirmEmail } from '../templates/confirm-email';
import { AppConfig } from '../../config/app/app-config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly factory: TransportFactory,
    private readonly i18n: I18nService,
    private readonly config: ConfigService<{ mail: MailConfig; app: AppConfig }>,
  ) {}

  /**
   * Sends a confirmation email to the specified address
   * @param to The recipient email address
   * @param token The confirmation token
   * @param firstname The recipient's first name
   */
  async sendConfirmEmail(to: string, token: string, firstname?: string | null): Promise<boolean> {
    if (this.i18n) {
      // Fetch all necessary translations in parallel
      const [title, greeting, body, buttonText, linkText, farewell] = await Promise.all([
        this.i18n.t<string, string>('common.confirm-email.title'),
        this.i18n.t<string, string>('common.confirm-email.greeting'),
        this.i18n.t<string, string>('common.confirm-email.body'),
        this.i18n.t<string, string>('common.confirm-email.buttonText'),
        this.i18n.t<string, string>('common.confirm-email.linkText'),
        this.i18n.t<string, string>('common.confirm-email.farewell'),
      ]);

      // Construct the confirmation link
      const link = this.#constructFeUrl('/auth/confirm-email');
      link.searchParams.set('token', token);

      const greetingPersonalized = greeting.replace(`{{firstName}}`, firstname ?? to) ?? 'Please confirm your email';
      const html = await render(
        ConfirmEmail({
          title: title.replace(`{{firstName}}`, firstname ?? to),
          greeting: greetingPersonalized,
          body,
          link: link.toString(),
          buttonText,
          linkText,
          farewell,
          baseUrl: link.origin,
        }),
      );

      return await this.sendEmail({
        to: to,
        subject: greetingPersonalized,
        html: html,
      });
    }

    return false;
  }

  /**
   * Sends a reset password email to the specified address
   * @param to The recipient email address
   * @param token The confirmation token
   * @param firstname The recipient's first name
   */
  async sendResetPassword(to: string, token: string, firstname?: string | null): Promise<boolean> {
    if (this.i18n) {
      // Fetch all necessary translations in parallel
      const [title, greeting, body, buttonText, linkText, farewell] = await Promise.all([
        this.i18n.t<string, string>('common.reset-password.title'),
        this.i18n.t<string, string>('common.reset-password.greeting'),
        this.i18n.t<string, string>('common.reset-password.body'),
        this.i18n.t<string, string>('common.reset-password.buttonText'),
        this.i18n.t<string, string>('common.reset-password.linkText'),
        this.i18n.t<string, string>('common.reset-password.farewell'),
      ]);

      // Construct the confirmation link
      const link = this.#constructFeUrl('/auth/reset-password');
      link.searchParams.set('token', token);

      const greetingPersonalized = greeting.replace(`{{firstName}}`, firstname ?? to) ?? 'Reset your password';
      const html = await render(
        ResetPassword({
          title: title.replace(`{{firstName}}`, firstname ?? to),
          greeting: greetingPersonalized,
          body,
          link: link.toString(),
          buttonText,
          linkText,
          farewell,
          baseUrl: link.origin,
        }),
      );

      return await this.sendEmail({
        to: to,
        subject: greetingPersonalized,
        html: html,
      });
    }

    return false;
  }

  /**
   * Sends an invitation email to the specified address
   * @param to The recipient email address
   * @param company The company name the user is being invited to
   * @param token The confirmation token
   */
  async sendInvitationEmail(to: string, company: string, token: string): Promise<boolean> {
    if (this.i18n) {
      // Fetch all necessary translations in parallel
      const [title, greeting, body, buttonText, linkText, farewell] = await Promise.all([
        this.i18n.t<string, string>('common.invite-email.title'),
        this.i18n.t<string, string>('common.invite-email.greeting'),
        this.i18n.t<string, string>('common.invite-email.body'),
        this.i18n.t<string, string>('common.invite-email.buttonText'),
        this.i18n.t<string, string>('common.invite-email.linkText'),
        this.i18n.t<string, string>('common.invite-email.farewell'),
      ]);

      // Construct the confirmation link
      const link = this.#constructFeUrl('/auth/sign-up');
      link.searchParams.set('token', token);

      const greetingPersonalized = greeting.replace(`{{firstName}}`, to) ?? `Join ${company}`;
      const html = await render(
        InviteEmail({
          title: title.replace(`{{company}}`, company),
          greeting: greetingPersonalized,
          body: body.replace(`{{company}}`, company),
          link: link.toString(),
          buttonText: buttonText.replace(`{{company}}`, company),
          linkText,
          farewell,
          baseUrl: link.origin,
        }),
      );

      return await this.sendEmail({
        to: to,
        subject: greetingPersonalized,
        html: html,
      });
    }

    return false;
  }

  /**
   * Sends an email using AWS SES
   * @param opts The email options
   */
  async sendEmail(opts: SendEmailOpts): Promise<boolean> {
    const from = opts.from
      ? opts.from
      : `"${this.config.get('mail.defaultName', { infer: true })}" <${this.config.get('mail.defaultEmail', { infer: true })}>`;

    await this.factory.make().sendMail({
      to: opts.to,
      from,
      html: opts.html,
      subject: opts.subject,
    });

    return true;
  }

  /**
   * Constructs a URL object to the FE
   * @param path The path to append to the FE URL
   */
  #constructFeUrl(path?: string): URL {
    let feUrl = this.config.getOrThrow('app.frontendUrl', { infer: true });
    if (!feUrl.startsWith('http') && !feUrl.endsWith('https')) {
      feUrl = `http://${feUrl}`;
    }

    return path ? new URL(path, feUrl) : new URL(feUrl);
  }
}
