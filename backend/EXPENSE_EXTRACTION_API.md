# Expense Extraction API Documentation

## Overview
This API allows users to upload financial documents (bank statements, receipts, invoices) in various formats and automatically extracts expense information using OpenAI's GPT-4 model. The extracted data is then stored in MongoDB.

## Features
- **Multi-format Support**: PDF, Images (JPG, PNG, GIF, BMP, TIFF), CSV, TXT
- **Text Extraction**: Automatically extracts text from PDFs using PyPDF2 and from images using OCR (Tesseract)
- **LLM-Based Extraction**: Uses OpenAI GPT-4 to intelligently extract structured expense data
- **MongoDB Storage**: Saves raw text and extracted data for future reference
- **User Association**: Automatically links extracted expenses to authenticated users

## Prerequisites
- Python 3.8+
- OpenAI API Key (stored in `.env` as `OPENAI_API_KEY`)
- MongoDB URI (stored in `.env` as `MONGO_URI`)
- Tesseract OCR (optional, for image processing)

## Installation

### 1. Install Dependencies
```bash
pip install -r requirement.txt
```

### 2. Install Tesseract (Optional, for OCR)
**Windows**:
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Run the installer and note the installation path

**Linux**:
```bash
sudo apt-get install tesseract-ocr
```

**macOS**:
```bash
brew install tesseract
```

### 3. Configure Environment Variables
Create or update `.env` file with:
```env
OPENAI_API_KEY=sk-proj-your-key-here
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DBNAME=om
```

## API Endpoints

### POST /api/ai/expense-upload/

Upload a financial document and extract expense data.

#### Request
**Content-Type**: `multipart/form-data`

**Parameters**:
- `file` (required): The file to upload
  - Supported formats: PDF, JPG, JPEG, PNG, GIF, BMP, TIFF, CSV, TXT
  - Maximum size: 10MB

#### Example cURL
```bash
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -F "file=@bank_statement.pdf"
```

#### Example Python
```python
import requests

files = {'file': open('bank_statement.pdf', 'rb')}
response = requests.post(
    'http://localhost:8000/api/ai/expense-upload/',
    files=files
)
print(response.json())
```

#### Example JavaScript (Fetch)
```javascript
const formData = new FormData();
formData.append('file', document.getElementById('fileInput').files[0]);

fetch('http://localhost:8000/api/ai/expense-upload/', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Response (Success - 201 Created)
```json
{
    "message": "File processed and stored successfully.",
    "mongo_id": "507f1f77bcf86cd799439011",
    "file_name": "bank_statement.pdf",
    "file_size": 245812,
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
            },
            {
                "date": "2024-11-21",
                "amount": 1500.00,
                "currency": "INR",
                "category": "Utilities",
                "merchant": "Electricity Board",
                "description": "Monthly electricity bill",
                "account": null,
                "reference": null
            }
        ],
        "summary": {
            "total_amount": 1550.00,
            "currency": "INR",
            "record_count": 2,
            "statement_period": "2024-11-01 to 2024-11-30"
        }
    }
}
```

### Response (Bad Request - 400)
```json
{
    "error": "Invalid input",
    "details": {
        "file": ["File type not supported. Allowed: .pdf, .txt, .csv, .jpg, .jpeg, .png, .gif, .bmp, .tiff"]
    }
}
```

### Response (Server Error - 500)
```json
{
    "error": "LLM extraction failed",
    "details": "Error while calling OpenAI: Rate limit exceeded"
}
```

## Response Schema

### Success Response
```json
{
    "message": string,
    "mongo_id": string,
    "file_name": string,
    "file_size": integer,
    "extracted_data": {
        "expenses": [
            {
                "date": string,
                "amount": number,
                "currency": string,
                "category": string,
                "merchant": string | null,
                "description": string | null,
                "account": string | null,
                "reference": string | null
            }
        ],
        "summary": {
            "total_amount": number,
            "currency": string,
            "record_count": integer,
            "statement_period": string | null
        }
    }
}
```

### Error Response
```json
{
    "error": string,
    "details": string
}
```

## MongoDB Document Structure

Documents are stored in the `expenses` collection with the following structure:

```json
{
    "_id": ObjectId,
    "user_id": integer | null,
    "file_name": string,
    "content_type": string,
    "size": integer,
    "raw_text": string,
    "extracted_data": {
        "expenses": array,
        "summary": object
    },
    "created_at": Date
}
```

## Error Handling

### Common Errors

| Error | Status | Cause |
|-------|--------|-------|
| File type not supported | 400 | Unsupported file format |
| File size must not exceed 10MB | 400 | File too large |
| No text extracted | 400 | File is empty or not readable |
| LLM extraction failed | 500 | OpenAI API error |
| MongoDB save failed | 500 | Database connection error |

## Usage Examples

### 1. Basic File Upload
```bash
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@receipt.jpg"
```

### 2. With Authentication
```python
import requests

headers = {
    'Authorization': 'Bearer your_jwt_token_here'
}

files = {'file': open('bank_statement.pdf', 'rb')}

response = requests.post(
    'http://localhost:8000/api/ai/expense-upload/',
    files=files,
    headers=headers
)

data = response.json()
print(f"Stored with ID: {data['mongo_id']}")
print(f"Total expenses found: {data['extracted_data']['summary']['record_count']}")
```

### 3. Handle Errors
```python
import requests

try:
    files = {'file': open('statement.pdf', 'rb')}
    response = requests.post(
        'http://localhost:8000/api/ai/expense-upload/',
        files=files,
        timeout=30
    )
    
    if response.status_code == 201:
        print("Success:", response.json())
    else:
        print("Error:", response.json()['details'])
        
except requests.exceptions.Timeout:
    print("Request timed out")
except Exception as e:
    print(f"Error: {str(e)}")
```

## Performance Considerations

- **File Size**: Maximum 10MB (configurable in serializer)
- **Processing Time**: 
  - Text extraction: 1-5 seconds per file
  - LLM processing: 5-15 seconds per file
  - Total: 10-30 seconds depending on file size and content complexity
- **Rate Limiting**: OpenAI API has rate limits based on your plan

## Security Considerations

1. **File Validation**: Files are validated by extension and size
2. **User Association**: Expenses are linked to authenticated users
3. **Data Storage**: Raw text and extracted data are stored in MongoDB
4. **API Key**: OpenAI API key should never be exposed in client-side code
5. **CORS**: Configure CORS settings in `settings.py` for production

## Environment Configuration

### Development (settings.py)
```python
DEBUG = True
ALLOWED_HOSTS = []
CORS_ALLOW_ALL_ORIGINS = True
```

### Production
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]
SECURE_SSL_REDIRECT = True
```

## Testing

### Test with cURL
```bash
# Create a test CSV file
echo "Date,Amount,Description
2024-11-20,50.00,Groceries
2024-11-21,1500.00,Electricity" > test.csv

# Upload
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -F "file=@test.csv" \
  -v
```

### Test with Python
```python
import requests
import json

# Test file upload
with open('test_invoice.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:8000/api/ai/expense-upload/',
        files=files
    )

print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'pytesseract'"
**Solution**: Install pytesseract and Tesseract OCR
```bash
pip install pytesseract
# Then install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki
```

### Issue: MongoDB connection error
**Solution**: 
- Verify `MONGO_URI` in `.env`
- Check network connection to MongoDB
- Ensure IP whitelist includes your server's IP

### Issue: OpenAI API rate limit
**Solution**:
- Wait before making more requests
- Upgrade your OpenAI plan
- Implement request queuing

### Issue: OCR not working for images
**Solution**: 
- Install Tesseract on your system
- Update the path in `settings.py` if needed
- Try different image formats (PNG recommended)

## Future Enhancements

1. **Batch Processing**: Support multiple file uploads at once
2. **Webhook Notifications**: Notify frontend when processing is complete
3. **Advanced Filtering**: Filter expenses by date range, category, amount
4. **Receipt Categorization**: Auto-categorize expenses based on patterns
5. **Duplicate Detection**: Identify duplicate expenses across uploads
6. **Receipt Image Enhancement**: Improve OCR accuracy for low-quality images
7. **Multi-language Support**: Extract from documents in multiple languages

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in Django console
3. Check MongoDB for stored documents
4. Contact the development team

## API Changelog

### v1.0.0 (Initial Release)
- File upload endpoint
- Multi-format text extraction
- LLM-based expense extraction
- MongoDB storage
- User association
