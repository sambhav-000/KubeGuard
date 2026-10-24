"""Configuration settings for KubeGuard Backend."""

import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "KubeGuard API"
    APP_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"
    
    # Target Kubernetes context
    TARGET_K8S_CONTEXT: str = os.getenv("KUBEGUARD_K8S_CONTEXT", "kind-kubeguard")
    
    # CORS Origins allowed to communicate with this backend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))


settings = Settings()
