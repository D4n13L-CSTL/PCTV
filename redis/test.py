import redis

# 1. Conexión a Redis
# Si tienes Redis corriendo localmente en el puerto 6379 (default)
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True) #CONEXION DE REDIS 

# 2. Operación Básica: SET y GET
r.set('mi_clave', '¡Hola desde Python!')
valor = r.get('mi_clave')
print(f"Valor obtenido: {valor}")

# 3. Operación con Expiración (TTL)
# Guardamos algo que durará 5 segundos
r.setex('temporal', 5, 'Este dato se borrará pronto')
print(f"Dato temporal: {r.get('temporal')}")

# 4. Trabajando con estructuras (Hash)
r.hset('usuario:100', mapping={
    'nombre': 'Gemini',
    'rol': 'Colaborador',
    'nivel': 5
})

usuario = r.hgetall('usuario:100')
print(f"Datos del usuario: {usuario}")

