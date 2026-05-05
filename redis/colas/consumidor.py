import redis
import time

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

print("Esperando tareas...")
while True:
    # BLPOP es "Blocking Left Pop". Si la cola está vacía, 
    # espera 0 segundos (infinito) hasta que llegue algo.
    tarea = r.blpop('tareas_pendientes', timeout=0)
    
    # tarea es una tupla: ('tareas_pendientes', 'nombre_de_la_tarea')
    print(f"Procesando: {tarea[1]}")
    time.sleep(1) # Simulamos trabajo