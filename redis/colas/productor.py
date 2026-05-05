import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Enviamos tareas a la cola llamada 'tareas_pendientes'
tareas = ["enviar_email", "generar_pdf", "procesar_imagen"]

for t in tareas:
    r.rpush('tareas_pendientes', t)
    print(f"Tarea enviada: {t}")