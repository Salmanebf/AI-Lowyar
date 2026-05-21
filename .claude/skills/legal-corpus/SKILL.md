---
name: legal-corpus
description: "Use this skill when working on the legal data ingestion pipeline: scraping Moroccan legal sources (adala.justice.gov.ma, sgg.gov.ma, mtip.gov.ma, Bulletin Officiel), parsing PDFs of codes, normalizing legal text, handling bilingual FR/AR document pairs, versioning legal documents, populating the legal_documents Postgres table, or any work under ingestion/. Triggers: 'scrape', 'ingestion', 'BO', 'Bulletin Officiel', 'corpus', 'parse PDF', 'normalize legal text', 'Article 43', 'Code du Travail'."
---

# Legal corpus ingestion

## Sources (in priority order for Labor Law v1)

| Source | Type | Notes |
|---|---|---|
| `sgg.gov.ma` | HTML + PDF | Consolidated codes; bilingual; cleanest source |
| `adala.justice.gov.ma` | HTML | Bulletin Officiel; legislative history |
| `mtip.gov.ma` | PDF | Labor ministry circulars and implementing decrees |
| Direct PDFs (annotated codes) | PDF | Highest signal; harder to parse |

## Pipeline stages

```
ingestion/
├── scrapers/
│   ├── base.py              # Scraper protocol
│   ├── sgg.py
│   ├── adala.py
│   └── mtip.py
├── parsers/
│   ├── pdf_text.py          # text-based PDFs
│   ├── pdf_ocr.py           # scanned PDFs (Tesseract Arabic + French)
│   └── html.py
├── normalizer/
│   ├── clean.py             # whitespace, encoding, ligatures
│   ├── language.py          # FastText language detection per paragraph
│   └── pairing.py           # link FR ↔ AR versions by article number
├── chunker/
│   └── by_article.py
├── embedder/
│   ├── cohere_embedder.py
│   └── cache.py
├── pipeline.py              # orchestrates all stages
├── models.py                # Pydantic models for each stage's output
└── raw/                     # raw HTML/PDF cache (gitignored)
```

## Scraper protocol

```python
from typing import Protocol, AsyncIterator
from .models import RawDocument

class Scraper(Protocol):
    name: str

    async def discover(self) -> AsyncIterator[str]:
        """Yield URLs/identifiers of documents to fetch."""
        ...

    async def fetch(self, identifier: str) -> RawDocument:
        """Fetch one document. Idempotent. Stores raw bytes in raw/."""
        ...
```

Always:
- Respect robots.txt and rate-limit (1 req/sec default).
- Set a descriptive User-Agent: `MoroLexBot/1.0 (research; contact: ...)`.
- Store raw bytes with checksum. Diff on re-scrape.
- Log every fetch with source, URL, status, checksum.

## Article extraction regex (FR)

```python
# Common patterns. Add more as you encounter them.
ARTICLE_PATTERNS_FR = [
    r"^Article\s+(\d+(?:\s*[-‑]\s*\d+)?)\s*[.:\-—]?\s*$",
    r"^Art\.\s+(\d+)\s*[.:\-—]",
]
```

## Article extraction regex (AR)

```python
ARTICLE_PATTERNS_AR = [
    r"^المادة\s+(\d+)",
    r"^الفصل\s+(\d+)",       # used in some older texts
]
```

Note: Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) appear in some sources. Normalize to ASCII digits before matching.

## Bilingual pairing

Most official sources publish FR and AR side-by-side or as parallel documents. Link them by `(code, article_number, version_date)`. Store as two rows in `legal_documents` with the same `article_number` but different `language`.

## Normalization checklist

- Strip page headers/footers (often "Bulletin Officiel n° XXXX — date")
- Collapse multi-line article bodies into single text (preserve `\n` for sub-paragraphs)
- Convert Arabic-Indic digits → Latin digits in article numbers (keep originals in content)
- Fix common OCR errors in Arabic (alef variants, hamza placement) using a curated lookup
- Detect and split mixed-language paragraphs

## Versioning

When re-ingesting a code that has been amended:
1. Diff new content against `legal_documents.content` keyed by `(code, article_number, language)`.
2. If changed: set old row `is_current=false`, insert new row with new `version_date` and `is_current=true`.
3. Re-embed only changed articles; mark old vector points for deletion in Qdrant after the new ones are confirmed.

## Manual QA gate

Before any new corpus reaches production:
1. `uv run python ingestion/qa/sample_check.py --code code_travail --n 30` — prints 30 random articles for manual review.
2. Run retrieval eval against `evals/labor_law.jsonl`.
3. Only `is_current=true` if both pass.

## Common commands

```bash
# Full pipeline for one code
uv run python -m ingestion.pipeline --code code_travail --lang fr,ar

# Just re-embed (no re-scrape)
uv run python -m ingestion.pipeline --code code_travail --skip-scrape --skip-parse

# Dry run (no DB writes, no Qdrant upserts)
uv run python -m ingestion.pipeline --code code_travail --dry-run
```
