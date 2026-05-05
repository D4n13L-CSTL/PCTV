from conexion_test_redis import con_redis

r = con_redis()

def prueba():
    r.incr('visitas')

