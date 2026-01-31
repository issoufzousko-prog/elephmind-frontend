
# Script to verify patients in DB

import sqlite3
import os

DB_NAME = "elephmind.db"
if os.path.exists('/data/elephmind.db'):
    DB_NAME = '/data/elephmind.db'

def list_patients():
    if not os.path.exists(DB_NAME):
        print(f"Database {DB_NAME} not found.")
        return

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM patients")
        rows = c.fetchall()
        print(f"Found {len(rows)} patients.")
        for row in rows:
            print(dict(row))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    list_patients()
