import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const dbHealthy = this.dataSource.isInitialized;
    let dbLatency = -1;

    if (dbHealthy) {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      dbLatency = Date.now() - start;
    }

    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbHealthy,
        latencyMs: dbLatency,
      },
    };
  }
}
