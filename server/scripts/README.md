# ElephMind Utility Scripts

This directory contains maintenance and debug scripts for the ElephMind backend.

## How to Run

Because these scripts import modules from the parent `server/` directory, you must run them with the parent directory in your `PYTHONPATH`.

**Windows (PowerShell):**
```powershell
$env:PYTHONPATH=".."; python init_admin.py
```

**Linux/Mac:**
```bash
PYTHONPATH=.. python init_admin.py
```

## Available Scripts

-   **`init_admin.py`**: Creates the initial 'admin' user with secure password hashing.
-   **`verify_admin.py`**: Checks if the admin user exists in the database.
-   **`test_auth.py`**: Unit tests for the authentication logic.
-   **`debug_inference.py`**: Tests the ML model with a dummy image.
-   **`inspect_model.py`**: Prints details about the loaded PyTorch model.
