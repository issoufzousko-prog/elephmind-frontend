

import sys
import os

# Add server directory to path to import database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database

def check_admin():
    print(f"Checking database: {database.DB_NAME}")
    
    # Initialize DB if tables missing (which seems to be the case in this context)
    database.init_db()
    
    try:
        user = database.get_user_by_username("admin")
        if user:
            print("USER 'admin' FOUND.")
            print(f"   ID: {user['id']}")
            print(f"   Email: {user['email']}")
        else:
            print("USER 'admin' NOT FOUND.")
    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    check_admin()

