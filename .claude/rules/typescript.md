# TypeScript rules (apps/web/, apps/gateway/, packages/)

- TypeScript strict mode. No `any`, no `as any`, no `// @ts-ignore` (use `@ts-expect-error` with a reason if absolutely needed).
- Zod for all runtime validation (request bodies, env vars, external API responses).
- Prefer `type` over `interface` unless extending or declaration-merging.
- Async iterators / streams for SSE — never buffer full LLM responses.
- NestJS: each feature is a module (`<feature>.module.ts`) with controller / service / dto / spec files.
- DTOs are Zod schemas in `*.dto.ts`, validated via a `ZodValidationPipe`.
- Database access only via Prisma client injected through a `PrismaService`. No raw SQL except in dedicated `*.repository.ts`.
- Next.js: Server Components by default. Add `"use client"` only when interactivity demands it.
- API calls from web → gateway use a typed `apiClient` (shared types from `packages/shared-types/`).
- Tests: Vitest. Co-located `*.spec.ts`. Integration tests in `__tests__/integration/`.

Never:
- Put secrets in client-side code (anything outside `apps/gateway/` server context).
- Call the AI service directly from the web app — always go through the gateway.
- Use `fetch` without timeout + error handling.
