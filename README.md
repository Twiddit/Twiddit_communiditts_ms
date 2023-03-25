# Microservicio communiditts
## puerto: 3001
## endpoints:
### todas las comunidades: 
    get  localhost:3001/communiditt
    respuesta:
        json: todas las comunidades
### crear comunidad: 
    post  localhost:3001/communiditt/create
    requerimiento:
        body: 
            json:
            {
                "name":"Los gatos",
                "aboutUs":"somos los gatos",
                "tags":[
                    "f",
                    "g"
                ],
                "resources":"resource 1",
                "rules":"-rule1 /n -rule2",
                "mods":[
                    "231",
                    "232"
                ]
            }
    respuesta:
        String: "Creado", status:200
### obtener una comunidad especifica:
    get localhost:3001/communiditt/:id
    requerimiento:
        params:
            id: id de la comunidad
    respuesta:
        json:
            {
                "_id": "640ce6fbd7e7fc3c19f4f54a",
                "name": "nombre",
                "aboutUs": "acerca de",
                "tags": [
                    "games",
                    "movies",
                    "cars"
                    ],
                "resources": "resource 1",
                "rules": "-eeee -eeee",
                "mods": [
                    "idUser1"
                    ],
                "members": [
                    "idUser1",
                    "idUser2",
                    "idUser3",
                    "idUser4"
                ],
                "creationDate": "2023-03-11T20:39:23.804Z",
                "updatedAt": "2023-03-11T22:50:00.558Z",
                "__v": 0
            }, status:200
        String: "La communiditt no existe", status:404
### eliminar una comunidad:
    delete localhost:3001/communiditt/:id
    requerimiento:
        params:
            id: id de la comunidad
    respuesta:
        String: "eliminada", status: 200
        String: "La communiditt no existe", status: 404
### modificar comunidad:
    patch localhost:3001/communiditt/:id/edit
    requerimiento:
        params:
            id: id de la comunidad
        querys:
            p: campo a modificar ("name","aboutUs","tags","resources","rules","mods")
        body:
            json:{"name": "randomName"}
    respuesta:
        String: "actualizada", status: 200
        String: "Uno o mas usuarios seleccionados para moderador no existen", status: 404
        String: "La ruta de modificacion no existe", status 404
### Unirse o retirarse de una comunidad:
    patch localhost:3001/communiditt/:idComm/:idUser
    requerimiento:
        params:
            idComm: id de la comunidad
            idUser: id del ususario
        querys:
            o: Tipo de operacion ("add","remove")
    respuesta:
        String: "guardado", status:200
        String: "La ruta de union a comunidad no existe", status:404
### feed de la comunidad:
    get http://localhost:3001/communiditt/:id/feed
    requerimiento:
        params:
            id: id de la comunidad
        querys:
            tags: filtro por etiqueta
    respuesta:
        json: twidditts que pertenecen a la comunidad y filtrados por etiqueta
