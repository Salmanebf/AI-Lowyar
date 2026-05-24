import { Injectable } from '@nestjs/common';

@Injectable()
export class AiServiceClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
  }

  async health(): Promise<{ status: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`AI service returned ${res.status}`);
      }

      return (await res.json()) as { status: string };
    } finally {
      clearTimeout(timeout);
    }
  }
}
