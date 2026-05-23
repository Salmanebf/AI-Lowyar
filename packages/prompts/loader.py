from __future__ import annotations

import json
import re
from pathlib import Path

SRC_DIR = Path(__file__).parent / "src"


def load_prompt(
    name: str,
    lang: str,
    variables: dict[str, str],
    *,
    version: str | None = None,
) -> str:
    prompt_dir = SRC_DIR / name
    meta_path = prompt_dir / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))

    resolved_version = version or meta["current"]
    file_path = prompt_dir / f"{resolved_version}.{lang}.md"

    if not file_path.exists():
        msg = f"Prompt file not found: {file_path}"
        raise FileNotFoundError(msg)

    template = file_path.read_text(encoding="utf-8")

    missing: list[str] = []

    def _replace(match: re.Match[str]) -> str:
        key = match.group(1)
        if key in variables:
            return variables[key]
        missing.append(key)
        return match.group(0)

    result = re.sub(r"\{\{(\w+)\}\}", _replace, template)

    if missing:
        msg = f"Missing prompt variables: {', '.join(missing)}"
        raise ValueError(msg)

    return result
