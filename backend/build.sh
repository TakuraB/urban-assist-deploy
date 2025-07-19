#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Simple database initialization without complex imports
echo "Database initialization will be handled by the application startup"

