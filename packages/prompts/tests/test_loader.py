from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from loader import load_prompt  # noqa: E402


class TestLoadPrompt:
    def test_loads_current_version_and_substitutes_variables(self) -> None:
        result = load_prompt(
            "answer",
            "fr",
            {
                "context": "Article 35 du Code du Travail...",
                "question": "Quelle est la durée du préavis ?",
            },
        )

        assert "Article 35 du Code du Travail..." in result
        assert "Quelle est la durée du préavis ?" in result
        assert "{{context}}" not in result
        assert "{{question}}" not in result

    def test_loads_specific_version(self) -> None:
        result = load_prompt(
            "answer",
            "ar",
            {"context": "سياق قانوني", "question": "ما هي مدة الإشعار؟"},
            version="v1",
        )

        assert "سياق قانوني" in result
        assert "ما هي مدة الإشعار؟" in result

    def test_throws_on_missing_variables(self) -> None:
        with pytest.raises(ValueError, match="Missing prompt variables: question"):
            load_prompt("answer", "fr", {"context": "some context"})

    def test_throws_on_nonexistent_prompt(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_prompt("nonexistent", "fr", {})
