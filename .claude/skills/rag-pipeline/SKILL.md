---
name: rag-pipeline
description: "Use this skill for ANY work involving Retrieval-Augmented Generation: chunking strategies, embeddings (Cohere multilingual), Qdrant collections and filters, hybrid search (BM25 + vector), reranking, retrieval evaluation, recall/precision tuning, prompt assembly with retrieved context, citation extraction. Triggers: 'RAG', 'retrieval', 'embed', 'chunk', 'Qdrant', 'rerank', 'hybrid search', 'recall', 'citations'."
---

# RAG pipeline — how MoroLex does retrieval

## Non-negotiables

1. **Chunk by article.** Each chunk = one Moroccan legal article (or a sub-paragraph if the article is huge).
2. **Metadata-first retrieval.** Every chunk has: `{code, book, title_number, chapter, article_number, language, version_date, source_url, is_current}`. Filter aggressively.
3. **Both languages, indexed separately, retrieved together.** A French question may benefit from the Arabic version's wording, and vice versa.
4. **Citations are extractable.** Every retrieved chunk carries a stable `chunk_id` that maps back to `legal_documents.id` in Postgres. The answer step injects citations as `[Art. 43 CT]` markers tied to those IDs.

## Embeddings

- Model: `cohere embed-multilingual-v3.0`. Dimensions: 1024.
- Input type matters: `search_document` for corpus, `search_query` for user questions.
- Batch up to 96 chunks per API call.
- Cache embeddings keyed by `(content_hash, model_name)` in Postgres to avoid re-embedding identical text.

## Qdrant collection schema

```python
COLLECTION_NAME = "legal_corpus"

CONFIG = {
    "vectors": {
        "size": 1024,
        "distance": "Cosine",
    },
    "optimizers_config": {"default_segment_number": 2},
    "hnsw_config": {"m": 16, "ef_construct": 200},
}

# Payload (indexed fields for filtering):
# - code: keyword (e.g. "code_travail")
# - language: keyword ("fr" | "ar")
# - article_number: keyword
# - is_current: bool
# - version_date: datetime
# - source_url: keyword (not indexed)
# - content: text (not indexed for vector — only stored)
```

Create payload indexes on `code`, `language`, `article_number`, `is_current` for fast filtered search.

## Retrieval flow

```python
async def retrieve(query: str, lang: str, domain: str, k: int = 10) -> list[Chunk]:
    # 1. Embed the query
    q_vec = await cohere.embed(query, input_type="search_query")

    # 2. Build filter
    filter_ = qdrant.Filter(
        must=[
            qdrant.FieldCondition(key="code", match=qdrant.MatchAny(any=DOMAIN_TO_CODES[domain])),
            qdrant.FieldCondition(key="is_current", match=qdrant.MatchValue(value=True)),
        ],
        should=[  # prefer same language, allow other
            qdrant.FieldCondition(key="language", match=qdrant.MatchValue(value=lang)),
        ],
    )

    # 3. Search
    results = await qdrant.search(
        collection_name="legal_corpus",
        query_vector=q_vec,
        query_filter=filter_,
        limit=k,
        with_payload=True,
    )
    return [chunk_from_point(p) for p in results]
```

## Reranking (Phase 5+)

Retrieve top 20 with vector, rerank to top 5 with `cohere rerank-multilingual-v3.0`. Big quality jump for the cost.

## Hybrid search (Phase 5+)

Add BM25 sparse vectors alongside dense. Qdrant supports this natively via named vectors. Critical for legal queries where rare terms (`mise en demeure`, `solde de tout compte`) need exact-match weight.

## Prompt assembly

```python
def build_prompt(question: str, chunks: list[Chunk], lang: str) -> str:
    context_block = "\n\n".join(
        f"[CHUNK {i}] Art. {c.article_number} — {c.code} ({c.language})\n{c.content}"
        for i, c in enumerate(chunks)
    )
    return prompts.render(
        "answer_with_citations",
        lang=lang,
        question=question,
        context=context_block,
    )
```

The system prompt instructs the model to cite using `[CHUNK N]` markers. A post-processor maps those back to `legal_documents.id` for the API response.

## Evaluation

`evals/labor_law.jsonl` format:

```json
{"id": "lab-001", "question": "Quelle est la durée du préavis pour un cadre ayant 5 ans d'ancienneté?", "expected_articles": ["43", "44"], "expected_concepts": ["préavis", "cadre", "ancienneté"], "language": "fr"}
```

Metrics:
- **Retrieval recall@k**: was the expected article in the retrieved set?
- **Citation precision**: did the answer cite real articles only?
- **Concept coverage**: did the answer mention the expected concepts?

Run on every retrieval or prompt change.

## Anti-patterns (forbidden)

- Chunking by fixed token count.
- Storing prompts inside retrieval code.
- Vector search without a filter (returns noise).
- Single language at indexing time.
- Throwing away version history when laws update.
