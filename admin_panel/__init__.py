from flask import Flask, jsonify, make_response
from config import settings
from flask_cors import CORS
from flask_restx import Api



api = Api(  
    doc='/admin/docs',
    title='Admin Panel API',
    version='1.0',
    description='API para Livo Sport',
    prefix='/api/admin')
    




def create_app():

    app = Flask(__name__, template_folder='../front/admin/views', static_folder='../front/static')
    app.config['SESSION_COOKIE_NAME'] = 'session'
    app.config['SECRET_KEY'] = settings.SECRET_KEY
    app.config['DEBUG'] = settings.DEBUG
    api.init_app(app)
    
    
    
    
    CORS(app, supports_credentials=True, origins=["*"])


    return app
