from flask import Blueprint, render_template, make_response

app_render = Blueprint('Renders', __name__, url_prefix='')

@app_render.route("/", methods=["GET"])
def render_login():
    return make_response(render_template('loggin.html'), 200)

@app_render.route("/index", methods=["GET"])
def render_index():
    return make_response(render_template('index.html'), 200)

@app_render.route("/reset-password/<string:token>", methods=["GET"])
def render_reset_password(token):
    print(f"DEBUG: Renderear reset con token: {token}")
    return make_response(render_template('reset_password.html'), 200)
