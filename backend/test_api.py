#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User, Service
import json

def test_api():
    with app.test_client() as client:
        with app.app_context():
            print("Testing Urban Assist API...")
            
            # Test services endpoint
            print("\n1. Testing GET /api/services")
            response = client.get('/api/services')
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                services = response.get_json()
                print(f"Found {len(services)} services")
                if services:
                    print(f"First service: {services[0]['name']}")
            
            # Test service categories endpoint
            print("\n2. Testing GET /api/services/categories")
            response = client.get('/api/services/categories')
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                categories = response.get_json()
                print(f"Categories: {categories}")
            
            # Test runners endpoint
            print("\n3. Testing GET /api/runners")
            response = client.get('/api/runners')
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.get_json()
                print(f"Found {data['total']} runners")
                if data['runners']:
                    print(f"First runner: {data['runners'][0]['user']['first_name']} {data['runners'][0]['user']['last_name']}")
            
            # Test user registration
            print("\n4. Testing POST /api/auth/register")
            test_user = {
                "username": "testuser123",
                "email": "test123@example.com",
                "password": "password123",
                "first_name": "Test",
                "last_name": "User",
                "phone": "+1234567890"
            }
            response = client.post('/api/auth/register', 
                                 data=json.dumps(test_user),
                                 content_type='application/json')
            print(f"Status: {response.status_code}")
            if response.status_code == 201:
                data = response.get_json()
                print(f"User registered: {data['user']['username']}")
                print("Access token received: Yes")
            else:
                print(f"Error: {response.get_json()}")
            
            # Test user login
            print("\n5. Testing POST /api/auth/login")
            login_data = {
                "email": "test123@example.com",
                "password": "password123"
            }
            response = client.post('/api/auth/login',
                                 data=json.dumps(login_data),
                                 content_type='application/json')
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.get_json()
                print(f"Login successful for: {data['user']['username']}")
                access_token = data['access_token']
                
                # Test protected endpoint
                print("\n6. Testing GET /api/users/profile (protected)")
                headers = {'Authorization': f'Bearer {access_token}'}
                response = client.get('/api/users/profile', headers=headers)
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    profile = response.get_json()
                    print(f"Profile retrieved: {profile['first_name']} {profile['last_name']}")
            else:
                print(f"Login failed: {response.get_json()}")
            
            print("\n✅ API testing completed!")

if __name__ == '__main__':
    test_api()

