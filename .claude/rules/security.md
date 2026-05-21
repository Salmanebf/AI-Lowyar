# Security rules

- Never commit secrets. `.env*` files are gitignored. Use `.env.example` with placeholder values.
- All user input validated with Zod (TS) or Pydantic (Python) before reaching business logic.
- Rate limits on every public endpoint. Defaults in `apps/gateway/src/rate-limit/`.
- Auth on every non-public route. Use the `@AuthGuard()` decorator (NestJS) or FastAPI dependency.
- Telegram webhook: validate the secret token header on every request.
- LLM prompts: treat user input as untrusted. Use the prompt-injection guardrail in `apps/ai-service/app/guardrails/`.
- Logs must NEVER contain raw PII or full message content in production. Hash or truncate.
- Database queries always parameterized. Prisma handles this; raw SQL goes through tagged template literals only.
- Dependencies: pin versions. Re-pin only when intentionally updating.
