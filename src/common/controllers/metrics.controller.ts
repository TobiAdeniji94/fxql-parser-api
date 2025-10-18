import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';

@ApiTags('monitoring')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Metrics in Prometheus format',
  })
  @ApiExcludeEndpoint() // Hide from public Swagger docs
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
