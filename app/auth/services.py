import secrets
from datetime import datetime, timedelta, timezone

import bcrypt

from utils.email_sender import send_email


class AuthService:
    def __init__(self, read_dao, write_dao):
        self.read  = read_dao
        self.write = write_dao

    # ─── Helpers privados ─────────────────────────────────────────────────────

    def _hash_password(self, plain: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(plain.encode(), salt).decode()

    def _verify_password(self, plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode(), hashed.encode())

    # ─── Registro ─────────────────────────────────────────────────────────────

    def register_user(self, username: str, email: str, password: str, full_name: str) -> dict:
        """
        Registra un nuevo usuario.
        Retorna {"ok": True, "user_id": int} o {"ok": False, "error": str}.
        """
        if self.read.get_user_by_email(email):
            return {"ok": False, "error": "El correo ya está registrado."}
        if self.read.get_user_by_username(username):
            return {"ok": False, "error": "El nombre de usuario ya está en uso."}

        hashed   = self._hash_password(password)
        user_id  = self.write.create_user(username, email, hashed, full_name)
        return {"ok": True, "user_id": user_id}

    # ─── Login ────────────────────────────────────────────────────────────────

    def login_user(self, email: str, password: str) -> dict:
        """
        Valida credenciales.
        Retorna {"ok": True, "user": {...}} o {"ok": False, "error": str}.
        """
        user = self.read.get_user_by_email(email)
        if not user:
            return {"ok": False, "error": "Credenciales incorrectas."}

        if not self._verify_password(password, user["password"]):
            return {"ok": False, "error": "Credenciales incorrectas."}

        return {
            "ok": True,
            "user": {
                "id":        user["id"],
                "username":  user["username"],
                "email":     user["email"],
                "full_name": user["full_name"],
            },
        }

    # ─── Recuperación de contraseña ───────────────────────────────────────────

    def request_password_reset(self, email: str, base_url: str) -> dict:
        """
        Genera token de reset y envía el correo con el enlace.
        Retorna {"ok": True} siempre (no revela si el email existe).
        """
        user = self.read.get_user_by_email(email)
        if not user:
            return {"ok": True}

        token      = secrets.token_urlsafe(48)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        self.write.save_reset_token(user["id"], token, expires_at)

        reset_link = f"{base_url}/reset-password/{token}"
        body = f"""
        <p>Hola <strong>{user["full_name"]}</strong>,</p>
        <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
        <p>
            <a href="{reset_link}" style="color:#4f46e5; font-weight:bold;">
                Restablecer contraseña
            </a>
        </p>
        <p>Este enlace expira en <strong>1 hora</strong>. Si no lo solicitaste, ignora este correo.</p>
        """

        send_email(to=email, subject="Recuperación de contraseña", html_body=body)
        return {"ok": True}

    def reset_password(self, token: str, new_password: str) -> dict:
        """
        Valida el token y actualiza la contraseña.
        Retorna {"ok": True} o {"ok": False, "error": str}.
        """
        row = self.read.get_reset_token(token)
        if not row:
            return {"ok": False, "error": "El enlace no es válido o ya expiró."}

        hashed = self._hash_password(new_password)
        self.write.update_password(row["user_id"], hashed)
        self.write.delete_reset_token(token)
        return {"ok": True}
