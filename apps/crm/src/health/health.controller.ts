import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { HealthCheckResult } from '@nestjs/terminus';
import { Get, Res, Header, Controller } from '@nestjs/common';

import { PrometheusAdapter } from '@crm/utils';

import { HealthCheckProvider } from './providers';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prometheusAdapter: PrometheusAdapter,
    private readonly healthCheckProvider: HealthCheckProvider,
  ) {}

  @Get('ping')
  @Header('Content-Type', 'text/plain')
  ping(): string {
    return 'pong';
  }

  @Get()
  @HealthCheck()
  async check(@Res() res: Response): Promise<HealthCheckResult | void> {
    try {
      res.status(200).json(await this.healthCheckProvider.check());
    } catch (err) {
      if (err instanceof Object && 'response' in err && err.response instanceof Object && 'details' in err.response) {
        res.status(200).json({
          status: 'down',
          details: err.response.details,
          error: { status: 'down', err },
        });

        return;
      }

      res.status(200).json({
        status: 'down',
        error: { status: 'down', err },
      });
    }
  }

  @Get('prometheus')
  @HealthCheck()
  @Header('Content-Type', 'text/plain')
  async prometheus(): Promise<string> {
    try {
      return this.prometheusAdapter.convert(await this.healthCheckProvider.check());
    } catch (err) {
      return this.prometheusAdapter.convert(
        err instanceof Object && 'response' in err
          ? (err.response as HealthCheckResult)
          : { details: { error: { status: 'down', err } }, status: 'error' },
      );
    }
  }
}
