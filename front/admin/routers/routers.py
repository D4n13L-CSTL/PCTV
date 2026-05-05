from flask import Blueprint, render_template, request, make_response, session,redirect,url_for

app_admin_panel = Blueprint('AdminPanel', __name__, url_prefix='/admin_panel')

