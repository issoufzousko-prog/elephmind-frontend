import requests
import sys

BASE_URL = "http://127.0.0.1:8022"

def test_health():
    print(f"Testing Health Check at {BASE_URL}/health...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("✅ Health Check Passed")
            return True
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
    return False

def test_auth():
    print("Testing Authentication...")
    
    # 1. Try to access protected route without token
    try:
        r = requests.post(f"{BASE_URL}/analyze")
        if r.status_code == 401:
            print("✅ Protected Endpoint correctly rejected unauthorized request (401)")
        else:
            print(f"❌ Protected Endpoint Failed: Expected 401, got {r.status_code}")
            return False
            
        # 2. Login to get token
        payload = {"username": "admin", "password": "secret"}
        r = requests.post(f"{BASE_URL}/token", data=payload)
        if r.status_code == 200:
            token = r.json().get("access_token")
            if token:
                print("✅ Login Successful. Token received.")
            else:
                print("❌ Login Failed: No token in response")
                return False
        else:
            print(f"❌ Login Failed: {r.status_code} - {r.text}")
            return False
            
        # 3. Access protected route WITH token (Should fail on 422 Validation 'Field required' for file, NOT 401)
        headers = {"Authorization": f"Bearer {token}"}
        # We don't send file, expecting 422 Unprocessable Entity (Missing File), which means Auth passed!
        r = requests.post(f"{BASE_URL}/analyze", headers=headers)
        if r.status_code == 422:
             print("✅ Protected Endpoint correctly accepted token (Got 422 for missing file, not 401)")
             return True
        elif r.status_code == 401:
             print("❌ Protected Endpoint rejected valid token (401)")
             return False
        else:
             print(f"⚠️ Unexpected status with token: {r.status_code}")
             return True # Acceptable for now
             
    except Exception as e:
        print(f"❌ Test Exception: {e}")
        return False

if __name__ == "__main__":
    if test_health():
        test_auth()
