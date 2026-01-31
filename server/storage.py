import os
import abc
from datetime import datetime

class StorageProvider(abc.ABC):
    @abc.abstractmethod
    def save_file(self, file_bytes: bytes, filename: str) -> str:
        pass

    @abc.abstractmethod
    def get_file(self, filename: str) -> bytes:
        pass

class LocalStorage(StorageProvider):
    def __init__(self, base_dir="data_storage"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    def save_file(self, file_bytes: bytes, filename: str) -> str:
        # Prepend timestamp to avoid collision
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = f"{ts}_{filename}"
        path = os.path.join(self.base_dir, safe_name)
        with open(path, "wb") as f:
            f.write(file_bytes)
        return path

    def get_file(self, filename: str) -> bytes:
        path = os.path.join(self.base_dir, filename)
        if not os.path.exists(path):
            return None
        with open(path, "rb") as f:
            return f.read()

class SwiftStorage(StorageProvider):
    """
    OpenStack Swift Storage Provider.
    Requires python-swiftclient installed.
    """
    def __init__(self, auth_url, username, password, project_name, container_name="elephmind_images"):
        # Import here to avoid error on Windows if not installed
        try:
             from swiftclient import Connection
        except ImportError:
             raise ImportError("python-swiftclient not installed!")
             
        self.container_name = container_name
        self.conn = Connection(
            authurl=auth_url,
            user=username,
            key=password,
            tenant_name=project_name,
            auth_version='3',
            os_options={'user_domain_name': 'Default', 'project_domain_name': 'Default'}
        )
        # Ensure container exists
        try:
            self.conn.put_container(self.container_name)
        except Exception as e:
            print(f"Swift Connection Error: {e}")

    def save_file(self, file_bytes: bytes, filename: str) -> str:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = f"{ts}_{filename}"
        self.conn.put_object(
            self.container_name, 
            safe_name, 
            contents=file_bytes, 
            content_type='application/octet-stream'
        )
        return f"swift://{self.container_name}/{safe_name}"

    def get_file(self, filename: str) -> bytes:
        # filename could be safe_name
        # logic to extract key if needed
        try:
             _, obj = self.conn.get_object(self.container_name, filename)
             return obj
        except Exception:
             return None

# Factory
def get_storage_provider(config_mode="LOCAL"):
    if config_mode == "OPENSTACK":
        return SwiftStorage(
            auth_url=os.getenv("OS_AUTH_URL"),
            username=os.getenv("OS_USERNAME"),
            password=os.getenv("OS_PASSWORD"),
            project_name=os.getenv("OS_PROJECT_NAME")
        )
    else:
        return LocalStorage()
