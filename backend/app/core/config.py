import json
from pathlib import Path
from dotenv import load_dotenv
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ruta absoluta al archivo .env
BASE_DIR = Path(__file__).resolve().parent.parent  # Carpeta 'app'
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE)


def _parse_cors_origins(raw: str) -> list[str]:
    if not raw or not raw.strip():
        return []
    s = raw.strip()
    if s.startswith("["):
        try:
            parsed = json.loads(s)
            return [str(x) for x in parsed]
        except json.JSONDecodeError:
            return []
    return [part.strip() for part in s.split(",") if part.strip()]


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_DURATION: int
    # Cadena en .env (coma o JSON) para evitar el decode JSON automático de listas.
    BACKEND_CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
        return _parse_cors_origins(self.BACKEND_CORS_ORIGINS)

class Settings_db(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings() # type: ignore
settings_db = Settings_db() # type: ignore