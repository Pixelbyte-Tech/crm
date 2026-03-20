import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheckResult,
  HealthCheckService,
  DiskHealthIndicator,
  HttpHealthIndicator,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
  HealthIndicatorFunction,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

import { AppConfig } from '../../config/app/app-config.type';

@Injectable()
export class HealthCheckProvider {
  constructor(
    private readonly config: ConfigService<{ app: AppConfig }>,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const tasks: Promise<HealthIndicatorResult>[] = [];

    // Push various health check tasks
    tasks.push(this.http.pingCheck('api', `http://localhost:3000/api/alive/ping`, { timeout: 2000 }));
    tasks.push(this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.8 }));
    tasks.push(this.db.pingCheck('database', { timeout: 5000 }));

    const brokers = this.config.get('app.kafkaBrokers', { infer: true });
    if (brokers) {
      tasks.push(
        ...brokers
          .split(',')
          .map((b) => b.trim())
          .map((url: string) => {
            const [host, port] = url.split(':');
            return this.microservice.pingCheck('kafka', {
              transport: Transport.TCP,
              options: { host, port },
            });
          }),
      );
    }

    // Process all the tasks and return the health check result
    const results: HealthIndicatorFunction[] = [];
    for (const result of await Promise.allSettled<HealthIndicatorResult>(tasks)) {
      if ('fulfilled' === result.status) {
        results.push(() => result.value);
      }
    }

    return this.health.check(results);
  }
}
