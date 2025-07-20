#!/usr/bin/env python3
"""
Update existing users with proper roles
"""

import sqlite3
import os

def update_users():
    """Update existing users with proper roles"""
    
    db_path = 'src/database/app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Updating existing users...")
        
        # Update existing users to have 'user' role if they don't have one
        cursor.execute("UPDATE user SET role = 'user' WHERE role IS NULL OR role = ''")
        updated_count = cursor.rowcount
        print(f"✓ Updated {updated_count} users with 'user' role")
        
        # Set admin role for admin@urbanassist.com if it exists
        cursor.execute("UPDATE user SET role = 'admin', is_admin = 1 WHERE email = 'admin@urbanassist.com'")
        admin_updated = cursor.rowcount
        if admin_updated > 0:
            print("✓ Updated admin user")
        
        # Show current users and their roles
        cursor.execute("SELECT username, email, role FROM user")
        users = cursor.fetchall()
        
        print("\nCurrent users:")
        for username, email, role in users:
            print(f"  - {username} ({email}): {role}")
        
        conn.commit()
        print("\n✓ User update completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Update failed: {str(e)}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = update_users()
    if success:
        print("\n🎉 User update completed successfully!")
    else:
        print("\n❌ User update failed!") 