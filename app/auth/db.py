from modelClass.BaseDAO import BaseDAO, WriteDAO


class AuthReadDAO(BaseDAO):
    """Lecturas de la tabla users y password_reset_tokens."""

    def get_user_by_email(self, email: str) -> dict | None:
        sql = """
            SELECT id, username, email, password, full_name
            FROM usuarios
            WHERE email = %s;
        """
        return self.fetch_one(sql, (email,))

    def get_user_by_username(self, username: str) -> dict | None:
        sql = """
            SELECT id, username, email, password, full_name
            FROM usuarios
            WHERE username = %s;
        """
        return self.fetch_one(sql, (username,))

    def get_reset_token(self, token: str) -> dict | None:
        """Retorna (user_id, expires_at) si el token es válido y no expiró."""
        sql = """
            SELECT user_id, expires_at
            FROM password_reset_tokens
            WHERE token = %s AND expires_at > NOW();
        """
        return self.fetch_one(sql, (token,))


class AuthWriteDAO(WriteDAO):
    """Escrituras sobre la tabla users y password_reset_tokens."""

    def create_user(self, username: str, email: str, hashed_password: str, full_name: str) -> int:
        """Inserta un usuario y retorna su id."""
        sql = """
            INSERT INTO usuarios (username, email, password, full_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """
        return self.insert_and_return_id(sql, (username, email, hashed_password, full_name))

    def save_reset_token(self, user_id: int, token: str, expires_at) -> None:
        """Guarda o actualiza el token de recuperación."""
        sql = """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id)
            DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at;
        """
        self.execute(sql, (user_id, token, expires_at))

    def update_password(self, user_id: int, hashed_password: str) -> None:
        """Actualiza la contraseña del usuario."""
        sql = "UPDATE usuarios SET password = %s WHERE id = %s;"
        self.execute(sql, (hashed_password, user_id))

    def delete_reset_token(self, token: str) -> None:
        """Elimina el token de reset después de usarlo."""
        sql = "DELETE FROM password_reset_tokens WHERE token = %s;"
        self.execute(sql, (token,))
