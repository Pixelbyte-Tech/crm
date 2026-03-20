import { Transport } from '../types';

export type MailConfig = {
  transport: Transport;
  defaultEmail: string;
  defaultName: string;
  smtp: {
    host?: string;
    port?: number;
  };
  ses: {
    accessKeyId?: string;
    secretAccessKey?: string;
    awsRegion?: string;
  };
};
