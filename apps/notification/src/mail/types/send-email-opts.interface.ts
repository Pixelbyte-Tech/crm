export interface SendEmailOpts {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
}
