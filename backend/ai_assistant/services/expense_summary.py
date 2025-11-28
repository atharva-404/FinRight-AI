# ai_assistant/services/expense_summary.py

from openai import OpenAI
import json

client = OpenAI()

def summarize_expenses_from_data(data: dict) -> dict:
    """
    Given structured expense JSON from Mongo,
    generate a financial summary via LLM call.
    """

    system_prompt = """
    You are an expert financial analysis model.

    Given the structured expenses and metadata JSON,
    produce insights in the following JSON format only:

    {
      "total_amount": number,
      "record_count": number,
      "biggest_category": "string",
      "top_merchants": ["string"],
      "suggestions": ["string"]
    }
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(data)},
        ],
        temperature=0.3,
        max_tokens=800,
    )

    raw = response.choices[0].message.content

    try:
        return json.loads(raw)
    except Exception:
        return {"error": "Invalid output from LLM", "raw_response": raw}
