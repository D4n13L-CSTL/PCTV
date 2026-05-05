from dotenv import load_dotenv
import os
import redis
load_dotenv()

HOST_REDIS = os.getenv('HOST_REDIS')
PORT_REDIS = os.getenv('PORT_REDIS')
DB_REDIS = os.getenv('DB_REDIS')

def con_redis():
    r = redis.Redis(host=HOST_REDIS, port=PORT_REDIS, db=DB_REDIS, decode_responses=True)
    return r
