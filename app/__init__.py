from flask import Flask, jsonify, make_response
from config import settings
from flask_cors import CORS
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import NoAuthorizationError
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from datetime import timedelta

from front.users.routers.routers import app_render
from app.auth.routers import ns as auth_ns


api = Api(  
    doc='/docs',
    title='PCTV FLASK',
    version='1.0',
    description='API para PCTV FLASK',
    prefix='/api/v1'
              )
    




def create_app():

    app = Flask(__name__, template_folder='../front/users/views', static_folder='../front/users/static')
    app.config['SESSION_COOKIE_NAME'] = 'session'
    app.config['SECRET_KEY'] = settings.SECRET_KEY
    app.config['DEBUG'] = settings.DEBUG



    app.register_blueprint(app_render)
    
    api.add_namespace(auth_ns)
    api.init_app(app)
 
    
    CORS(app, supports_credentials=True, origins=["*"])
    

    return app
