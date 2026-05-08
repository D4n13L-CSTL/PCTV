from flask import Blueprint, render_template, make_response

app_render = Blueprint('Renders', __name__, url_prefix='')

@app_render.route("/", methods=["GET"])
def render_login():
    return make_response(render_template('loggin.html'), 200)

@app_render.route("/dashboard", methods=["GET"])
def render_dashabord():
    return make_response(render_template('dashboard.html'), 200)

@app_render.route("/pagos", methods=["GET"])
def render_pagos():
    return make_response(render_template('pagos.html'), 200)

@app_render.route("/perfil", methods=["GET"])
def render_perfil():
    return make_response(render_template('perfil.html'), 200)

@app_render.route("solicitudes/patente", methods=["GET"])
def render_patente():
    return make_response(render_template('patente.html'), 200)

@app_render.route("solicitudes/marcas", methods=["GET"])  
def render_marcas():
    return make_response(render_template('marcas.html'), 200)

@app_render.route("solicitudes/derechoautor", methods=["GET"])  
def render_derechoautor():
    return make_response(render_template('derecho_autor.html'), 200)

@app_render.route("solicitudes/registrodeobras", methods=["GET"])  
def render_registrodeobras():
    return make_response(render_template('registros_obras.html'), 200)






#///////////////////////////////////////////////////////////////////////////////////////////////////
#///////////////////////////////////////////////////////////////////////////////////////////////////
@app_render.route("/reset-password/<string:token>", methods=["GET"])
def render_reset_password(token):
    print(f"DEBUG: Renderear reset con token: {token}")
    return make_response(render_template('reset_password.html'), 200)
