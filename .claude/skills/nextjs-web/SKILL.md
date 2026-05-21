---
name: nextjs-web
description: "Use this skill when working in apps/web/ — Next.js App Router pages, React components, chat UI, streaming responses, Tailwind/shadcn styling, i18n FR/AR with RTL support, or any frontend code. Triggers: 'web app', 'chat UI', 'page', 'component', 'streaming', 'SSE consumer', 'RTL', 'shadcn', 'Tailwind', edits under apps/web/."
---

# Next.js Web App — patterns and conventions

## Layout

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   └── [conversationId]/page.tsx
│   │   └── settings/
│   ├── (marketing)/
│   │   └── page.tsx                  # landing
│   ├── api/                          # only proxies — no DB access
│   ├── layout.tsx                    # root, sets dir based on locale
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── message-list.tsx
│   │   ├── message-bubble.tsx
│   │   ├── citation-popover.tsx
│   │   ├── input-bar.tsx
│   │   └── streaming-text.tsx
│   ├── ui/                            # shadcn components
│   └── locale/
├── lib/
│   ├── api-client.ts                  # typed fetch to gateway
│   ├── auth.ts                        # NextAuth or custom
│   ├── sse.ts                         # SSE consumer helper
│   └── i18n/
│       ├── config.ts
│       └── dictionaries/
│           ├── fr.json
│           └── ar.json
├── stores/                            # Zustand
└── middleware.ts                      # locale + auth redirects
```

## RTL + i18n

```typescript
// app/layout.tsx
export default function RootLayout({ children, params }: Props) {
  const locale = params.locale ?? "fr";
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

Use **logical CSS properties** in Tailwind: `ps-4` (padding-inline-start) not `pl-4`, `me-2` not `mr-2`. This makes RTL automatic.

Fonts: load `Noto Sans Arabic` for Arabic, `Inter` for French. Subset via `next/font`.

## Streaming consumer

```typescript
// lib/sse.ts
export async function* consumeSSE(response: Response): AsyncIterable<AiEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        yield JSON.parse(line.slice(6));
      }
    }
  }
}
```

## Client vs Server components

- **Server Components by default.** Fetch data, render markup.
- Add `"use client"` only for: interactivity (handlers, state), browser APIs, third-party client-only libraries.
- Chat input bar = client component. Message list shell = server. Individual messages = server. Streaming text inside a message = client.

## Forms

- Use `react-hook-form` + Zod resolver. Share the Zod schema with the gateway (`packages/shared-types/`).
- shadcn `<Form>` components wrap react-hook-form.

## Common commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test           # Vitest
```
