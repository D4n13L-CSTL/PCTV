from contextlib import contextmanager
from conexiones.adaptadores import conexion



@contextmanager
def get_cursor():
    conex = conexion()
    cursor = conex.cursor()
    try:
        yield cursor
        conex.commit()
    except:
        conex.rollback()
        raise
    finally:
        cursor.close()
        conex.close()
