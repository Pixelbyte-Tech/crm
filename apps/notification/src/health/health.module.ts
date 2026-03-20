import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

import { PrometheusAdapter } from '@crm/utils';

import { HealthCheckProvider } from './providers';
import { HealthController } from './health.controller';

@Module({
  imports: [HttpModule, TerminusModule],
  providers: [HealthCheckProvider, PrometheusAdapter],
  controllers: [HealthController],
})
export class HealthModule {}
