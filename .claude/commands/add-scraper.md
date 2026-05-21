---
description: "Add a new legal-source scraper to ingestion/scrapers/ following the Scraper protocol. Usage: /add-scraper <source-name> <base-url>"
---

You are adding a new scraper for source: $ARGUMENTS

1. Read the `legal-corpus` skill for the Scraper protocol.
2. Create `ingestion/scrapers/<source>.py` implementing `discover()` and `fetch()`.
3. Use `httpx.AsyncClient` with a custom User-Agent and 1 req/sec rate limit (`asyncio.Semaphore` + `asyncio.sleep`).
4. Check `robots.txt` at startup; refuse to scrape disallowed paths.
5. Store raw fetched bytes to `raw/<source>/<safe_filename>` with sidecar `.meta.json` containing `{url, fetched_at, checksum, status}`.
6. Add unit tests in `ingestion/tests/scrapers/test_<source>.py` using `respx` to mock HTTP responses.
7. Register the scraper in `ingestion/pipeline.py`'s `SCRAPERS` dict.
8. Add one integration test that uses a saved HTML/PDF fixture in `ingestion/tests/fixtures/`.

Do NOT make real network requests during tests.

Return a summary of files created and any decisions you had to make.
