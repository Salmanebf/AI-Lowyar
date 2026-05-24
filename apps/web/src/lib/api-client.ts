const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3000';

export async function gatewayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Gateway ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export type StackHealth = {
  status: string;
  checks: Record<string, string>;
};

export async function getStackHealth(): Promise<StackHealth> {
  return gatewayFetch<StackHealth>('/health');
}
