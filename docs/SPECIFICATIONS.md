# Moroccan Legal AI Assistant — Technical Specifications & Roadmap

**Project codename:** `MoroLex` (placeholder — change anytime)
**Document version:** 1.0
**Last updated:** 2026-05-19
**Author:** Project owner (solo dev)
**Scope:** Development specifications + phased roadmap

---

## 1. Executive Summary

A legal AI assistant specialized in **Moroccan law**, accessible via **web chat** and **Telegram bot**, supporting **French and Arabic**. Built to scale from a single legal domain (**Labor Law / Code du Travail**) at v1 to **all major branches of Moroccan law** in later phases, without architectural rewrites.

The system combines a **fine-grained legal knowledge base** (corpus of Moroccan codes, jurisprudence, official gazette texts) with **Retrieval-Augmented Generation (RAG)**, an **agentic routing layer** (domain classifier → specialist agent), and a **multi-channel delivery layer** (web app, Telegram).

**Primary goal:** real, monetizable product. **Secondary goal:** deep learning of AI engineering.

---

## 2. Core Product Requirements

### 2.1 Functional requirements (v1 — Labor Law)

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | User can ask legal questions in French or Arabic and receive grounded answers | MUST |
| F-02 | Every answer includes **source citations** (article number, code, link to text) | MUST |
| F-03 | System refuses to answer when confidence is low rather than hallucinate | MUST |
| F-04 | User can have multi-turn conversations (chat memory within session) | MUST |
| F-05 | User can access the system via web chat UI | MUST |
| F-06 | User can access the system via Telegram bot | MUST |
| F-07 | System detects question language and answers in same language | MUST |
| F-08 | Authentication (email/password + Google OAuth) | MUST |
| F-09 | Conversation history saved per user | SHOULD |
| F-10 | Rate limiting per user (anti-abuse + cost control) | MUST |
| F-11 | Admin dashboard for monitoring usage, costs, quality | SHOULD |
| F-12 | Feedback mechanism (thumbs up/down + free text) on answers | MUST |

### 2.2 Functional requirements (v2+)

- F-20: Document upload + analysis (PDF/DOCX employment contracts, mises en demeure, etc.)
- F-21: Document generation (templates: resignation letter, demand letter, employee warning, etc.)
- F-22: Domain expansion (commercial, family/Moudawana, criminal, real estate, fiscal, administrative)
- F-23: Case strategy mode (user describes situation → AI proposes options + applicable articles)
- F-24: Darija support (input transliterated or voice → understand → answer in MSA Arabic or French)
- F-25: Voice messages support (Telegram + web)
- F-26: Subscription tiers + payment integration
- F-27: Lawyer-mode (verified legal pros get advanced features + disclaimers removed)

### 2.3 Non-functional requirements

| ID | Requirement | Target |
|----|-------------|--------|
| N-01 | Response latency (first token) | < 3s p95 |
| N-02 | Full answer generation | < 15s p95 |
| N-03 | Uptime | 99% (v1) / 99.5% (v2+) |
| N-04 | Citation accuracy (no hallucinated article numbers) | > 95% |
| N-05 | Answer factual accuracy (validated by sampling) | > 90% |
| N-06 | Data residency | EU or Morocco-region preferred for sensitive data |
| N-07 | Languages | French + Modern Standard Arabic at v1 |
| N-08 | Mobile-responsive web UI | MUST |
| N-09 | GDPR-style data handling (user can delete data) | MUST |

### 2.4 Legal & ethical constraints

- **Loi 28-08** restricts legal advice to registered lawyers in Morocco. The product must be positioned as **legal information**, not legal advice. Every answer carries a disclaimer.
- **No personal data of third parties** stored without user consent.
- **Audit trail** of every AI response (for liability + quality improvement).
- Future option: partnership with a registered avocat for a "verified advice" premium tier.

---

## 3. Technology Stack — Final Choices with Justifications

You have experience in React/Next.js, NestJS, Laravel, Python, MongoDB, PostgreSQL, vector DBs, Docker. The stack below picks the **best fit per layer** given your profile and the AI-heavy nature of the project.

### 3.1 Stack overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CHANNELS                                                         │
│  Next.js Web (chat UI)        │   Telegram Bot (Telegraf)         │
└──────────────────────────────────────────────────────────────────┘
                            │ HTTPS / WS
┌──────────────────────────────────────────────────────────────────┐
│  API GATEWAY  —  NestJS (TypeScript)                              │
│  Auth (JWT + OAuth) │ Rate limiting │ Conversation mgmt │ Billing │
└──────────────────────────────────────────────────────────────────┘
                            │ HTTP (internal)
┌──────────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION SERVICE  —  Python (FastAPI)                    │
│  LangGraph agents │ Router │ RAG │ LLM calls │ Guardrails         │
└──────────────────────────────────────────────────────────────────┘
        │                          │                       │
        ▼                          ▼                       ▼
┌──────────────┐         ┌──────────────────┐    ┌──────────────────┐
│ PostgreSQL   │         │ Qdrant (vectors) │    │ LLM APIs         │
│ users, chats │         │ Legal corpus     │    │ Claude / GPT     │
│ feedback     │         │ embeddings       │    │ Cohere embed     │
└──────────────┘         └──────────────────┘    └──────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  DATA INGESTION PIPELINE  —  Python (separate process / cron)     │
│  Scrapers → Cleaners → Chunkers → Embedders → Qdrant              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  INFRA: Docker Compose (dev) → Kubernetes or single VPS (prod)    │
│  Object storage (S3/MinIO) │ Redis (cache + queue) │ Logs/Metrics │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Layer-by-layer justification

**Frontend — Next.js 14+ (App Router) with React Server Components**
- You already know it.
- Excellent for chat UIs (streaming responses via Server-Sent Events / fetch streams).
- Built-in i18n routing for FR/AR (including RTL support for Arabic).
- Easy deployment to Vercel for v1, can be moved to self-hosted later.
- UI library: **shadcn/ui + Tailwind CSS** (clean, customizable, RTL-friendly).
- State management: **Zustand** (lightweight) or **TanStack Query** for server state.

**API Gateway — NestJS (TypeScript)**
- You know it. Strong opinionated structure suits a multi-channel project.
- Excellent for the "business logic" layer: auth, sessions, rate limiting, billing, webhooks.
- Handles Telegram webhook and web API uniformly.
- TypeScript end-to-end keeps the frontend/backend contract clean.

**AI Service — Python with FastAPI**
- **Non-negotiable for AI work**: Python has the dominant ecosystem (LangChain, LangGraph, LlamaIndex, sentence-transformers, transformers, unstructured, etc.). The JS versions exist but lag 6-12 months behind in features and stability.
- Separated into its own service so the AI layer can scale independently and be swapped/upgraded without touching the gateway.
- FastAPI is async, fast, with auto-generated OpenAPI docs. Pydantic for typed payloads.
- Communicates with NestJS over internal HTTP (or gRPC if you want, but HTTP is simpler).

**Why two backends (NestJS + Python)?** This is the most common pattern in production AI products. NestJS handles "boring but critical" web stuff. Python handles AI. You avoid forcing one language to be mediocre at both jobs. Communication is internal HTTP, low overhead.

**LLM provider — Claude API (Anthropic), primary; OpenAI GPT-4 as fallback**
- Claude (Sonnet 4.6 for cost-efficiency, Opus 4.7 for complex reasoning) handles French and Arabic legal reasoning very well, follows complex system prompts faithfully, and has strong refusal behavior (less hallucination on legal questions).
- Build an **LLM abstraction layer** so you can swap providers per request (cheap model for routing, expensive for final answers).
- Long-term: evaluate **fine-tuning a smaller open model** (e.g., Mistral, Qwen) on Moroccan legal data for cost reduction at scale — but only after you have traction and data.

**Embeddings — Cohere `embed-multilingual-v3.0`**
- The standard for multilingual (French + Arabic) embeddings.
- Alternative: OpenAI `text-embedding-3-large` (also multilingual, slightly less strong on Arabic).
- Pick one and stick with it — switching embeddings means re-embedding the entire corpus.

**Vector DB — Qdrant (self-hosted via Docker)**
- Open-source, very fast, supports filtered search (critical: filter by code/domain/article/language).
- Self-hosted = no per-query costs. Docker-friendly.
- Alternatives considered: Pinecone (managed, simpler, paid), Weaviate (more complex), pgvector (Postgres extension, fine for small scale but slower at scale).
- **Decision: Qdrant** because it scales from local Docker to clustered production with the same API.

**Relational DB — PostgreSQL 16**
- Stores: users, sessions, conversations, messages, feedback, billing, audit logs.
- You know it. JSON columns for flexible metadata.
- Use **Prisma** or **TypeORM** with NestJS (Prisma is more modern, better DX).

**Cache & Queue — Redis**
- Session cache, rate-limit counters.
- Queue for async jobs (re-embedding when new laws published, document analysis jobs).
- BullMQ on the NestJS side, Celery or arq on the Python side.

**Agent Framework — LangGraph (Python)**
- The successor to LangChain agents. Graph-based: explicit state machine for multi-step agent flows.
- Why not raw API calls? Because you'll soon need: tool use, multi-step reasoning, conditional branching, retry logic, checkpoints. Building this from scratch wastes months.
- Why not pure LangChain? LangChain's "agent" abstraction is leaky. LangGraph is cleaner and production-ready.
- Alternative: **CrewAI** if you want multi-agent collaboration patterns. Keep in mind for v3.

**Telegram — Telegraf (Node.js) inside the NestJS app**
- Industry standard, TypeScript-first, webhook + polling support.
- Lives in the NestJS gateway because it's a "channel," not AI logic.

**Document parsing — `unstructured` (Python) + `pypdf` + `python-docx`**
- For ingestion of legal PDFs and for v2 user-uploaded documents.
- `unstructured` handles messy PDFs with tables and layouts.

**Infra — Docker Compose locally → Hetzner / OVH / DigitalOcean VPS for prod**
- Hetzner is the best price/performance for AI workloads (Frankfurt or Finland datacenters, < 60ms to Morocco).
- One VPS with Docker Compose can host the entire stack at v1 (~ €20-40/month).
- Migrate to Kubernetes (k3s on a small cluster) only when load demands it. Don't over-engineer.

**CI/CD — GitHub Actions**
- Build Docker images on push, push to a private registry (GHCR), deploy via SSH or ArgoCD later.

**Observability — Sentry (errors) + Logfire or OpenTelemetry + Grafana (metrics, logs, traces)**
- LLM-specific: **LangSmith** (paid but worth it) or **Langfuse** (open-source) for tracing every LLM call, token usage, latency, quality.

### 3.3 What we deliberately AVOID

- **Pure JavaScript AI stack** (LangChain.js, etc.) — ecosystem too thin for what you need.
- **MongoDB as primary DB** — chats, users, billing are relational. Postgres wins.
- **Pinecone** — managed, but expensive once you hit any scale.
- **Building your own vector search** — solved problem, don't reinvent.
- **Fine-tuning at v1** — premature; RAG with a good corpus gets 90% of the value.
- **Microservices explosion** — two services (NestJS + Python AI) is enough. Don't split further until pain demands it.
- **A workflow visual editor** — you said you don't need it. Confirmed.

---

## 4. System Architecture (Detailed)

### 4.1 Request flow — web chat (v1)

```
User types question in French
    │
    ▼
Next.js chat UI → POST /api/chat (NestJS, JWT-authenticated, rate-limited)
    │
    ▼
NestJS:
  1. Validate user + rate limit (Redis)
  2. Load conversation history from Postgres
  3. Forward to AI service: POST http://ai:8000/ask
       { user_id, conversation_id, message, history, lang_hint }
    │
    ▼
Python AI service (FastAPI + LangGraph state machine):
  1. DETECT language (fasttext lang-id or simple heuristic)
  2. CLASSIFY domain — at v1, hardcoded "labor_law"; v2+, classifier agent
  3. RETRIEVE — embed query → search Qdrant filtered by domain=labor_law,
     lang in {fr, ar} → top-k chunks with metadata
  4. RERANK (optional) — cross-encoder rerank top 20 → top 5
  5. SYNTHESIZE — build prompt with system instructions + retrieved chunks
     + conversation history → call Claude API (streaming)
  6. GUARDRAIL — post-check: does answer cite at least one article?
     If not, fallback to "I don't know" response.
  7. STREAM response back token-by-token (SSE) up through NestJS to UI
  8. LOG full trace to Langfuse + Postgres audit table
    │
    ▼
UI displays streamed answer with inline citations (clickable → modal showing
the exact article text from the corpus)
    │
    ▼
User clicks 👍 / 👎 → feedback POST → Postgres
```

### 4.2 Request flow — Telegram

Identical to above, except the entry point is a Telegraf handler in NestJS that
receives webhook updates from Telegram. It translates incoming messages to the
same internal format, then sends the streamed answer back as edited messages
(Telegram trick: send placeholder, edit it as tokens arrive, throttled to
1 edit/sec to respect API limits).

### 4.3 Data ingestion pipeline (the "knowledge base")

This is **the most important and underestimated part of the project**. Plan for ~30-40% of total dev time here.

```
SOURCES
  ├── adala.justice.gov.ma  (Bulletin Officiel, jurisprudence)
  ├── sgg.gov.ma            (consolidated codes, PDF + HTML)
  ├── mtip.gov.ma           (Ministère du Travail — circulars, decrees)
  ├── Manual PDF uploads    (codes annotés, doctrine, when available)
  └── Future: paid sources  (Artémis, Lexis Maroc, if budget allows)
       │
       ▼
SCRAPERS (Python, per-source modules)
  - scrapy or playwright depending on whether site is static or JS-heavy
  - Respect robots.txt, rate-limit, store raw HTML/PDF in S3/MinIO
  - Track source URL + scraped date + checksum for diffing
       │
       ▼
PARSERS (per-source)
  - Extract structured text: code name, book, title, chapter, section, article number, article body
  - HTML → BeautifulSoup; PDF → unstructured.io + manual rules for tricky layouts
  - Bilingual handling: many docs have FR and AR versions — link them by article number
       │
       ▼
NORMALIZER
  - Clean whitespace, fix encoding artifacts (common in Arabic PDFs)
  - Detect language per chunk (some docs mix FR and AR)
  - Assign canonical IDs: `code_travail.art.40.fr`, `code_travail.art.40.ar`
  - Store normalized text in Postgres table `legal_documents` for traceability
       │
       ▼
CHUNKER
  - Strategy: chunk by article (1 article = 1 base chunk)
  - For long articles: secondary split by paragraph, with article-level metadata kept
  - Each chunk carries: { code, book, article_number, language, version_date, source_url }
       │
       ▼
EMBEDDER
  - Cohere embed-multilingual-v3.0, batch API (100 chunks per call)
  - Store embedding + metadata in Qdrant collection `legal_corpus`
       │
       ▼
INDEXES
  - Qdrant indexed on { code, language, article_number, version_date }
  - Allows filtered search: "only Code du Travail, only FR, only current version"
```

**Rebuild policy:** when a law is amended, re-scrape, diff, re-embed only changed articles. Keep historical versions (legal questions sometimes need "what was the law on date X").

### 4.4 Database schema (PostgreSQL — initial)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  preferred_language TEXT DEFAULT 'fr',
  role TEXT DEFAULT 'user',  -- 'user' | 'admin' | 'lawyer'
  created_at TIMESTAMPTZ DEFAULT now(),
  telegram_user_id BIGINT UNIQUE  -- nullable, set on Telegram link
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,  -- 'web' | 'telegram'
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,  -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  language TEXT,
  metadata JSONB,  -- citations, retrieved chunks, model used, tokens
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT,  -- -1 | 0 | 1
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Legal documents (source of truth for the corpus — separate from vector index)
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,           -- 'code_travail', 'doc', 'code_commerce'...
  book TEXT,
  title_number TEXT,
  chapter TEXT,
  section TEXT,
  article_number TEXT NOT NULL,
  language TEXT NOT NULL,       -- 'fr' | 'ar'
  content TEXT NOT NULL,
  version_date DATE,
  source_url TEXT,
  checksum TEXT,
  is_current BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON legal_documents (code, article_number, language, is_current);

-- Usage tracking (for billing + analytics)
CREATE TABLE usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  conversation_id UUID,
  model TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  cost_usd NUMERIC(10, 6),
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.5 Project structure (monorepo recommended)

```
morolex/
├── apps/
│   ├── web/                  # Next.js frontend
│   ├── gateway/              # NestJS API + Telegram bot
│   └── ai-service/           # Python FastAPI + LangGraph
├── packages/
│   ├── shared-types/         # TypeScript types shared between web & gateway
│   └── prompts/              # Versioned prompt templates (yaml/json)
├── ingestion/
│   ├── scrapers/             # one module per source
│   ├── parsers/
│   ├── normalizer/
│   ├── embedder/
│   └── pipeline.py           # orchestrator
├── infra/
│   ├── docker-compose.yml    # dev environment
│   ├── docker-compose.prod.yml
│   └── nginx/                # reverse proxy config
├── docs/                     # internal docs, ADRs, runbooks
└── README.md
```

Use **pnpm workspaces** for the JS/TS side, **uv** or **poetry** for Python.

---

## 5. Key Engineering Decisions (ADRs in short form)

| # | Decision | Rationale |
|---|---|---|
| 1 | RAG over fine-tuning at v1 | Faster, cheaper, easier to update when laws change. Fine-tune later if economics demand. |
| 2 | Chunk by article, not by token count | Legal answers must cite articles; chunking by article keeps citations precise. |
| 3 | Cohere multilingual embeddings | Strong on Arabic, which OpenAI handles less well. |
| 4 | Two-backend (NestJS + Python) | Best tool per job; Python required for AI ecosystem. |
| 5 | Qdrant self-hosted | No per-query costs; portable; production-grade. |
| 6 | LangGraph for orchestration | Graph state machine fits the multi-step legal reasoning pattern. |
| 7 | Stream responses via SSE | Better UX (perceived latency); supported natively by Claude/OpenAI APIs. |
| 8 | Citations are mandatory, not optional | A legal AI without citations is useless and dangerous. |
| 9 | Versioned legal corpus | Laws change; answers must be reproducible for a given date. |
| 10 | Disclaimer on every answer | Legal protection + ethical responsibility. |

---

## 6. Roadmap — Phased Plan

The roadmap is built so **every phase ships a working product**. You can stop at any phase and still have something usable. No phase requires throwing away previous work.

### Phase 0 — Foundations (Weeks 1-2)
**Goal:** Understand the tools, set up the environment.

- [ ] Read: Anthropic API docs, LangGraph getting started, Qdrant tutorials
- [ ] Build a throwaway prototype: Python script that calls Claude API with a hardcoded "you are a Moroccan labor lawyer" prompt, asks 10 questions, observe hallucinations
- [ ] Set up monorepo skeleton (`apps/`, `packages/`, `ingestion/`)
- [ ] `docker-compose.yml` with Postgres, Redis, Qdrant running locally
- [ ] Create accounts: Anthropic, Cohere, Sentry, GitHub
- [ ] Sketch UI mockups for chat (paper or Figma)

**Deliverable:** local dev environment runs, you can `curl` Claude through a small Python script.

### Phase 1 — Knowledge base for Labor Law (Weeks 3-6)
**Goal:** A clean, searchable, embedded corpus of Code du Travail (FR + AR) + key labor decrees.

- [ ] Identify all primary sources for Moroccan labor law:
    - Loi n° 65-99 (Code du Travail) FR + AR
    - Décret d'application n° 2-04-426
    - Loi 19-12 (employees of households)
    - Major Cour de Cassation rulings (chambre sociale) — start with a curated 50
- [ ] Build scrapers (Python + Scrapy/Playwright) for SGG and adala.justice.gov.ma
- [ ] Parse PDFs of Code du Travail (manual quality check required — Arabic PDFs are tricky)
- [ ] Normalize → store in `legal_documents` table
- [ ] Chunk by article → embed with Cohere → load into Qdrant
- [ ] Build a CLI `search` tool to test retrieval quality: "search 'préavis de licenciement'" → top 5 articles
- [ ] Manual QA: 50 known labor questions → check retrieved chunks are correct

**Deliverable:** queryable knowledge base. You can ask "what is the notice period for dismissal?" and retrieve Article 43 of the Code du Travail, in both FR and AR.

**This phase is where the project succeeds or fails.** Do not rush it.

### Phase 2 — Minimal viable chatbot (Weeks 7-9)
**Goal:** End-to-end working chatbot, web only, single user (you), labor law only.

- [ ] FastAPI AI service with one endpoint `/ask`
- [ ] LangGraph flow: detect language → retrieve → synthesize → check citation → return
- [ ] System prompt engineering (in both FR and AR) — iterate ~20 times
- [ ] NestJS gateway: `/api/chat` endpoint, no auth yet, forwards to AI service
- [ ] Next.js chat UI: simple, streaming responses, citation rendering
- [ ] Manual eval: run 30 labor questions, score answers, fix prompts/retrieval
- [ ] Add Langfuse for tracing every call

**Deliverable:** demo-able chatbot. You can ask labor law questions in FR or AR via a web page and get cited answers.

### Phase 3 — Production-readiness (Weeks 10-13)
**Goal:** Ship to real users (closed beta).

- [ ] Auth: NestJS + Passport (email/password + Google OAuth)
- [ ] User management: signup, login, password reset
- [ ] Conversation persistence (Postgres)
- [ ] Rate limiting (Redis): e.g., 20 questions/day free, raise for testers
- [ ] Feedback UI (👍/👎 + comment) wired to Postgres
- [ ] Disclaimer banner + per-message disclaimer
- [ ] Deploy: VPS (Hetzner CX22, ~€5/mo for v1) running Docker Compose
- [ ] Domain + HTTPS (Caddy or Nginx + Let's Encrypt)
- [ ] Basic admin dashboard (Next.js page protected by role): usage, costs, recent feedback
- [ ] Onboard 5-10 beta users (friends, lawyer contacts if any)

**Deliverable:** publicly accessible app. Real users testing.

### Phase 4 — Telegram bot (Weeks 14-15)
**Goal:** Same product, reachable via Telegram.

- [ ] Register bot via BotFather, set webhook
- [ ] Telegraf integration in NestJS
- [ ] Account linking: `/start` with token → links Telegram ID to web user
- [ ] Stream responses via message editing (throttled)
- [ ] Handle voice messages: transcribe with Whisper → treat as text (optional, v4.1)

**Deliverable:** Telegram bot live, shares the same user data and knowledge base as web.

### Phase 5 — Quality, evals, and iteration (Weeks 16-18)
**Goal:** Move from "kinda works" to "trustworthy".

- [ ] Build an **eval suite**: 100-200 labor law Q&A pairs reviewed by you (and ideally a lawyer)
- [ ] Automate eval runs on every prompt or retrieval change
- [ ] Metrics: citation accuracy, factual accuracy, refusal rate on out-of-scope questions
- [ ] A/B test retrieval strategies (top-k values, reranking on/off, hybrid search BM25+vector)
- [ ] Add **hybrid retrieval** (BM25 + vector) — improves recall on legal terms with rare wording
- [ ] Add **reranker** (Cohere Rerank or local cross-encoder)

**Deliverable:** measured quality > 90% on the eval set. Confidence to expand to new domains.

### Phase 6 — Domain expansion (Months 5-9)
**Goal:** Become a generalist Moroccan legal assistant.

Add domains **one at a time**, each repeating the Phase 1 process (corpus → embed → eval):

1. **Commercial law** (Code de Commerce, Loi sur les sociétés)
2. **Family law / Moudawana** (high public demand, sensitive — handle with extra disclaimers)
3. **Real estate** (Code des droits réels, Loi 39-08)
4. **Criminal** (Code Pénal, Code de Procédure Pénale)
5. **Fiscal** (Code Général des Impôts)
6. **Administrative** (jurisprudence administrative)

Architectural changes needed:
- [ ] **Domain classifier agent**: first step of the LangGraph flow detects the domain
- [ ] **Per-domain specialist prompts**: each domain has its own system prompt nuances
- [ ] **Multi-domain queries**: questions that span domains (e.g., labor + fiscal) get parallel retrieval and merged context

**Deliverable:** the chatbot can handle questions across all major branches of Moroccan law.

### Phase 7 — Monetization (Months 7-10, can overlap with Phase 6)
**Goal:** Sustainable revenue.

- [ ] Pricing tiers (suggested starter):
    - Free: 5 questions/day, basic answers
    - Pro (29 MAD/mo): 100 questions/day, document analysis, history export
    - Lawyer (199 MAD/mo): unlimited, document generation, no public disclaimer banner
- [ ] Payment integration: **Stripe** if accepting international cards; **CMI** for Moroccan cards (more complex but local users prefer it)
- [ ] Subscription management UI
- [ ] Usage-based billing for heavy users (large doc analysis)

### Phase 8 — Advanced features (Month 10+)
**Goal:** Differentiation from any generic legal chatbot.

- [ ] **Document analysis**: upload contract → AI flags risky clauses with article references
- [ ] **Document generation**: parametric templates for common acts
- [ ] **Case strategy mode**: structured intake → multi-step reasoning → recommended actions
- [ ] **Darija support**: input transliteration + LLM darija→MSA pre-step
- [ ] **Voice**: Whisper for input, ElevenLabs or Azure TTS for output
- [ ] **Lawyer marketplace**: refer complex cases to verified lawyers (revenue share)

### Phase 9 — Scale (when load demands it)
- [ ] Migrate from single VPS to k3s cluster or managed Kubernetes
- [ ] Separate read replicas for Postgres
- [ ] Qdrant clustering
- [ ] Consider self-hosting an LLM (Mistral, Qwen) fine-tuned on your traffic for cost reduction

---

## 7. Cost Estimates (Monthly, Rough)

### Phase 2-3 (closed beta, ~10 users)
| Item | Cost |
|------|------|
| Hetzner VPS CX22 | €5 |
| Domain + email | €2 |
| Claude API (low usage) | $10-30 |
| Cohere embeddings (one-time bulk + small ongoing) | $5 |
| Sentry free tier | $0 |
| Langfuse self-hosted | $0 |
| **Total** | **~$25-50/mo** |

### Phase 5-6 (public, ~500 active users)
| Item | Cost |
|------|------|
| Hetzner CX42 (bigger VPS) | €20 |
| Claude API (mix of Haiku for routing + Sonnet for answers) | $300-800 |
| Cohere embeddings + rerank | $30 |
| Postgres backups (object storage) | $5 |
| Sentry paid | $26 |
| **Total** | **~$400-900/mo** |

Pricing must be set so a paying user covers ~10x their API cost. Most legal questions cost $0.01-0.05 in API to answer.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|---|---|---|
| Hallucinated article numbers | High | High | Mandatory citation guardrail; verify article exists in corpus before returning answer |
| Outdated legal info (laws change) | Medium | High | Version-dated corpus + scheduled re-ingestion; show source date in citations |
| Loi 28-08 legal challenge (unauthorized legal practice) | Medium | High | Position as "information" not "advice"; disclaimers; explore lawyer partnership |
| Arabic PDF parsing produces garbage | High | Medium | Manual QA pass; fallback to OCR (Tesseract Arabic) for problematic docs |
| API costs explode with usage | Medium | High | Tiered rate limits; cheaper model for routing; cache common questions |
| Single-developer bus factor | High | Critical | Heavy documentation; clean architecture so a future collaborator can ramp up |
| Competitor (Western legal AI extending to Morocco) | Low-Medium | Medium | Speed + local depth (Darija, Moudawana, local jurisprudence) as moat |
| Telegram blocks the bot | Low | Low | Web is primary channel; Telegram is bonus |

---

## 9. Definition of Done — v1 (Labor Law MVP)

v1 is **shippable** when all of the following are true:

- [ ] Corpus of Code du Travail + key decrees ingested in FR and AR
- [ ] User can sign up, log in (web)
- [ ] User can ask labor law questions in FR or AR via web chat
- [ ] User can ask labor law questions via Telegram
- [ ] Every answer cites at least one article with link to source text
- [ ] Eval suite of 100+ questions runs and 90%+ pass
- [ ] Rate limiting active
- [ ] Feedback collection wired
- [ ] Disclaimer on every answer
- [ ] Deployed publicly with HTTPS
- [ ] At least 5 real beta users have tested for 1+ week
- [ ] Basic admin dashboard shows usage and feedback

---

## 10. What You Need to Decide Soon (Open Questions)

1. **Product name + domain**: secure a `.ma` domain early.
2. **Privacy policy & ToS**: required before public launch. Template + lawyer review.
3. **Lawyer advisor**: find ONE Moroccan lawyer willing to consult occasionally (paid or partnership) — invaluable for eval and credibility.
4. **Hosting region**: Hetzner Finland (low latency, low cost) vs. a Moroccan provider (data locality but more expensive). Recommended: Hetzner for v1, revisit at scale.
5. **Brand positioning**: "for everyone" vs "for lawyers" — affects UX, tone, marketing. Recommendation: start "for everyone" with a clear roadmap toward lawyer-tier features.

---

## 11. Learning Path (Side-by-Side with Building)

Since one of your goals is learning AI engineering, pair each phase with focused study:

- **Phase 0-1**: Anthropic prompt engineering guide, "RAG from scratch" tutorial series, LangGraph quickstart
- **Phase 2-3**: Streaming patterns, observability for LLMs (Langfuse docs), prompt versioning
- **Phase 5**: LLM evaluation methodologies (Anthropic's eval guide, OpenAI evals framework, ragas library)
- **Phase 6**: Multi-agent patterns, advanced retrieval (HyDE, ColBERT, hybrid search)
- **Phase 8+**: Fine-tuning workflow, model distillation, self-hosted inference (vLLM, TGI)

---

## 12. Appendix — Repository Setup Commands (when ready)

```bash
# Create monorepo
mkdir morolex && cd morolex
pnpm init
pnpm add -Dw turbo prettier

# Frontend
pnpm create next-app apps/web --typescript --tailwind --app

# Gateway
pnpm dlx @nestjs/cli new apps/gateway --package-manager pnpm

# AI service
mkdir -p apps/ai-service && cd apps/ai-service
uv init
uv add fastapi uvicorn langgraph langchain-anthropic cohere qdrant-client \
       python-dotenv pydantic-settings

# Infra
mkdir infra && touch infra/docker-compose.yml
```

---

**End of specifications.**

Maintain this document alongside the code. Bump the version each time architecture changes meaningfully.