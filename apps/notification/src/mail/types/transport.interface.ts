import { SendEmailOpts } from './send-email-opts.interface';

export interface TransportService {
  sendMail(opts: SendEmailOpts): Promise<boolean>;
}
