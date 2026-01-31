import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import database
from main import get_password_hash

def create_admin():
    database.init_db()
    if database.get_user_by_username("admin"):
        print("Admin already exists.")
        return

    admin_data = {
        "username": "admin",
        "hashed_password": get_password_hash("password123"),
        "email": "admin@elephmind.com",
        "security_question": "Quel est votre animal totem ?",
        "security_answer": get_password_hash("elephant")
    }
    
    if database.create_user(admin_data):
        print("Admin user created successfully. (Login: admin / password123)")
    else:
        print("Failed to create admin user.")

if __name__ == "__main__":
    create_admin()
