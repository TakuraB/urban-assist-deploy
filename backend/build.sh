#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run database migrations and seed data
python -c "
import os
os.environ['FLASK_ENV'] = 'production'
from src.main import app, db
from src.seed_data import seed_database

with app.app_context():
    db.create_all()
    seed_database()
    print('Database initialized and seeded successfully!')
"

