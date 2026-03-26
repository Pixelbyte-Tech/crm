import { Platform, Monetisation } from '@crm/types';

export type MTCredentials = {
  username: string;
  password: string;
};

export type TLCredentials = {
  apiKey: string;
  environment: 'live' | 'demo';
};

export type CTCredentials = {
  username: string;
  password: string;
  plant: string;
  brokerName: string;
  managerApi: {
    proxy: string;
    proxyPort: number;
  };
  reportingApi: {
    rmqUrl: `amqp://${string}:${string}@${string}:${number}`;
    queue: string;
  };
  reportingDb: {
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
  };
  snapshotApi: {
    url: string;
  };
};

export type Credentials = MTCredentials | TLCredentials | CTCredentials;

export class PlatformServer<T extends Credentials> {
  platform: Platform;
  monetisation: Monetisation;
  serverTimeZone: string;
  endpoint: string;
  offsetHours: number;
  credentials: T;

  constructor(data: PlatformServer<T>) {
    this.platform = data.platform;
    this.serverTimeZone = data.serverTimeZone;
    this.offsetHours = data.offsetHours;
    this.monetisation = data.monetisation;
    this.credentials = data.credentials;
    this.endpoint = data.endpoint;
  }
}
