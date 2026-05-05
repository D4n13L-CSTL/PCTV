from conexiones.cursores import get_cursor
from app.auth.db import AuthReadDAO, AuthWriteDAO
from app.auth.services import AuthService

# ─── Instancias (inyección de dependencias) ───────────────────────────────────
_read_dao  = AuthReadDAO(connection_factory=get_cursor)
_write_dao = AuthWriteDAO(connection_factory=get_cursor)

auth_service = AuthService(read_dao=_read_dao, write_dao=_write_dao)

