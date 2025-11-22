# Integración con API Backend - Glamsoft

## ✅ Cambios Realizados

Se ha completado la integración del frontend con la API Backend Java (puerto 7000). Todos los servicios del cliente ahora están conectados a los endpoints reales.

### 📋 Archivos Actualizados

#### 1. **config/api.config.js**
- ✅ BASE_URL actualizada a `http://localhost:7000`
- ✅ Todos los endpoints mapeados según los routers de la API Java
- ✅ Nuevos endpoints agregados: categorías, preguntas, roles, horarios, empleados, comentarios

#### 2. **services/auth.service.js**
- ✅ `/login` - POST (UsuarioController.verificarUsuario)
- ✅ `/registrar` - POST (UsuarioController.registrarUsuario)
- ✅ Ajustada respuesta para guardar `usuario` en lugar de `user`

#### 3. **services/citas.service.js**
- ✅ `/citas` - GET, POST, DELETE (CitaController)
- ✅ `/citas/{id}` - GET (CitaController.findCita)
- ✅ `/citas/clientes/{id}` - GET (CitaController.getHistorialCliente)
- ✅ `/citas/mes` - GET con query params mes, anio
- ✅ `/citas/semanas` - GET con query params anio, semana
- ✅ `/citas/dias` - GET con query param fecha
- ✅ `/citas/estado` - PATCH (CitaController.statusCita)
- ✅ `/citas/fecha` - PATCH (CitaController.fechaCita)

#### 4. **services/servicios.service.js**
- ✅ `/servicios` - GET, POST, PATCH (ServicioController)
- ✅ `/servicios/{id}` - GET, DELETE
- ✅ `/servicios/categorias/{id}` - GET (ServicioController.findByCategoria)
- ✅ `/servicios/nombres` - GET (ServicioController.findNombresServicios)

#### 5. **services/valoraciones.service.js**
- ✅ `/valoraciones` - GET, POST (ValoracionController)
- ✅ `/valoraciones/{id}` - DELETE
- ✅ Simplificado según endpoints disponibles en la API

#### 6. **services/estilistas.service.js**
- ✅ `/estilistas` - GET (EstilistaController.findAll)
- ✅ `/estilistas/{id}` - GET (EstilistaController.findById)
- ✅ `/estilistas/{id}/horarios` - GET (EstilistaController.findHorarios)
- ✅ `/estilistas/{id}/servicios` - GET (EstilistaController.findServicios)
- ✅ `/estilistas/servicios/{id}` - POST con body (EstilistaController.findEstilistaServicio)
- ✅ `/estilistas/horarios` - POST (EstilistaController.saveHorario)
- ✅ `/estilistas/servicios` - POST (EstilistaController.saveServicios)

#### 7. **services/promociones.service.js**
- ✅ `/promociones` - GET, POST, PATCH (PromocionController)
- ✅ `/promociones/{id}` - GET, DELETE
- ✅ `/promociones/{id}/servicios` - GET, POST (PromocionController.getServicios, saveServicio)

#### 8. **services/portafolio.service.js**
- ✅ `/imagenes` - GET, POST, PATCH (PortafolioController)
- ✅ `/imagenes/inicio` - GET (PortafolioController.find4)
- ✅ `/imagenes/{id}` - DELETE

#### 9. **services/usuarios.service.js**
- ✅ `/usuarios/{email}` - GET (UsuarioController.findUser)
- ✅ `/usuarios` - PATCH (UsuarioController.updateUser)
- ✅ `/usuarios/{id}` - DELETE (UsuarioController.deleteUser)
- ✅ `/empleados` - POST, PATCH (UsuarioController.registrarEmpleadoCompleto, updateEmpleadoCompleto)

#### 10. **services/notificaciones.service.js**
- ✅ Mantenido sin cambios (compatible con estructura actual)

---

## 🔗 Endpoints de la API Backend

### Autenticación (UsuarioRouter)
```
POST   /login                    - Iniciar sesión
POST   /registrar                - Registrar usuario
```

### Citas (CitaRouter)
```
GET    /citas                    - Todas las citas
GET    /citas/{id}               - Cita por ID
GET    /citas/clientes/{id}      - Historial de cliente
GET    /citas/mes                - Citas por mes (query: mes, anio)
GET    /citas/semanas            - Citas por semana (query: anio, semana)
GET    /citas/dias               - Citas por día (query: fecha)
POST   /citas                    - Crear cita
PATCH  /citas/estado             - Actualizar estado
PATCH  /citas/fecha              - Actualizar fecha
DELETE /citas/{id}               - Eliminar cita
```

### Servicios (ServicioRouter)
```
GET    /servicios                - Todos los servicios
GET    /servicios/{id}           - Servicio por ID
GET    /servicios/categorias/{id} - Servicios por categoría
GET    /servicios/nombres        - Nombres de servicios
POST   /servicios                - Crear servicio
PATCH  /servicios                - Actualizar servicio
DELETE /servicios/{id}           - Eliminar servicio
```

### Estilistas (EstilistaRouter)
```
GET    /estilistas               - Todos los estilistas
GET    /estilistas/{id}          - Estilista por ID
GET    /estilistas/{id}/horarios - Horarios del estilista
GET    /estilistas/{id}/servicios - Servicios del estilista
POST   /estilistas/servicios/{id} - Estilistas por servicio
POST   /estilistas/horarios      - Crear horario
POST   /estilistas/servicios     - Asignar servicio
```

### Promociones (PromocionRouter)
```
GET    /promociones              - Todas las promociones
GET    /promociones/{id}         - Promoción por ID
GET    /promociones/{id}/servicios - Servicios de promoción
POST   /promociones              - Crear promoción
POST   /promociones/{id}/servicios - Agregar servicio
PATCH  /promociones              - Actualizar promoción
DELETE /promociones/{id}         - Eliminar promoción
```

### Portafolio (PortafolioRouter)
```
GET    /imagenes                 - Todas las imágenes
GET    /imagenes/inicio          - Últimas 4 imágenes
POST   /imagenes                 - Crear imagen
PATCH  /imagenes                 - Actualizar imagen
DELETE /imagenes/{id}            - Eliminar imagen
```

### Valoraciones (ValoracionRouter)
```
GET    /valoraciones             - Todas las valoraciones
POST   /valoraciones             - Crear valoración
DELETE /valoraciones/{id}        - Eliminar valoración
```

### Comentarios (ComentarioRouter)
```
GET    /comentarios              - Todos los comentarios
GET    /comentarios/clientes/{id} - Historial de cliente
GET    /comentarios/fecha        - Últimos 8 comentarios
POST   /comentarios              - Crear comentario
DELETE /comentarios/{id}         - Eliminar comentario
```

### Usuarios (UsuarioRouter)
```
GET    /usuarios/{email}         - Usuario por email
PATCH  /usuarios                 - Actualizar usuario
DELETE /usuarios/{id}            - Eliminar usuario
POST   /empleados                - Crear empleado
PATCH  /empleados                - Actualizar empleado
```

### Categorías (CategoriaRouter)
```
GET    /categorias               - Todas las categorías
GET    /categorias/{id}          - Categoría por ID
POST   /categorias               - Crear categoría
DELETE /categorias/{id}          - Eliminar categoría
```

### Formularios (FormularioRouter)
```
GET    /formularios              - Todos los formularios
GET    /formularios/{id}         - Formulario por ID
POST   /formularios              - Crear formulario
PATCH  /formularios/{id}         - Actualizar formulario
DELETE /formularios/{id}         - Eliminar formulario
```

### Preguntas (PreguntaRouter)
```
GET    /preguntas                - Todas las preguntas
GET    /preguntas/{id}           - Pregunta por ID
GET    /preguntas/servicios/{id} - Preguntas por servicio
GET    /preguntas/formularios/{id} - Preguntas por formulario
POST   /preguntas                - Crear pregunta
PATCH  /preguntas/{id}           - Actualizar pregunta
DELETE /preguntas/{id}           - Eliminar pregunta
```

### Roles (RolRouter)
```
GET    /roles                    - Todos los roles
GET    /roles/{id}               - Rol por ID
POST   /roles                    - Crear rol
```

### Horarios (HorarioRouter)
```
GET    /horarios                 - Todos los horarios
POST   /horarios                 - Crear horario
PATCH  /horarios                 - Actualizar horario
DELETE /horarios/{id}            - Eliminar horario
```

### Empleados (EmpleadoRouter)
```
GET    /empleados/rol/{id}       - Empleados por rol
GET    /empleados/{id}           - Empleado por ID
```

---

## 🚀 Cómo Usar

### 1. Asegúrate de que la API esté corriendo
```bash
# La API Java debe estar ejecutándose en el puerto 7000
# http://localhost:7000
```

### 2. Abre el frontend
```bash
# Usa Live Server o cualquier servidor local
# El frontend se conectará automáticamente a localhost:7000
```

### 3. Prueba las funcionalidades

**Login:**
```javascript
// En la consola del navegador
AuthService.login({
  email: "test@example.com",
  password: "password123"
}).then(console.log).catch(console.error);
```

**Obtener servicios:**
```javascript
ServiciosService.getAll()
  .then(servicios => console.log(servicios))
  .catch(error => console.error(error));
```

**Crear cita:**
```javascript
CitasService.create({
  fechaCita: "2024-01-15T10:00:00",
  idCliente: 1,
  idEstilista: 1,
  idServicio: 1
}).then(console.log).catch(console.error);
```

---

## ⚠️ Notas Importantes

1. **CORS:** La API tiene CORS habilitado con `reflectClientOrigin = true`

2. **Tokens:** Algunos endpoints pueden requerir autenticación JWT. El token se agrega automáticamente en los headers mediante interceptores

3. **Formato de Fechas:** Usar formato ISO 8601: `YYYY-MM-DDTHH:mm:ss`

4. **Estados de Cita:** Según CitaController: "pendiente", "confirmada", "cancelada", "completada"

5. **IDs:** La API usa IDs numéricos (int) para todas las entidades

6. **Respuestas:** 
   - 200: OK
   - 201: Created
   - 204: No Content
   - 400: Bad Request
   - 404: Not Found
   - 500: Internal Server Error

---

## 📝 Pendiente (NO Implementado)

### Carpeta Admin
Los archivos en `html/admin/`, `css/admin/` y `js/admin/` **NO** fueron actualizados según tu solicitud. Estos siguen usando la estructura anterior y necesitarán actualizarse cuando estés listo.

### Endpoints sin implementar en frontend
Aunque están disponibles en la API, estos endpoints aún no tienen servicios dedicados en el frontend:
- Categorías (CATEGORIAS)
- Preguntas (PREGUNTAS)
- Roles (ROLES)
- Horarios (HORARIOS - parcialmente usado en EstilistasService)
- Empleados (EMPLEADOS - parcialmente usado en UsuariosService)

Puedes agregarlos creando nuevos archivos de servicio si los necesitas en el cliente.

---

## 🧪 Testing

Para probar la conexión:

1. Verifica que la API esté corriendo:
```bash
curl http://localhost:7000/servicios
```

2. Abre el navegador y verifica en la consola que no haya errores de CORS

3. Prueba el login desde la UI del frontend

4. Verifica en Network Tab que las peticiones se hagan a `localhost:7000`

---

## 🎯 Próximos Pasos

1. Probar cada endpoint desde el frontend
2. Manejar errores específicos de la API
3. Implementar loading states en la UI
4. Agregar validaciones de formularios
5. Implementar refresh token si la API lo soporta
6. Agregar manejo de sesión expirada
7. Considerar implementar servicios para categorías, preguntas, roles si son necesarios

---

## 📧 Contacto / Soporte

Si encuentras algún problema con la integración, verifica:
1. Que la API esté corriendo en puerto 7000
2. Que no haya errores en la consola del navegador
3. Que los formatos de datos coincidan con lo esperado por la API
4. Los logs del servidor Java para más detalles

---

**Fecha de integración:** 22 de noviembre de 2025
**Versión API:** Java con Javalin (Puerto 7000)
**Repositorio API:** https://github.com/luvips/API-GLAMSOFT.git
