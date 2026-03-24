import { ApiTags } from '@nestjs/swagger';
import { Get, Header, Controller } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('ping')
  @Header('Content-Type', 'text/plain')
  ping(): string {
    return 'pong';
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => await this.http.pingCheck('ui', 'http://localhost:3000/admin/ui')]);
  }
}
