# Quick Start Guide - Expense Extraction API

## Overview
This guide will help you get the Expense Extraction API up and running in minutes.

## Prerequisites
- Python 3.8+
- OpenAI API Key
- MongoDB account with connection string
- Tesseract OCR (optional, for image processing)

## Step 1: Install Dependencies

```bash
cd backend
pip install -r requirement.txt
```

## Step 2: Configure Environment Variables

Update your `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=sk-proj-your-key-here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DBNAME=om
```

**How to get these values:**
- **OPENAI_API_KEY**: https://platform.openai.com/api-keys
- **MONGO_URI**: MongoDB Atlas dashboard → Connect → Get your connection string

## Step 3: Start the Django Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

## Step 4: Test the API

### Option A: Using cURL
```bash
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -F "file=@bank_statement.pdf"
```

### Option B: Using Python
```python
import requests

files = {'file': open('bank_statement.pdf', 'rb')}
response = requests.post(
    'http://localhost:8000/api/ai/expense-upload/',
    files=files
)
print(response.json())
```

### Option C: Using the Test Suite
```bash
python test_expense_api.py
```

## Supported File Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| PDF | .pdf | Supports scanned and digital PDFs |
| Images | .jpg, .png, .gif, .bmp, .tiff | Requires OCR for scanned content |
| CSV | .csv | Standard comma-separated values |
| Text | .txt | Plain text format |

## API Endpoint

**POST** `/api/ai/expense-upload/`

### Request
```
Content-Type: multipart/form-data

Field: file (required)
Value: Binary file content
```

### Response (Success)
```json
{
    "message": "File processed and stored successfully.",
    "mongo_id": "507f1f77bcf86cd799439011",
    "file_name": "statement.pdf",
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
            }
        ],
        "summary": {
            "total_amount": 50.00,
            "currency": "INR",
            "record_count": 1,
            "statement_period": "2024-11-01 to 2024-11-30"
        }
    }
}
```

## How It Works

1. **File Upload**: User sends file via HTTP POST
2. **Text Extraction**: 
   - PDF → PyPDF2 extracts text
   - Images → Tesseract OCR extracts text
   - CSV/TXT → Direct reading
3. **LLM Processing**: GPT-4 analyzes text and extracts structured expense data
4. **MongoDB Storage**: Raw text and extracted data stored with user association
5. **Response**: Returns extracted data with MongoDB ID

## Testing Steps

### Create a Test CSV File
```bash
# Create test data
echo "Date,Description,Amount,Category
2024-11-20,Grocery Shopping,500.00,Groceries
2024-11-21,Electricity Bill,1500.00,Utilities" > test.csv

# Upload
curl -X POST http://localhost:8000/api/ai/expense-upload/ \
  -F "file=@test.csv" -v
```

### Expected Output
You should see:
- Status code: 201 (Created)
- MongoDB ID of the stored document
- Extracted expense data with amounts, dates, categories, etc.

## Troubleshooting

### Issue: "No module named 'pymongo'"
```bash
pip install pymongo==4.6.0
```

### Issue: "No module named 'PyPDF2'"
```bash
pip install PyPDF2==3.0.1
```

### Issue: "No module named 'pytesseract'"
```bash
pip install pytesseract==0.3.10
# Also install Tesseract on your system
```

### Issue: MongoDB Connection Error
1. Check `.env` file has correct `MONGO_URI`
2. Verify MongoDB cluster allows your IP
3. Test connection: `python manage.py shell`
   ```python
   from django.conf import settings
   from pymongo import MongoClient
   client = MongoClient(settings.MONGODB_URI)
   print(client.server_info())  # Should print server info
   ```

### Issue: OpenAI API Error
1. Verify API key is correct in `.env`
2. Check API key has access to GPT-4
3. Verify you have API quota remaining
4. Test: `python manage.py shell`
   ```python
   from openai import OpenAI
   from django.conf import settings
   client = OpenAI(api_key=settings.OPENAI_API_KEY)
   print(client.models.list())  # List available models
   ```

### Issue: "Port 8000 already in use"
```bash
# Use a different port
python manage.py runserver 8001
```

## Frontend Integration

### JavaScript Example
```html
<form id="uploadForm">
    <input type="file" id="fileInput" accept=".pdf,.csv,.txt,.jpg,.png">
    <button type="submit">Upload</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = document.getElementById('fileInput').files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('http://localhost:8000/api/ai/expense-upload/', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.status === 201) {
            console.log('Success:', data);
            console.log('Total expenses:', data.extracted_data.summary.record_count);
            // Display expenses in table/list
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
});
</script>
```

### React Example
```jsx
import { useState } from 'react';

export default function ExpenseUploader() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/ai/expense-upload/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.csv,.txt,.jpg,.png"
                />
                <button type="submit" disabled={!file || loading}>
                    {loading ? 'Processing...' : 'Upload'}
                </button>
            </form>

            {result && (
                <div>
                    <h3>Results</h3>
                    <p>Total Amount: {result.extracted_data.summary.total_amount}</p>
                    <p>Expenses Found: {result.extracted_data.summary.record_count}</p>
                </div>
            )}
        </div>
    );
}
```

## Next Steps

1. **Configure Authentication**: Add JWT tokens for user identification
2. **Add Expense History**: Create endpoint to retrieve past extractions
3. **Implement Caching**: Cache extracted expenses for better performance
4. **Add Batch Processing**: Support multiple file uploads
5. **Improve OCR**: Fine-tune OCR for better image processing
6. **Add Webhooks**: Notify frontend when processing completes

## Documentation Files

- **Full API Documentation**: `EXPENSE_EXTRACTION_API.md`
- **Test Suite**: `test_expense_api.py`
- **This Quick Start**: `QUICK_START.md`

## Support

For detailed documentation, see `EXPENSE_EXTRACTION_API.md`

For questions or issues:
1. Check the Troubleshooting section
2. Review Django logs: `python manage.py runserver` (verbose output)
3. Check MongoDB Atlas dashboard for document storage
4. Review OpenAI API usage on https://platform.openai.com/usage

Happy expense tracking! 🎉
