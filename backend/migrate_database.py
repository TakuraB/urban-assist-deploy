#!/usr/bin/env python3
"""
Database Migration Script for Urban Assist
Adds new columns to existing tables for enhanced functionality
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Migrate the database to add new columns"""
    
    # Database path
    db_path = 'src/database/app.db'
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting database migration...")
        
        # Check if role column exists in user table
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add new columns to user table if they don't exist
        new_columns = [
            ('role', 'TEXT DEFAULT "user"'),
            ('is_verified', 'BOOLEAN DEFAULT 0'),
            ('email_verified', 'BOOLEAN DEFAULT 0'),
            ('two_factor_enabled', 'BOOLEAN DEFAULT 0'),
            ('two_factor_secret', 'TEXT'),
            ('last_login', 'DATETIME')
        ]
        
        for column_name, column_def in new_columns:
            if column_name not in columns:
                print(f"Adding column '{column_name}' to user table...")
                cursor.execute(f"ALTER TABLE user ADD COLUMN {column_name} {column_def}")
                print(f"✓ Added column '{column_name}'")
            else:
                print(f"Column '{column_name}' already exists")
        
        # Create notifications table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notification (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                notification_type VARCHAR(50) NOT NULL,
                related_id INTEGER,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user (id)
            )
        """)
        print("✓ Notifications table ready")
        
        # Create payments table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_id INTEGER NOT NULL,
                amount FLOAT NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                payment_method VARCHAR(50),
                payment_intent_id VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                transaction_id VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES booking (id)
            )
        """)
        print("✓ Payments table ready")
        
        # Update existing users to have the 'user' role
        cursor.execute("UPDATE user SET role = 'user' WHERE role IS NULL")
        print("✓ Updated existing users with default role")
        
        # Create an admin user if none exists
        cursor.execute("SELECT COUNT(*) FROM user WHERE role = 'admin'")
        admin_count = cursor.fetchone()[0]
        
        if admin_count == 0:
            print("Creating default admin user...")
            try:
                cursor.execute("""
                    INSERT INTO user (username, email, password_hash, first_name, last_name, role, is_admin, is_verified, email_verified)
                    VALUES ('admin', 'admin@urbanassist.com', 'pbkdf2:sha256:600000$admin$hash', 'Admin', 'User', 'admin', 1, 1, 1)
                """)
                print("✓ Created default admin user (admin@urbanassist.com)")
            except sqlite3.IntegrityError as e:
                if "UNIQUE constraint failed" in str(e):
                    print("⚠ Admin user already exists, updating role...")
                    cursor.execute("UPDATE user SET role = 'admin', is_admin = 1 WHERE email = 'admin@urbanassist.com'")
                    print("✓ Updated existing user to admin role")
                else:
                    raise e
        
        # Commit changes
        conn.commit()
        print("✓ Database migration completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("\n🎉 Database migration completed successfully!")
        print("You can now restart your backend server.")
    else:
        print("\n❌ Database migration failed!")
        print("Please check the error messages above.") 