# ai_assistant/services/expense_chat.py
import json
from typing import List, Dict

from openai import OpenAI

client = OpenAI()


def _build_rag_context(raw_text: str, question: str, max_chars: int = 4000) -> str:
    """
    Very simple RAG-style context builder:
    - split text into paragraphs
    - score by keyword overlap with question
    - pick top paragraphs up to `max_chars`
    """
    if not raw_text:
        return ""

    paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
    question_tokens = set(question.lower().split())

    def score(p: str) -> int:
        tokens = set(p.lower().split())
        return len(tokens & question_tokens)

    ranked = sorted(paragraphs, key=score, reverse=True)
    selected: List[str] = []
    total_len = 0

    for p in ranked:
        if total_len + len(p) > max_chars:
            break
        selected.append(p)
        total_len += len(p)

    return "\n\n".join(selected)


def chat_with_expense_data(question: str, expense_doc: dict) -> str:
    """
    Non-streaming LLM call using:
    - Mongo 'extracted_data' (expenses + summary)
    - Mongo 'raw_text' (for naive RAG context)
    """
    extracted = expense_doc.get("extracted_data") or {}
    if isinstance(extracted, str):
        try:
            extracted = json.loads(extracted)
        except json.JSONDecodeError:
            extracted = {}

    expenses: List[Dict] = (extracted.get("expenses") or [])[:80]
    summary: Dict = extracted.get("summary") or {}
    raw_text = expense_doc.get("raw_text") or ""

    rag_context = _build_rag_context(raw_text, question)

    context_json = {
        "summary": summary,
        "sample_expenses": expenses,
    }

    system_prompt = """
You are a personal finance assistant.

You will receive:
- A summary of the user's expenses
- A sample list of expense records (date, amount, category, merchant, etc.)
- Some relevant text snippets from the original statement

You MUST:
- Answer the user's question using this data
- Be specific with numbers and categories
- Answer in clear, concise language
- Answer should be Short and to the point
- Answer as a helpful financial assistant
- Propose saving strategies when relevant
- If User Asks that can he do something with money buy, invest,purchase anything so ans in Yes/No then Clarify it with single line
- If data is insufficient, clearly say what is missing
"""

    user_content = (
        f"User question:\n{question}\n\n"
        "Structured expense JSON:\n"
        f"{json.dumps(context_json, ensure_ascii=False)}\n\n"
        "Relevant text snippets from the document:\n"
        f"{rag_context}"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_content},
        ],
        temperature=0.4,
        max_tokens=900,
    )

    return response.choices[0].message.content
