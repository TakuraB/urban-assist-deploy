#!/usr/bin/env python3
"""
Simple JWT test script to verify token generation and validation
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from src.config import config

# Create a minimal Flask app for testing
app = Flask(__name__)
app.config.from_object(config['development'])

# Initialize JWT
jwt = JWTManager(app)

@app.route('/test/create_token/<int:user_id>')
def create_test_token(user_id):
    """Create a test token for a user ID"""
    token = create_access_token(identity=user_id)
    return {'token': token, 'user_id': user_id}

@app.route('/test/verify_token')
@jwt_required()
def verify_test_token():
    """Verify the token and return the user ID"""
    user_id = get_jwt_identity()
    return {'user_id': user_id, 'message': 'Token is valid'}

if __name__ == '__main__':
    print("Starting JWT test server on http://localhost:5001")
    print("Test endpoints:")
    print("  - GET /test/create_token/<user_id> - Create a test token")
    print("  - GET /test/verify_token - Verify a token (requires Authorization header)")
    app.run(host='0.0.0.0', port=5001, debug=True) 