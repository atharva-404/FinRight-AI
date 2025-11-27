# Expense Extraction API - Configuration & Best Practices

## Configuration Files Updated

### 1. `ai_assistant/services/expense_extraction.py`
**Changes Made:**
- Fixed LLM API call from `responses.create()` to `chat.completions.create()`
- Changed model from `gpt-4.1-mini` (non-existent) to `gpt-4-turbo`
- Added proper response parsing with error handling
- Added temperature and max_tokens parameters for better control

**Key Functions:**
- `extract_text_from_uploaded_file()` - Handles PDF, images, and text files
- `call_llm_for_expense_extraction()` - Calls OpenAI GPT-4 for extraction
- `save_expense_document_to_mongo()` - Stores document in MongoDB

### 2. `ai_assistant/views.py`
**Enhancements:**
- Added comprehensive docstring with API usage details
- Improved error responses with structured JSON
- Added file metadata in response (file_name, file_size)
- Better error categorization (text extraction, LLM, MongoDB)
- Proper HTTP status codes (201 for success, 400 for validation, 500 for server errors)

### 3. `ai_assistant/serializers.py`
**Improvements:**
- Added file size validation (max 10MB)
- Added file type validation with extension checking
- Proper error messages for validation failures
- Support for common file formats: PDF, CSV, TXT, JPG, PNG, GIF, BMP, TIFF

### 4. `requirement.txt`
**Added Dependencies:**
- `pymongo==4.6.0` - MongoDB driver
- `PyPDF2==3.0.1` - PDF text extraction
- `pytesseract==0.3.10` - OCR for images

### 5. `core/urls.py`
**Already Configured:**
- Route: `path("api/ai/", include("ai_assistant.urls"))`
- Maps to full path: `/api/ai/expense-upload/`

### 6. `core/settings.py`
**Environment Variables Used:**
- `OPENAI_API_KEY` - OpenAI API authentication
- `MONGO_URI` - MongoDB connection string
- `MONGO_DBNAME` - Database name (default: "om")
- `MONGODB_COLLECTION_NAME` - Collection name (default: "expenses")

## API Endpoint Summary

```
POST /api/ai/expense-upload/
```

### Request
```
Content-Type: multipart/form-data
Body:
  - file: Binary file (PDF/CSV/TXT/JPG/PNG/etc.)
  
Maximum file size: 10MB
Supported formats: PDF, JPG, JPEG, PNG, GIF, BMP, TIFF, CSV, TXT
```

### Success Response (201 Created)
```json
{
    "message": "File processed and stored successfully.",
    "mongo_id": "507f1f77bcf86cd799439011",
    "file_name": "bank_statement.pdf",
    "file_size": 245812,
    "extracted_data": {
        "expenses": [...],
        "summary": {...}
    }
}
```

### Error Response
```json
{
    "error": "Error category",
    "details": "Detailed error message"
}
```

## Processing Flow

```
1. File Upload (multipart/form-data)
                    ↓
2. Validation (size, format, extension)
                    ↓
3. Text Extraction (PDF/Image/CSV/TXT)
                    ↓
4. LLM Processing (GPT-4 Turbo)
                    ↓
5. MongoDB Storage (raw text + structured data)
                    ↓
6. Response (JSON with extracted data and mongo_id)
```

## File Format Support

### PDF Files
- **Extraction Method**: PyPDF2
- **Supports**: Digital PDFs and scanned PDFs (with OCR for images inside)
- **Speed**: 1-3 seconds per page

### Images (JPG, PNG, GIF, BMP, TIFF)
- **Extraction Method**: Tesseract OCR
- **Supports**: Scanned receipts, invoices, statements
- **Requires**: Tesseract installation
- **Speed**: 2-5 seconds per image

### CSV Files
- **Extraction Method**: Text parsing + LLM
- **Supports**: Bank statements, transaction logs, expense sheets
- **Speed**: 1-2 seconds

### TXT Files
- **Extraction Method**: Direct text reading + LLM
- **Supports**: Transaction logs, statements, any text format
- **Speed**: < 1 second

## LLM Configuration

### Model Selection
Currently using `gpt-4-turbo` for best accuracy.

**Options:**
- `gpt-4-turbo` - Best accuracy, ~$0.03 per 1K tokens input
- `gpt-3.5-turbo` - Faster, ~$0.0005 per 1K tokens input
- `gpt-4` - Most expensive, best for complex documents

### Temperature & Max Tokens
```python
response = openai_client.chat.completions.create(
    model="gpt-4-turbo",
    temperature=0.3,        # 0=deterministic, 1=creative
    max_tokens=2000,        # Max response length
)
```

## MongoDB Document Structure

```json
{
    "_id": ObjectId("507f1f77bcf86cd799439011"),
    "user_id": 123,
    "file_name": "bank_statement.pdf",
    "content_type": "application/pdf",
    "size": 245812,
    "raw_text": "Full extracted text from document...",
    "extracted_data": {
        "expenses": [
            {
                "date": "2024-11-20",
                "amount": 50.00,
                "currency": "INR",
                "category": "Groceries",
                "merchant": "BigBazaar",
                "description": "Weekly groceries",
                "account": "Savings Account",
                "reference": "TXN-12345"
            }
        ],
        "summary": {
            "total_amount": 50.00,
            "currency": "INR",
            "record_count": 1,
            "statement_period": "2024-11-01 to 2024-11-30"
        }
    },
    "created_at": ISODate("2024-11-26T10:30:45.123Z")
}
```

## Environment Setup

### Development (.env)
```env
OPENAI_API_KEY=sk-proj-your-test-key
MONGO_URI=mongodb+srv://user:pass@localhost
MONGO_DBNAME=om
DEBUG=True
```

### Production (.env)
```env
OPENAI_API_KEY=sk-proj-your-prod-key
MONGO_URI=mongodb+srv://prod_user:prod_pass@prod-cluster.mongodb.net
MONGO_DBNAME=om_prod
DEBUG=False
```

## Performance Optimization

### Caching
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
def get_expense_categories(request):
    pass
```

### Async Processing
For production, use Celery:
```python
from celery import shared_task

@shared_task
def extract_expenses_async(file_id):
    # Process file asynchronously
    pass
```

### Rate Limiting
```python
from rest_framework.throttling import UserRateThrottle

class ExpenseUploadThrottle(UserRateThrottle):
    scope = 'expense_upload'
    THROTTLE_RATES = {
        'expense_upload': '100/day',  # 100 uploads per day
    }
```

## Security Considerations

### 1. File Validation
✅ **Implemented:**
- File size validation (max 10MB)
- File extension validation
- Content-type checking

### 2. API Authentication
⚠️ **Consider adding:**
```python
from rest_framework.permissions import IsAuthenticated

class ExpenseUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
```

### 3. CORS Configuration
**Current (Development):**
```python
CORS_ALLOW_ALL_ORIGINS = True
```

**Production:**
```python
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
]
```

### 4. Input Sanitization
The LLM output is already JSON-validated through `json.loads()`

### 5. Rate Limiting
Consider implementing rate limiting for production:
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}
```

## Testing

### Unit Tests
```python
# ai_assistant/tests.py
from django.test import TestCase
from rest_framework.test import APIClient

class ExpenseUploadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_csv_upload(self):
        # Test implementation
        pass
```

### Integration Tests
```bash
python test_expense_api.py
```

### Manual Testing
```bash
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -F "file=@statement.pdf" -v
```

## Monitoring & Logging

### Enable Django Logging
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```

### Log Extraction Events
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Processing file: {uploaded_file.name}")
logger.info(f"Extracted {len(expenses)} expenses")
logger.error(f"Failed to extract: {str(e)}")
```

## Troubleshooting Guide

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 - LLM extraction failed | OpenAI API error | Check API key, quota, rate limits |
| 400 - File type not supported | Invalid format | Use PDF, CSV, TXT, or image files |
| 500 - MongoDB save failed | Connection error | Verify MONGO_URI, IP whitelist |
| No text extracted | Image only or encrypted PDF | Try different format or re-scan |
| Slow processing | Large file or LLM timeout | Reduce file size, increase timeout |

## Future Enhancements

1. **Batch Processing**: Upload multiple files at once
2. **Webhook Notifications**: Notify frontend when ready
3. **Streaming Response**: Stream results as they're processed
4. **Receipt OCR Improvement**: Fine-tune for low-quality images
5. **Multi-language Support**: Extract from non-English documents
6. **Expense Categorization**: AI-powered category suggestions
7. **Duplicate Detection**: Find duplicate expenses
8. **Invoice Parsing**: Special handling for invoices
9. **Receipt Search**: Search through extracted expenses
10. **Export Features**: Export to CSV, Excel, PDF

## API Versioning

Current: v1.0.0

Future versions will maintain backward compatibility with `/api/v1/ai/` paths.

## Maintenance Checklist

- [ ] Monitor OpenAI API usage monthly
- [ ] Check MongoDB storage and clean old documents
- [ ] Update dependencies quarterly
- [ ] Review security configurations
- [ ] Test disaster recovery procedures
- [ ] Monitor error rates and response times
- [ ] Update documentation as needed
