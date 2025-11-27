# Manual Testing Guide

This guide provides curl commands and browser examples to test the newly implemented REST endpoints and WebSocket chat functionality.

## Prerequisites

- ASGI server running: `uvicorn core.asgi:application --app-dir d:\FinRight-AI-\backend --host 0.0.0.0 --port 8000`
- Base URL: `http://127.0.0.1:8000`
- WebSocket base: `ws://127.0.0.1:8000`

## REST Endpoints

### 1. List Documents
Retrieve all documents for the authenticated user.

```bash
curl -X GET "http://127.0.0.1:8000/api/documents/" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "file_name": "expenses.pdf",
    "created_at": "2025-11-26T10:00:00Z"
  }
]
```

---

### 2. Get Document Content
Retrieve content and metadata for a specific document.

```bash
curl -X GET "http://127.0.0.1:8000/api/documents/1/content/" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "file_name": "expenses.pdf",
  "content": "extracted text from PDF...",
  "created_at": "2025-11-26T10:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Not found."
}
```

---

### 3. Download Document as CSV or JSON
Export extracted expense data in CSV or JSON format.

**CSV (default)**:
```bash
curl -X GET "http://127.0.0.1:8000/api/ai/expense-document/1/table/" \
  -H "Content-Type: text/csv" \
  -o expenses.csv
```

**JSON**:
```bash
curl -X GET "http://127.0.0.1:8000/api/ai/expense-document/1/table/?format=json" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK for CSV):
```csv
category,date,amount,description
Groceries,2025-11-25,45.99,Weekly groceries
Transportation,2025-11-26,12.50,Gas
```

**Expected Response** (200 OK for JSON):
```json
[
  {
    "category": "Groceries",
    "date": "2025-11-25",
    "amount": 45.99,
    "description": "Weekly groceries"
  }
]
```

---

### 4. Create a Conversation
Create a new conversation (optionally linked to a document).

```bash
curl -X POST "http://127.0.0.1:8000/api/conversations/create/" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": 1
  }'
```

**Optional: Create conversation without a document**:
```bash
curl -X POST "http://127.0.0.1:8000/api/conversations/create/" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response** (201 Created):
```json
{
  "id": 5,
  "document": 1,
  "created_at": "2025-11-26T10:05:00Z",
  "last_updated": "2025-11-26T10:05:00Z"
}
```

---

### 5. List Conversations
Retrieve all conversations for the authenticated user.

```bash
curl -X GET "http://127.0.0.1:8000/api/conversations/" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 5,
    "document": 1,
    "created_at": "2025-11-26T10:05:00Z",
    "last_updated": "2025-11-26T10:05:00Z"
  },
  {
    "id": 6,
    "document": null,
    "created_at": "2025-11-26T10:06:00Z",
    "last_updated": "2025-11-26T10:06:00Z"
  }
]
```

---

## WebSocket Chat

### Connect to WebSocket
Connect to the WebSocket endpoint for a specific conversation and exchange messages.

#### Browser (JavaScript)

```javascript
// Open connection
const conversationId = 5;  // Replace with an actual conversation ID
const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${conversationId}/`);

// Handle connection open
ws.onopen = () => {
  console.log("Connected to chat");
  // Send a test message
  ws.send(JSON.stringify({
    message_text: "Hello, AI!",
    user_id: 1
  }));
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
  // Expected format:
  // {
  //   "type": "message",
  //   "data": {
  //     "id": 42,
  //     "conversation": 5,
  //     "user": 1,
  //     "text": "Hello, AI!",
  //     "created_at": "2025-11-26T10:10:00Z"
  //   }
  // }
};

// Handle errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Handle disconnect
ws.onclose = () => {
  console.log("Disconnected from chat");
};
```

#### Terminal (wscat or websocat)

**Install websocat** (if not already installed):
```bash
cargo install websocat
# or download binary from https://github.com/vi/websocat/releases
```

**Connect and send messages**:
```bash
websocat ws://127.0.0.1:8000/ws/chat/5/
# After connecting, type JSON messages:
{"message_text": "Hello, AI!", "user_id": 1}
# Press Enter to send
```

**Expected output**:
```json
{"type":"message","data":{"id":42,"conversation":5,"user":1,"text":"Hello, AI!","created_at":"2025-11-26T10:10:00Z"}}
```

---

## Testing Workflow

### Step 1: Upload and Extract an Expense Document
Assuming you have an expense extraction endpoint, upload a file first:
```bash
curl -X POST "http://127.0.0.1:8000/api/ai/expense-upload/" \
  -F "file=@/path/to/expense_file.pdf" \
  -F "file_type=pdf"
```

### Step 2: List Documents
```bash
curl -X GET "http://127.0.0.1:8000/api/documents/"
```
Note the document ID from the response (e.g., `id: 1`).

### Step 3: Download Document as CSV/JSON
```bash
curl -X GET "http://127.0.0.1:8000/api/ai/expense-document/1/table/?format=json"
```

### Step 4: Create a Conversation
```bash
curl -X POST "http://127.0.0.1:8000/api/conversations/create/" \
  -H "Content-Type: application/json" \
  -d '{"document_id": 1}'
```
Note the conversation ID (e.g., `id: 5`).

### Step 5: Connect to WebSocket Chat
Open browser console or use `websocat`:
```javascript
const ws = new WebSocket("ws://127.0.0.1:8000/ws/chat/5/");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({message_text: "Analyze these expenses", user_id: 1}));
```

### Step 6: Verify Message Persistence
Reconnect and list messages (if a `GET /api/conversations/{id}/messages/` endpoint is added):
```bash
curl -X GET "http://127.0.0.1:8000/api/conversations/5/messages/" \
  -H "Content-Type: application/json"
```

---

## Debugging Tips

### 1. Check Server Logs
If running uvicorn in a terminal:
- Look for `INFO: POST /api/conversations/create/ 201 Created`
- WebSocket connections appear as `INFO: "websocket.connect"` and `"websocket.disconnect"`

### 2. Test Authentication (if enabled)
If endpoints require authentication, add a token:
```bash
curl -X GET "http://127.0.0.1:8000/api/documents/" \
  -H "Authorization: Bearer <your_token>"
```

### 3. Verify Database State
Connect to SQLite and inspect tables:
```bash
sqlite3 d:\FinRight-AI-\backend\db.sqlite3
> SELECT * FROM ai_assistant_document;
> SELECT * FROM ai_assistant_conversation;
> SELECT * FROM ai_assistant_message;
```

### 4. Common Issues
- **Connection Refused (127.0.0.1:8000)**: Server not running. Start uvicorn with the command above.
- **404 Not Found**: Endpoint path is incorrect or URL routing not configured.
- **WebSocket Connection Failed**: Check `/ws/chat/` path routing in `core/asgi.py`.
- **ImportError in WebSocket**: Ensure lazy import of `chat_app` is in place in `core/asgi.py`.

---

## Notes

- **Authentication**: Current endpoints use `IsAuthenticated` permission class. If testing from curl, ensure session or token auth is configured.
- **CORS**: `CORS_ALLOW_ALL_ORIGINS = True` is set in settings; cross-origin requests should work.
- **In-Memory WebSocket Connections**: The in-memory connection map works for single-process testing but requires Redis/pub-sub for multi-process production.
- **CSV Export Permissions**: Currently set to `AllowAny`; recommend changing to `IsAuthenticated` for production.

---

## Next Steps

1. Run the ASGI server and execute the curl/WebSocket tests above.
2. Verify all responses match expected formats.
3. Check database state using SQLite CLI to confirm persistence.
4. For production, add authentication, secure WebSocket (WSS), and distribute WebSocket state via Redis.
