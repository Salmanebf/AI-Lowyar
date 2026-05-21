---
description: "Add or extend an eval suite with new test cases. Usage: /eval-suite <suite_name> <how-many-cases>"
---

You are adding eval cases to suite: $ARGUMENTS

1. Read `evals/<suite_name>.jsonl` if it exists; understand the existing schema.
2. Standard schema for legal Q&A evals:
   ```json
   {
     "id": "<suite-prefix>-<num>",
     "question": "<realistic Moroccan French or Arabic legal question>",
     "language": "fr" | "ar",
     "expected_articles": ["43", "44"],
     "expected_codes": ["code_travail"],
     "expected_concepts": ["préavis", "cadre"],
     "out_of_scope": false,
     "notes": "<source if drawn from a real case or doctrine>"
   }
   ```
3. Generate cases that:
   - Are linguistically natural (a real Moroccan user would type them)
   - Span easy / medium / hard difficulty
   - Include 10% out-of-scope cases (`out_of_scope: true`, no expected_articles) to test refusal
   - Are evenly split FR/AR unless told otherwise
4. Use the `moroccan-legal-domain` skill for realistic terminology.
5. Append to JSONL (one object per line, no trailing comma).
6. Do NOT invent article numbers. If you're unsure an article exists, either verify against the corpus or mark `expected_articles` as `[]` and rely on `expected_concepts`.

Output a summary of added cases.
