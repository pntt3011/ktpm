from pydantic import BaseSettings
from pathlib import Path

FILE = Path(__file__).resolve()
ROOT = FILE.parent.parent


class Settings(BaseSettings):
    HOST: str
    PORT: int

settings = Settings(ROOT / ".env")