import { Module } from '@nestjs/common';
import { AiServiceModule } from './ai-service/ai-service.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AiServiceModule, HealthModule],
})
export class AppModule {}
