import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiServiceClient } from '../ai-service/ai-service.client';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AiServiceClient) private readonly aiService: AiServiceClient,
  ) {}

  @Get()
  async check() {
    const checks: Record<string, string> = { gateway: 'ok' };

    try {
      await this.prisma.isHealthy();
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
    }

    try {
      const aiHealth = await this.aiService.health();
      checks.ai_service = aiHealth.status;
    } catch {
      checks.ai_service = 'error';
    }

    const overall = Object.values(checks).every((v) => v === 'ok') ? 'ok' : 'degraded';

    return { status: overall, checks };
  }
}
