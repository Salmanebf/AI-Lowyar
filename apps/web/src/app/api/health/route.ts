import { NextResponse } from 'next/server';
import { getStackHealth } from '@/lib/api-client';

export async function GET() {
  try {
    const health = await getStackHealth();
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Gateway unreachable' },
      { status: 502 },
    );
  }
}
