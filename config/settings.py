import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.getenv("DEBUG", "False") == "True"
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_TOKEN_LOCATION =os.getenv("JWT_TOKEN_LOCATION")   # Guardar en cookies
JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE")  # True en producción con HTTPS
JWT_COOKIE_HTTPONLY = os.getenv("JWT_COOKIE_HTTPONLY")
JWT_COOKIE_SAMESITE =os.getenv("JWT_COOKIE_SAMESITE")  # O "Lax" si lo usas con frontend separad
JWT_COOKIE_CSRF_PROTECT = os.getenv("JWT_COOKIE_CSRF_PROTECT")
SQLALCHEMY_DATABASE_URI = os.getenv("LOCAL_DATABASE_URL")