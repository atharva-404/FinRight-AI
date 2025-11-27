# MongoDB Schema & Optimization Guide

## Collection: `expenses`

### Document Structure
```javascript
{
    "_id": ObjectId,
    "user_id": Number,              // User ID for linking expenses to users
    "file_name": String,            // Original uploaded filename
    "content_type": String,         // MIME type (e.g., "application/pdf")
    "size": Number,                 // File size in bytes
    "raw_text": String,             // Full extracted text from file
    "extracted_data": {
        "expenses": [
            {
                "date": String,         // Transaction date (YYYY-MM-DD)
                "amount": Number,       // Transaction amount
                "currency": String,     // Currency code (e.g., "INR")
                "category": String,     // Expense category
                "merchant": String,     // Merchant/vendor name
                "description": String,  // Transaction description
                "account": String,      // Account used (if available)
                "reference": String     // Transaction reference/ID
            }
            // ... more expense entries
        ],
        "summary": {
            "total_amount": Number,     // Total amount from all expenses
            "currency": String,         // Primary currency
            "record_count": Number,     // Number of expenses extracted
            "statement_period": String  // Date range of statement
        }
    },
    "created_at": ISODate           // Timestamp of upload
}
```

## Recommended Indexes

### 1. User Lookup (Most Important)
```javascript
db.expenses.createIndex({ "user_id": 1, "created_at": -1 })
```
**Use**: Retrieve all expenses for a user in reverse chronological order

### 2. Date Range Query
```javascript
db.expenses.createIndex({ "created_at": -1 })
```
**Use**: Get recent uploads across all users

### 3. File Name Search
```javascript
db.expenses.createIndex({ "file_name": "text" })
```
**Use**: Full-text search for specific files

### 4. Compound Index for Analytics
```javascript
db.expenses.createIndex({ 
    "user_id": 1, 
    "created_at": -1,
    "extracted_data.summary.total_amount": 1
})
```
**Use**: User expense totals with dates

## Create Indexes with MongoDB Client

### JavaScript (MongoDB Shell)
```javascript
// Connect to MongoDB
use om

// Create indexes
db.expenses.createIndex({ "user_id": 1, "created_at": -1 })
db.expenses.createIndex({ "created_at": -1 })
db.expenses.createIndex({ "file_name": "text" })
db.expenses.createIndex({ 
    "user_id": 1, 
    "created_at": -1,
    "extracted_data.summary.total_amount": 1
})

// View all indexes
db.expenses.getIndexes()
```

### Python (PyMongo)
```python
from pymongo import MongoClient
from django.conf import settings

# Connect to MongoDB
client = MongoClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB_NAME]
collection = db[settings.MONGODB_COLLECTION_NAME]

# Create indexes
collection.create_index([("user_id", 1), ("created_at", -1)])
collection.create_index([("created_at", -1)])
collection.create_index([("file_name", "text")])
collection.create_index([
    ("user_id", 1),
    ("created_at", -1),
    ("extracted_data.summary.total_amount", 1)
])

# View all indexes
print(collection.list_indexes())
```

### Django Management Command (Recommended)
Create `ai_assistant/management/commands/create_indexes.py`:

```python
from django.core.management.base import BaseCommand
from django.conf import settings
from pymongo import MongoClient

class Command(BaseCommand):
    help = 'Create MongoDB indexes for expense collection'

    def handle(self, *args, **options):
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB_NAME]
        collection = db[settings.MONGODB_COLLECTION_NAME]

        # Create indexes
        indexes = [
            ("user_id + created_at", [("user_id", 1), ("created_at", -1)]),
            ("created_at", [("created_at", -1)]),
            ("file_name text", [("file_name", "text")]),
        ]

        for name, index_fields in indexes:
            try:
                collection.create_index(index_fields)
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created index: {name}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Failed to create index {name}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS('\nAll indexes created successfully!')
        )
```

Run with:
```bash
python manage.py create_indexes
```

## Query Examples

### 1. Get All Expenses for a User
```javascript
db.expenses.find({ user_id: 123 }).sort({ created_at: -1 })
```

### 2. Get Expenses from Last 30 Days
```javascript
db.expenses.find({
    created_at: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
    }
})
```

### 3. Get High-Value Expenses (> 5000)
```javascript
db.expenses.find({
    "extracted_data.summary.total_amount": { $gt: 5000 }
})
```

### 4. Search by File Name
```javascript
db.expenses.find({ $text: { $search: "bank statement" } })
```

### 5. Get User Statistics
```javascript
db.expenses.aggregate([
    { $match: { user_id: 123 } },
    {
        $group: {
            _id: "$user_id",
            total_expenses: { $sum: "$extracted_data.summary.total_amount" },
            file_count: { $sum: 1 },
            avg_amount: { $avg: "$extracted_data.summary.total_amount" }
        }
    }
])
```

### 6. Top Merchants (Most Expenses)
```javascript
db.expenses.aggregate([
    { $unwind: "$extracted_data.expenses" },
    {
        $group: {
            _id: "$extracted_data.expenses.merchant",
            count: { $sum: 1 },
            total: { $sum: "$extracted_data.expenses.amount" }
        }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
])
```

### 7. Expenses by Category
```javascript
db.expenses.aggregate([
    { $unwind: "$extracted_data.expenses" },
    {
        $group: {
            _id: "$extracted_data.expenses.category",
            count: { $sum: 1 },
            total: { $sum: "$extracted_data.expenses.amount" }
        }
    },
    { $sort: { total: -1 } }
])
```

## Python (PyMongo) Examples

```python
from pymongo import MongoClient
from datetime import datetime, timedelta
from django.conf import settings

client = MongoClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB_NAME]
collection = db[settings.MONGODB_COLLECTION_NAME]

# 1. Get all expenses for user
user_expenses = list(collection.find(
    {"user_id": 123}
).sort("created_at", -1))

# 2. Get expenses from last 30 days
thirty_days_ago = datetime.utcnow() - timedelta(days=30)
recent = list(collection.find({
    "created_at": {"$gte": thirty_days_ago}
}))

# 3. Get high-value expenses
high_value = list(collection.find({
    "extracted_data.summary.total_amount": {"$gt": 5000}
}))

# 4. Search by file name
search_results = list(collection.find({
    "$text": {"$search": "bank statement"}
}))

# 5. User statistics (aggregation)
user_stats = list(collection.aggregate([
    {"$match": {"user_id": 123}},
    {
        "$group": {
            "_id": "$user_id",
            "total_expenses": {"$sum": "$extracted_data.summary.total_amount"},
            "file_count": {"$sum": 1},
            "avg_amount": {"$avg": "$extracted_data.summary.total_amount"}
        }
    }
]))

# 6. Top merchants
top_merchants = list(collection.aggregate([
    {"$unwind": "$extracted_data.expenses"},
    {
        "$group": {
            "_id": "$extracted_data.expenses.merchant",
            "count": {"$sum": 1},
            "total": {"$sum": "$extracted_data.expenses.amount"}
        }
    },
    {"$sort": {"count": -1}},
    {"$limit": 10}
]))

# 7. Expenses by category
by_category = list(collection.aggregate([
    {"$unwind": "$extracted_data.expenses"},
    {
        "$group": {
            "_id": "$extracted_data.expenses.category",
            "count": {"$sum": 1},
            "total": {"$sum": "$extracted_data.expenses.amount"}
        }
    },
    {"$sort": {"total": -1}}
]))
```

## Performance Optimization Tips

### 1. Sparse Indexes (Only for Documents with Field)
```javascript
db.expenses.createIndex(
    { "user_id": 1 },
    { sparse: true }
)
```

### 2. Background Index Creation (Production)
```javascript
db.expenses.createIndex(
    { "created_at": -1 },
    { background: true }
)
```

### 3. TTL Index (Auto-Delete Old Documents)
```javascript
// Delete documents older than 365 days
db.expenses.createIndex(
    { "created_at": 1 },
    { expireAfterSeconds: 31536000 }
)
```

### 4. Partial Index (Only Active Documents)
```javascript
db.expenses.createIndex(
    { "user_id": 1, "created_at": -1 },
    { partialFilterExpression: { user_id: { $exists: true } } }
)
```

## Monitoring Indexes

### Check Index Usage
```javascript
db.expenses.aggregate([
    { $indexStats: {} }
])
```

### Find Slow Queries
```javascript
// Enable profiling (development only)
db.setProfilingLevel(1)  // Log slow operations

// View profiling data
db.system.profile.find({
    "millis": { $gt: 1000 }  // Queries taking > 1 second
}).pretty()
```

## Backup and Recovery

### Manual Backup
```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/om" \
          --out ./backup
```

### Restore from Backup
```bash
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/om" \
             ./backup/om
```

### Automated Backup (MongoDB Atlas)
1. Go to MongoDB Atlas Dashboard
2. Project → Backup
3. Enable automated backups
4. Set backup frequency and retention policy

## Storage Estimation

### Document Size
- Average expense: ~200 bytes
- Raw text (5KB): 5,000 bytes
- Metadata: ~500 bytes
- **Total per document**: ~5,700 bytes

### Storage for 100,000 Uploads
- 100,000 × 5,700 bytes ≈ 570 MB (without overhead)
- MongoDB overhead: ~20-30%
- **Total**: ~700-750 MB

### MongoDB Atlas Tiers
- **Free Tier**: 512 MB (sufficient for testing)
- **Shared**: 5 GB (good for development)
- **Dedicated**: 10 GB+ (production ready)

## Security Best Practices

### 1. IP Whitelist
- Add your server IP to MongoDB Atlas whitelist
- Review access for production

### 2. Enable Authentication
```javascript
// Already enabled in connection string
// mongodb+srv://username:password@cluster.mongodb.net/
```

### 3. Use Role-Based Access Control
```javascript
// Create user for API access
db.createUser({
    user: "api_user",
    pwd: "secure_password",
    roles: [
        { role: "readWrite", db: "om" }
    ]
})
```

### 4. Enable Encryption at Rest
- MongoDB Atlas automatically enables this
- Verify in project settings

### 5. Enable Audit Logging
- Available in paid MongoDB Atlas plans
- Monitor all database operations

## Troubleshooting

### Issue: Slow Queries
1. Check if indexes are created
2. Run `db.expenses.explain().find({...})`
3. Look for "COLLSCAN" (full collection scan)
4. Create appropriate indexes

### Issue: Connection Timeouts
1. Verify IP is whitelisted
2. Check MONGO_URI format
3. Verify database name and collection exist

### Issue: Large Storage Usage
1. Implement TTL index to auto-delete old data
2. Archive old documents to backup
3. Implement soft delete (add "deleted_at" field)

## Maintenance Schedule

- **Daily**: Monitor queries and indexes
- **Weekly**: Review storage usage
- **Monthly**: Optimize indexes if needed
- **Quarterly**: Clean up old data
- **Annually**: Review and update schema

## References

- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)
- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
