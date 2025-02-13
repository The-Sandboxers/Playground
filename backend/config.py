from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class ApplicationConfig:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_COOKIE_SECURE = False
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@postgres:5432/playground1"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    