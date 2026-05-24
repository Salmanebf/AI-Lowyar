import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiServiceModule } from './ai-service/ai-service.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiServiceModule,
    HealthModule,
  ],
})
export class AppModule {}
