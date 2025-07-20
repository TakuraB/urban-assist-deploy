#!/usr/bin/env python3
"""
Fix role values to match enum expectations
"""

import sqlite3
import os

def fix_roles():
    """Fix role values to match enum expectations"""
    
    db_path = 'src/database/app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Fixing role values...")
        
        # Update role values to match enum
        role_mapping = {
            'user': 'USER',
            'runner': 'RUNNER', 
            'moderator': 'MODERATOR',
            'admin': 'ADMIN'
        }
        
        for old_role, new_role in role_mapping.items():
            cursor.execute("UPDATE user SET role = ? WHERE role = ?", (new_role, old_role))
            updated_count = cursor.rowcount
            if updated_count > 0:
                print(f"✓ Updated {updated_count} users from '{old_role}' to '{new_role}'")
        
        # Show current users and their roles
        cursor.execute("SELECT username, email, role FROM user")
        users = cursor.fetchall()
        
        print("\nCurrent users:")
        for username, email, role in users:
            print(f"  - {username} ({email}): {role}")
        
        conn.commit()
        print("\n✓ Role fix completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Fix failed: {str(e)}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = fix_roles()
    if success:
        print("\n🎉 Role fix completed successfully!")
    else:
        print("\n❌ Role fix failed!") 