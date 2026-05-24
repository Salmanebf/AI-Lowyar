import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AiServiceClient } from '../ai-service/ai-service.client';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: { isHealthy: async () => true },
        },
        {
          provide: AiServiceClient,
          useValue: { health: async () => ({ status: 'ok' }) },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns ok when all services are healthy', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.checks.gateway).toBe('ok');
    expect(result.checks.postgres).toBe('ok');
    expect(result.checks.ai_service).toBe('ok');
  });

  it('returns degraded when postgres is down', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            isHealthy: async () => {
              throw new Error('connection refused');
            },
          },
        },
        {
          provide: AiServiceClient,
          useValue: { health: async () => ({ status: 'ok' }) },
        },
      ],
    }).compile();

    const ctrl = module.get(HealthController);
    const result = await ctrl.check();
    expect(result.status).toBe('degraded');
    expect(result.checks.postgres).toBe('error');
  });
});
