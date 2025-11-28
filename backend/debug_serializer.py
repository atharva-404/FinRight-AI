#!/usr/bin/env python
"""
Debug script to test the UserLoginSerializer directly
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.serializers import UserLoginSerializer
from django.contrib.auth import get_user_model
import time

User = get_user_model()

# Create a test user
timestamp = int(time.time())
email = f"debug_test_{timestamp}@example.com"
username = f"debug_test_{timestamp}"
password = "TestPass123"

print(f"Creating user: {email}")
user = User.objects.create_user(
    username=username,
    email=email,
    password=password
)
print(f"✓ User created: {user.id}, {user.email}")

# Test the serializer
print("\nTesting UserLoginSerializer...")
serializer_data = {
    'email': email,
    'password': password
}

serializer = UserLoginSerializer(data=serializer_data)
is_valid = serializer.is_valid()

print(f"Serializer valid: {is_valid}")
print(f"All data keys: {list(serializer.validated_data.keys()) if is_valid else 'N/A'}")
print(f"Full validated_data: {serializer.validated_data if is_valid else 'N/A'}")

if is_valid:
    print(f"✓ 'user' in validated_data: {'user' in serializer.validated_data}")
    if 'user' in serializer.validated_data:
        print(f"✓ User object: {serializer.validated_data['user']}")
    else:
        print(f"✗ 'user' key NOT FOUND in validated_data")
else:
    print(f"✗ Errors: {serializer.errors}")

# Test password check directly
print("\nDirect password verification:")
print(f"Password check result: {user.check_password(password)}")

