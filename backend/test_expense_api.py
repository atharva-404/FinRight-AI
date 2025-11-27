#!/usr/bin/env python
"""
Test script for the Expense Extraction API
Run from the backend directory: python test_expense_api.py
"""

import requests
import json
import os
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000"
UPLOAD_ENDPOINT = f"{API_BASE_URL}/api/ai/expense-upload/"

# Sample test files
TEST_FILES_DIR = Path("data")


def create_sample_csv():
    """Create a sample CSV file for testing."""
    csv_content = """Date,Description,Amount,Category,Account
2024-11-20,Grocery Shopping - BigBazaar,500.00,Groceries,Savings Account
2024-11-21,Electricity Bill,1500.00,Utilities,Current Account
2024-11-22,Uber Ride,250.00,Transportation,Debit Card
2024-11-23,Restaurant Dinner,800.00,Dining,Credit Card
2024-11-24,Amazon Purchase,2000.00,Shopping,Credit Card
2024-11-25,Medical Checkup,3000.00,Healthcare,Debit Card
2024-11-26,Internet Bill,999.00,Utilities,Current Account
"""
    file_path = TEST_FILES_DIR / "sample_expenses.csv"
    file_path.write_text(csv_content)
    return file_path


def create_sample_txt():
    """Create a sample TXT file for testing."""
    txt_content = """BANK STATEMENT
Account: 1234567890
Period: November 2024

TRANSACTIONS:

Date: 2024-11-20
Description: Flipkart Purchase
Amount: 1200.00 INR

Date: 2024-11-21
Description: BookMyShow - Movie Tickets
Amount: 800.00 INR

Date: 2024-11-22
Description: Swiggy Food Delivery
Amount: 450.00 INR

Date: 2024-11-23
Description: Fuel - Shell
Amount: 2000.00 INR

Date: 2024-11-24
Description: Hotel Stay
Amount: 5000.00 INR

Total Expenses: 9450.00 INR
"""
    file_path = TEST_FILES_DIR / "sample_bank_statement.txt"
    file_path.write_text(txt_content)
    return file_path


def test_file_upload(file_path, test_name):
    """Test file upload to the API."""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"File: {file_path.name}")
    print(f"{'='*60}")
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            
            print(f"📤 Uploading file to {UPLOAD_ENDPOINT}...")
            response = requests.post(
                UPLOAD_ENDPOINT,
                files=files,
                timeout=60
            )
        
        print(f"✅ Response Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success!")
            print(f"\n📊 Extracted Data:")
            print(f"  MongoDB ID: {data.get('mongo_id')}")
            print(f"  File Name: {data.get('file_name')}")
            print(f"  File Size: {data.get('file_size')} bytes")
            
            if 'extracted_data' in data:
                extracted = data['extracted_data']
                if 'summary' in extracted:
                    summary = extracted['summary']
                    print(f"\n📈 Summary:")
                    print(f"  Total Amount: {summary.get('total_amount')} {summary.get('currency')}")
                    print(f"  Record Count: {summary.get('record_count')}")
                    print(f"  Period: {summary.get('statement_period')}")
                
                if 'expenses' in extracted:
                    expenses = extracted['expenses']
                    print(f"\n💰 Expenses Found: {len(expenses)}")
                    for i, expense in enumerate(expenses[:3], 1):  # Show first 3
                        print(f"  {i}. {expense.get('date')} - {expense.get('description')}")
                        print(f"     Amount: {expense.get('amount')} {expense.get('currency')}")
                        print(f"     Category: {expense.get('category')}")
            
            return True
        
        elif response.status_code == 400:
            print(f"❌ Bad Request")
            error_data = response.json()
            print(f"Error: {error_data.get('error')}")
            print(f"Details: {error_data.get('details')}")
            return False
        
        elif response.status_code == 500:
            print(f"❌ Server Error")
            error_data = response.json()
            print(f"Error: {error_data.get('error')}")
            print(f"Details: {error_data.get('details')}")
            return False
        
        else:
            print(f"❌ Unexpected Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {API_BASE_URL}")
        print("   Make sure the Django server is running on port 8000")
        return False
    
    except requests.exceptions.Timeout:
        print(f"❌ Request Timeout: The request took too long")
        return False
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_invalid_file():
    """Test upload with invalid file type."""
    print(f"\n{'='*60}")
    print(f"Test: Invalid File Type")
    print(f"{'='*60}")
    
    # Create a dummy file with invalid extension
    invalid_file = TEST_FILES_DIR / "test.exe"
    invalid_file.write_text("This is not a valid file")
    
    try:
        with open(invalid_file, 'rb') as f:
            files = {'file': f}
            response = requests.post(UPLOAD_ENDPOINT, files=files, timeout=10)
        
        if response.status_code == 400:
            print(f"✅ Correctly rejected invalid file type")
            error_data = response.json()
            print(f"   Error: {error_data.get('error')}")
            print(f"   Details: {error_data.get('details')}")
            return True
        else:
            print(f"❌ Should have rejected invalid file (Got {response.status_code})")
            return False
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    finally:
        invalid_file.unlink()


def test_missing_file():
    """Test upload without file."""
    print(f"\n{'='*60}")
    print(f"Test: Missing File Parameter")
    print(f"{'='*60}")
    
    try:
        response = requests.post(UPLOAD_ENDPOINT, files={}, timeout=10)
        
        if response.status_code == 400:
            print(f"✅ Correctly rejected missing file")
            error_data = response.json()
            print(f"   Error: {error_data.get('error')}")
            return True
        else:
            print(f"❌ Expected 400 status (Got {response.status_code})")
            return False
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("EXPENSE EXTRACTION API - TEST SUITE")
    print("="*60)
    
    # Create test directory if it doesn't exist
    TEST_FILES_DIR.mkdir(exist_ok=True)
    
    # Check if server is running
    print(f"\n🔍 Checking if server is running at {API_BASE_URL}...")
    try:
        response = requests.head(API_BASE_URL, timeout=5)
        print("✅ Server is reachable")
    except:
        print("❌ Server is not reachable at http://localhost:8000")
        print("   Start the Django server with: python manage.py runserver")
        return
    
    # Run tests
    results = []
    
    # Test 1: CSV File
    csv_file = create_sample_csv()
    results.append(test_file_upload(csv_file, "CSV File Upload"))
    
    # Test 2: TXT File
    txt_file = create_sample_txt()
    results.append(test_file_upload(txt_file, "TXT File Upload"))
    
    # Test 3: Invalid File Type
    results.append(test_invalid_file())
    
    # Test 4: Missing File
    results.append(test_missing_file())
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")


if __name__ == "__main__":
    main()
