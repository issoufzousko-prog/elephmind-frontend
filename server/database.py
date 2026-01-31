import sqlite3
import os
import logging
from typing import Optional, List, Dict, Any
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# HUGGING FACE PERSISTENCE FIX: Use /data if available
if os.path.exists('/data'):
    DB_NAME = '/data/elephmind.db'
    logging.info("Using PERSISTENT storage at /data/elephmind.db")
else:
    DB_NAME = os.path.join(BASE_DIR, "elephmind.db")
    logging.info(f"Using LOCAL storage at {DB_NAME}")

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            email TEXT,
            security_question TEXT NOT NULL,
            security_answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create Feedback Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create Audit Log Table (RGPD Compliance)
    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT NOT NULL,
            resource TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # --- MIGRATIONS ---
    # Ensure security columns exist (backward compatibility)
    try:
        c.execute("ALTER TABLE users ADD COLUMN security_question TEXT DEFAULT 'Question?'")
    except sqlite3.OperationalError:
        pass # Column exists

    try:
        c.execute("ALTER TABLE users ADD COLUMN security_answer TEXT DEFAULT 'answer'")
    except sqlite3.OperationalError:
        pass # Column exists
    # ------------------

    # Create Patients Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT UNIQUE NOT NULL, -- e.g. PAT-2026-1234
            owner_username TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            birth_date TEXT,
            photo TEXT, -- Stores base64 or URL
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(owner_username) REFERENCES users(username)
        )
    ''')

    # Create Jobs Table (PERSISTENCE)
    c.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            result TEXT, -- JSON serialized
            error TEXT,
            created_at REAL,
            storage_path TEXT,
            username TEXT,
            file_type TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')
    
    conn.commit()
    conn.close()
    logging.info(f"Database {DB_NAME} initialized successfully.")

# --- User Operations ---

def create_user(user: Dict[str, Any]) -> bool:
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO users (username, hashed_password, email, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user['username'],
            user['hashed_password'],
            user.get('email', ''),
            user['security_question'],
            user['security_answer']
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        return False
    finally:
        conn.close()

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def update_password(username: str, new_hashed_password: str) -> bool:
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('UPDATE users SET hashed_password = ? WHERE username = ?', (new_hashed_password, username))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Error updating password: {e}")
        return False

# --- Feedback Operations ---

def add_feedback(username: str, rating: int, comment: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO feedback (username, rating, comment) VALUES (?, ?, ?)', (username, rating, comment))
    conn.commit()
    conn.close()

# --- Audit Log Operations (RGPD Compliance) ---

def log_audit(username: str, action: str, resource: str = None, ip_address: str = None):
    """Log user actions for RGPD compliance and security auditing."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute(
            'INSERT INTO audit_log (username, action, resource, ip_address) VALUES (?, ?, ?, ?)',
            (username, action, resource, ip_address)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logging.error(f"Error logging audit: {e}")

def get_user_audit_log(username: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Get audit log for a specific user."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        'SELECT * FROM audit_log WHERE username = ? ORDER BY created_at DESC LIMIT ?',
        (username, limit)
    )
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# --- Analysis Registry (REAL DATA ONLY) ---

def init_analysis_registry():
    """Create the analysis_registry table if it doesn't exist."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS analysis_registry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            domain TEXT NOT NULL,
            top_diagnosis TEXT,
            confidence REAL,
            priority TEXT,
            computation_time_ms INTEGER,
            file_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def log_analysis(
    username: str,
    domain: str,
    top_diagnosis: str,
    confidence: float,
    priority: str,
    computation_time_ms: int,
    file_type: str
) -> bool:
    """Log a real analysis to the registry. NO FAKE DATA."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO analysis_registry 
            (username, domain, top_diagnosis, confidence, priority, computation_time_ms, file_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (username, domain, top_diagnosis, confidence, priority, computation_time_ms, file_type))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Error logging analysis: {e}")
        return False

def get_dashboard_stats(username: str) -> Dict[str, Any]:
    """Get real dashboard statistics for a user. Returns zeros if no data."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Total count
    c.execute('SELECT COUNT(*) FROM analysis_registry WHERE username = ?', (username,))
    total = c.fetchone()[0]
    
    # By domain
    c.execute('''
        SELECT domain, COUNT(*) as count 
        FROM analysis_registry 
        WHERE username = ? 
        GROUP BY domain
    ''', (username,))
    by_domain = {row['domain']: row['count'] for row in c.fetchall()}
    
    # By priority
    c.execute('''
        SELECT priority, COUNT(*) as count 
        FROM analysis_registry 
        WHERE username = ? 
        GROUP BY priority
    ''', (username,))
    by_priority = {row['priority']: row['count'] for row in c.fetchall()}
    
    # Average computation time
    c.execute('''
        SELECT AVG(computation_time_ms) 
        FROM analysis_registry 
        WHERE username = ?
    ''', (username,))
    avg_time = c.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_analyses": total,
        "by_domain": by_domain,
        "by_priority": by_priority,
        "avg_computation_time_ms": round(avg_time, 0)
    }

def get_recent_analyses(username: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent real analyses for a user. Returns empty list if none."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT id, domain, top_diagnosis, confidence, priority, computation_time_ms, file_type, created_at
        FROM analysis_registry 
        WHERE username = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ''', (username, limit))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# --- Patient Operations (New for Migration) ---

def create_patient(
    owner_username: str,
    patient_id: str,
    first_name: str,
    last_name: str,
    birth_date: str,
    photo: str
) -> Optional[int]:
    """Create a new patient record."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO patients (owner_username, patient_id, first_name, last_name, birth_date, photo)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (owner_username, patient_id, first_name, last_name, birth_date, photo))
        patient_id_db = c.lastrowid
        conn.commit()
        conn.close()
        return patient_id_db
    except Exception as e:
        logging.error(f"Error creating patient: {e}")
        return None

def get_patients_by_user(username: str) -> List[Dict[str, Any]]:
    """Get all patients belonging to a user."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM patients WHERE owner_username = ? ORDER BY created_at DESC', (username,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_patient(username: str, patient_db_id: int) -> bool:
    """Delete a patient record if owned by user."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('DELETE FROM patients WHERE id = ? AND owner_username = ?', (patient_db_id, username))
        count = c.rowcount
        conn.commit()
        conn.close()
        return count > 0
    except Exception as e:
        logging.error(f"Error deleting patient: {e}")
        return False

def update_patient(username: str, patient_db_id: int, updates: Dict[str, Any]) -> bool:
    """Update patient fields."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Build query dynamically
        fields = []
        values = []
        for k, v in updates.items():
            if k in ['first_name', 'last_name', 'birth_date', 'photo']:
                fields.append(f"{k} = ?")
                values.append(v)
        
        if not fields:
            return False
            
        values.extend([patient_db_id, username])
        query = f"UPDATE patients SET {', '.join(fields)} WHERE id = ? AND owner_username = ?"
        

        c.execute(query, values)
        count = c.rowcount
        conn.commit()
        conn.close()
        return count > 0
    except Exception as e:
        logging.error(f"Error updating patient: {e}")
        return False

# --- Job Operations (Persistence) ---

import json

def create_job(job_data: Dict[str, Any]):
    """Create a new job record."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO jobs (id, status, result, error, created_at, storage_path, username, file_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            job_data['id'],
            job_data.get('status', 'pending'),
            json.dumps(job_data.get('result')) if job_data.get('result') else None,
            job_data.get('error'),
            job_data['created_at'],
            job_data.get('storage_path'),
            job_data.get('username'),
            job_data.get('file_type')
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Error creating job: {e}")
        return False

def get_job(job_id: str, username: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve job by ID, optionally enforcing ownership via SQL."""
    conn = get_db_connection()
    c = conn.cursor()
    
    if username:
        c.execute('SELECT * FROM jobs WHERE id = ? AND username = ?', (job_id, username))
    else:
        c.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
        
    row = c.fetchone()
    conn.close()
    
    if row:
        job = dict(row)
        if job['result']:
            try:
                job['result'] = json.loads(job['result'])
            except:
                job['result'] = None
        return job
    return None

def update_job_status(job_id: str, status: str, result: Optional[Dict] = None, error: Optional[str] = None):
    """Update job status and result."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        updates = ["status = ?"]
        params = [status]
        
        if result is not None:
            updates.append("result = ?")
            params.append(json.dumps(result))
            
        if error is not None:
            updates.append("error = ?")
            params.append(error)
            
        params.append(job_id)
        
        query = f"UPDATE jobs SET {', '.join(updates)} WHERE id = ?"
        c.execute(query, params)
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Error updating job: {e}")
        return False



def get_latest_job(username: str) -> Optional[Dict[str, Any]]:
    """Retrieve the most recent job for a user."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT * FROM jobs 
        WHERE username = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ''', (username,))
    row = c.fetchone()
    conn.close()
    
    if row:
        job = dict(row)
        if job['result']:
            try:
                job['result'] = json.loads(job['result'])
            except:
                job['result'] = None
        return job
    return None
