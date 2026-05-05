import redis
import json

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def obtener_perfil_usuario(user_id):
    clave = f"usuario:{user_id}"
    
    # 1. Intentar buscar en la caché (Redis)
    datos = r.get(clave)
    print(datos)
    if datos:
        print("¡Cache Hit! Trayendo desde Redis...")
        return json.loads(datos)
    
    # 2. Si no está en Redis (Cache Miss), vamos a la DB real
    print("Cache Miss. Consultando la DB principal...")
    # Simulación de consulta lenta a BD
    usuario_db = {"id": user_id, "nombre": "Juan Pérez", "nivel": 10}
    
    # 3. Guardar en Redis para futuras consultas (TTL de 60 segundos)
    r.setex(clave, 60, json.dumps(usuario_db))
    
    return usuario_db

# Primera vez: Consulta DB (Lento)
print(obtener_perfil_usuario(123))

# Segunda vez (antes de 60 seg): Consulta Redis (Instantáneo)
