a = [{'id': 1, 'nombre': 'club'}, 
     {'id': 2, 'nombre': 'atleta'}, 
     {'id': 3, 'nombre': 'entrenador'}]


for i in a:
    if i.get('nombre') == 'club':
        i.get('id') 
        print(i.get('id'))

ids = [i.get('id') for i in a if i.get('nombre') == 'club']
print(ids[0])