# ai_assistant/services/expense_suggestions.py

from openai import OpenAI
import json

client = OpenAI()

def generate_saving_suggestions(expense_data: dict) -> dict:
    """
    Generate saving insights based on structured expense JSON.
    """
    system_prompt = """
    You are a financial planning assistant.
    Based on the user's expense history, provide smart and practical suggestions
    to help reduce expenses and increase savings.

    Return ONLY JSON with the schema:
    {
      "suggestions": [
        "string",
        "string",
        "string"
      ]
    }

    Suggestions should be:
    - Personalized to spending categories and merchants
    - Actionable and measurable
    - Not generic like 'save money', but specific
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(expense_data)},
        ],
        temperature=0.4,
        max_tokens=500
    )

    raw_output = response.choices[0].message.content
    try:
        return json.loads(raw_output)
    except Exception:
        return {"suggestions": [], "raw_output": raw_output}
