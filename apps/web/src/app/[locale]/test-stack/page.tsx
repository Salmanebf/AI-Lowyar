'use client';

import { useEffect, useState } from 'react';

type StackHealth = {
  status: string;
  checks?: Record<string, string>;
  message?: string;
};

export default function TestStackPage() {
  const [health, setHealth] = useState<StackHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: StackHealth) => setHealth(data))
      .catch(() => setHealth({ status: 'error', message: 'Fetch failed' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Vérification de la pile...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Test de la pile MoroLex</h1>

      <div className="rounded-lg border p-6 shadow-sm">
        <p className="mb-4 text-lg">
          Statut global :{' '}
          <span className={health?.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
            {health?.status}
          </span>
        </p>

        {health?.checks && (
          <ul className="space-y-2">
            {Object.entries(health.checks).map(([service, status]) => (
              <li key={service} className="flex justify-between gap-8 font-mono text-sm">
                <span>{service}</span>
                <span className={status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                  {status}
                </span>
              </li>
            ))}
          </ul>
        )}

        {health?.message && <p className="mt-2 text-sm text-red-600">{health.message}</p>}
      </div>

      <p className="max-w-md text-center text-sm text-muted-foreground">
        Web → /api/health → Gateway /health → AI Service /health → Qdrant /healthz
      </p>
    </main>
  );
}
