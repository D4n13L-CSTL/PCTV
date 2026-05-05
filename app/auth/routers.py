from flask import request, make_response
from flask_restx import Namespace, Resource, fields


def _svc():
    """Lazy import para evitar circular import con __init__.py."""
    from app.auth import auth_service
    return auth_service


# ─── Namespace ────────────────────────────────────────────────────────────────
ns = Namespace("auth", description="Autenticación de usuarios")

# ─── Modelos de entrada (Swagger docs) ───────────────────────────────────────
register_model = ns.model("Register", {
    "username":  fields.String(required=True,  description="Nombre de usuario único"),
    "email":     fields.String(required=True,  description="Correo electrónico"),
    "password":  fields.String(required=True,  description="Contraseña"),
    "full_name": fields.String(required=True,  description="Nombre completo"),
})

login_model = ns.model("Login", {
    "email":    fields.String(required=True, description="Correo electrónico"),
    "password": fields.String(required=True, description="Contraseña"),
})

forgot_model = ns.model("ForgotPassword", {
    "email": fields.String(required=True, description="Correo del usuario"),
})

reset_model = ns.model("ResetPassword", {
    "token":        fields.String(required=True, description="Token de recuperación"),
    "new_password": fields.String(required=True, description="Nueva contraseña"),
})


# ─── Endpoints ────────────────────────────────────────────────────────────────

@ns.route("/register")
class Register(Resource):
    @ns.expect(register_model, validate=True)
    def post(self):
        """Crear un nuevo usuario"""
        data   = request.get_json()
        result = _svc().register_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            full_name=data["full_name"],
        )
        if not result["ok"]:
            return make_response({"message": result["error"]}, 400)
        return make_response(
            {"message": "Usuario creado exitosamente.", "user_id": result["user_id"]}, 201
        )


@ns.route("/login")
class Login(Resource):
    @ns.expect(login_model, validate=True)
    def post(self):
        """Iniciar sesión"""
        data   = request.get_json()
        result = _svc().login_user(
            email=data["email"],
            password=data["password"],
        )
        if not result["ok"]:
            return make_response({"message": result["error"]}, 401)
        return make_response({"message": "Login exitoso.", "user": result["user"]}, 200)


@ns.route("/forgot-password")
class ForgotPassword(Resource):
    @ns.expect(forgot_model, validate=True)
    def post(self):
        """Solicitar enlace de recuperación de contraseña por correo"""
        data     = request.get_json()
        base_url = request.host_url.rstrip("/")
        _svc().request_password_reset(email=data["email"], base_url=base_url)
        return make_response(
            {"message": "Si el correo existe, recibirás un enlace para recuperar tu contraseña."},
            200,
        )


@ns.route("/reset-password/<string:token>")
class ResetPassword(Resource):
    def get(self, token):
        """Verificar si el token de reset es válido"""
        row = _svc().read.get_reset_token(token)
        if not row:
            return make_response({"valid": False, "message": "Token inválido o expirado."}, 400)
        return make_response({"valid": True}, 200)

    @ns.expect(reset_model, validate=True)
    def post(self, token):
        """Restablecer la contraseña usando el token"""
        data   = request.get_json()
        result = _svc().reset_password(
            token=token,
            new_password=data["new_password"],
        )
        if not result["ok"]:
            return make_response({"message": result["error"]}, 400)
        return make_response({"message": "Contraseña actualizada exitosamente."}, 200)
