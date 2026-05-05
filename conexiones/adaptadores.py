
import psycopg2
from dotenv import load_dotenv
import os
import redis
# Load environment variables from .env
load_dotenv()

USER = os.getenv("USER_DATABASE")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
DB_URL = os.getenv('DATABASE_URL')
DEBUG = os.getenv('DEBUG')

HOST_REDIS = os.getenv('HOST_REDIS')
PORT_REDIS = os.getenv('PORT_REDIS')
DB_REDIS = os.getenv('DB_REDIS')

""" 
def conexion_db():
    connection = psycopg2.connect(
            user=os.getenv("user"),
            password=os.getenv("password"),
            host=os.getenv("host"),
            port=os.getenv("port"),
            dbname=os.getenv("dbname"))
    return connection


"""

def conexion_db():
    connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME)
    return connection

def conexion_dbp():
    try:
        connection = psycopg2.connect(DB_URL.strip(), gssencmode="disable")
        return connection
    except Exception as e:
        print(f"Error: {e}")


def con_redis():
    r = redis.Redis(host=HOST_REDIS, port=PORT_REDIS, db=DB_REDIS, decode_responses=True)
    return r

def conexion():
    if DEBUG == "True":
      
        return conexion_db()
    else:
        return conexion_dbp()


#////////////////////////////////////
