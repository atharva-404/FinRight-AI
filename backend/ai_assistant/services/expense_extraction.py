# ai_assistant/services/expense_extraction.py

import io
import json
from datetime import datetime
import mimetypes
import os

from django.conf import settings

from pymongo import MongoClient
from openai import OpenAI
from bson import ObjectId

from PyPDF2 import PdfReader
from PIL import Image
import pytesseract


# ---------- OpenAI + Mongo clients ----------

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

mongo_client = MongoClient(settings.MONGODB_URI)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]
mongo_collection = mongo_db[settings.MONGODB_COLLECTION_NAME]



# ---------- File -> text extraction ----------

def _extract_text_from_pdf(django_file):
    django_file.seek(0)
    reader = PdfReader(django_file)
    text_parts = []
    for page in reader.pages:
        try:
            text_parts.append(page.extract_text() or "")
        except Exception:
            pass
    return "\n".join(text_parts)


def _extract_text_from_image(django_file):
    """
    Using Tesseract OCR. Requires Tesseract installed on the system.
    """
    django_file.seek(0)
    image = Image.open(django_file)
    text = pytesseract.image_to_string(image)
    return text


def _extract_text_from_text_like(django_file):
    django_file.seek(0)
    raw = django_file.read()
    if isinstance(raw, bytes):
        return raw.decode("utf-8", errors="ignore")
    return str(raw)


def extract_text_from_uploaded_file(uploaded_file):
    """
    Support: csv, pdf, images (jpg, png, etc.), txt-like.
    Bank statements are usually one of these formats.
    """
    name = uploaded_file.name.lower()
    content_type = getattr(uploaded_file, "content_type", None) or mimetypes.guess_type(name)[0]

    if name.endswith(".pdf") or (content_type and "pdf" in content_type):
        return _extract_text_from_pdf(uploaded_file)

    if content_type and content_type.startswith("image/"):
        return _extract_text_from_image(uploaded_file)

    # csv, txt, etc.: just treat as text (LLM can parse csv directly)
    return _extract_text_from_text_like(uploaded_file)


# ---------- LLM call: text -> structured expense JSON ----------

def call_llm_for_expense_extraction(text: str) -> dict:
    """
    Send raw statement text to OpenAI and get back structured JSON.
    Adjust schema as you like.
    """

    system_instruction = """
You are an AI that extracts expense information from financial documents,
bank statements, invoices, and receipts.

Return ONLY valid JSON, no extra text.
Schema:
{
  "expenses": [
    {
      "date": "YYYY-MM-DD or original format",
      "amount": number,
      "currency": "INR or other",
      "category": "string",
      "merchant": "string or null",
      "description": "string or null",
      "account": "string or null",
      "reference": "string or null"
    }
  ],
  "summary": {
    "total_amount": number,
    "currency": "INR or other",
    "record_count": integer,
    "statement_period": "string or null"
  }
}
    """.strip()

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_instruction},
            {
                "role": "user",
                "content": "Extract expense data from the following document:\n\n" + text,
            },
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    print("LLM raw response:", response)    
    # Extract the message content from the response
    json_str = response.choices[0].message.content
    print("LLM output:", json_str)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        data = {"raw": json_str}

    return data


# ---------- Save document in MongoDB ----------

def save_expense_document_to_mongo(user_id, uploaded_file, raw_text, structured_data):
    document = {
        "user_id": user_id,
        "file_name": uploaded_file.name,
        "content_type": getattr(uploaded_file, "content_type", None),
        "size": uploaded_file.size,
        "raw_text": raw_text,
        "extracted_data": structured_data,  # key-value document
        "created_at": datetime.utcnow(),
    }
    result = mongo_collection.insert_one(document)
    return str(result.inserted_id)


def get_expense_document_by_id(doc_id: str):
    """Retrieve a stored expense document from MongoDB by its ObjectId string.

    Returns the document dict or None if not found / invalid id.
    """
    if not doc_id:
        return None
    try:
        oid = ObjectId(doc_id)
    except Exception:
        # if it's not a valid ObjectId, try to find by string _id
        try:
            return mongo_collection.find_one({"_id": doc_id})
        except Exception:
            return None

    return mongo_collection.find_one({"_id": oid})


def extracted_data_to_csv_bytes(extracted_data: dict) -> bytes:
    """Convert extracted_data (dict) to CSV bytes.

    The CSV will contain one row per expense with columns:
    date, amount, currency, category, merchant, description, account, reference
    """
    import csv

    expenses = []
    if not extracted_data:
        expenses = []
    else:
        expenses = extracted_data.get("expenses") or []

    headers = [
        "date",
        "amount",
        "currency",
        "category",
        "merchant",
        "description",
        "account",
        "reference",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()

    for e in expenses:
        row = {k: e.get(k) if isinstance(e, dict) else None for k in headers}
        writer.writerow(row)

    # Optionally append summary as commented lines
    summary = extracted_data.get("summary") if isinstance(extracted_data, dict) else None
    if summary:
        output.write("\n# Summary\n")
        for k, v in summary.items():
            output.write(f"# {k}: {v}\n")

    return output.getvalue().encode("utf-8")
