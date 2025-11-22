# 🧪 PRUEBAS DE API CON POSTMAN - Glamsoft

## 📋 Requisitos Previos

1. **Backend corriendo** en `http://localhost:7000`
2. **Base de datos MySQL** con datos de prueba cargados
3. **Postman** instalado

---

## 🚀 Configuración Inicial

### 1. Cargar Datos de Prueba

```bash
# En MySQL Workbench o línea de comandos:
mysql -u root -p < datos_prueba_glamsoft.sql
```

### 2. Iniciar Backend API

```bash
# Desde tu IDE (IntelliJ/Eclipse/NetBeans):
# Ejecutar Main.java

# O desde terminal:
java -jar API-GLAMSOFT.jar
```

### 3. Verificar que la API esté corriendo

```bash
# Abrir navegador en:
http://localhost:7000

# Debe responder con: "API Glamsoft is running"
```

---

## 📦 Endpoints Principales

### Base URL
```
http://localhost:7000/api
```

---

## 🔐 1. AUTENTICACIÓN

### **POST** `/api/login`
**Body (JSON):**
```json
{
  "email": "admin@glamsoft.com",
  "password": "admin123"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "userID": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **POST** `/api/registrar`
**Body (JSON):**
```json
{
  "email": "nuevo@test.com",
  "password": "123456",
  "idRol": 3
}
```

---

## 🛍️ 2. SERVICIOS

### **GET** `/api/servicios`
Obtener todos los servicios.

**Respuesta esperada:** Array con ~21 servicios
```json
[
  {
    "idServicio": 1,
    "nombre": "Corte de Cabello Dama",
    "descripcion": "Corte profesional con lavado y secado incluido",
    "precio": 250.00,
    "duracion": 45,
    "imagen": "https://...",
    "idCategoria": 1
  },
  ...
]
```

### **GET** `/api/servicios/1`
Obtener servicio por ID.

### **GET** `/api/servicios/categorias/1`
Servicios de una categoría específica.

### **POST** `/api/servicios`
Crear nuevo servicio (requiere auth).

**Body (JSON):**
```json
{
  "nombre": "Nuevo Servicio",
  "descripcion": "Descripción del servicio",
  "precio": 300.00,
  "duracion": 60,
  "idCategoria": 1,
  "imagen": "https://..."
}
```

---

## 📁 3. CATEGORÍAS

### **GET** `/api/categorias`
Obtener todas las categorías.

**Respuesta esperada:** Array con 6 categorías
```json
[
  {"idCategoria": 1, "nombre": "Cabello"},
  {"idCategoria": 2, "nombre": "Uñas"},
  {"idCategoria": 3, "nombre": "Maquillaje"},
  {"idCategoria": 4, "nombre": "Tratamientos Faciales"},
  {"idCategoria": 5, "nombre": "Depilación"},
  {"idCategoria": 6, "nombre": "Masajes"}
]
```

### **POST** `/api/categorias`
```json
{
  "nombre": "Nueva Categoría"
}
```

---

## 📅 4. CITAS

### **GET** `/api/citas`
Todas las citas.

### **GET** `/api/citas/clientes/4`
Citas de un cliente específico.

### **POST** `/api/citas`
**Body (JSON):**
```json
{
  "idCliente": 4,
  "idServicio": 1,
  "idEmpleado": 1,
  "fecha": "2025-11-30",
  "hora": "10:00:00",
  "estado": "pendiente",
  "notas": "Primera cita"
}
```

### **PATCH** `/api/citas/estado`
Actualizar estado de cita.
```json
{
  "idCita": 1,
  "estado": "confirmada"
}
```

---

## 👨‍💼 5. ESTILISTAS/EMPLEADOS

### **GET** `/api/estilistas`
Todos los estilistas.

**Respuesta esperada:**
```json
[
  {
    "idEmpleado": 1,
    "nombre": "Laura Martínez",
    "telefono": "5551234567",
    "especialidad": "Especialista en Cabello"
  },
  {
    "idEmpleado": 2,
    "nombre": "Carlos Hernández",
    "telefono": "5557654321",
    "especialidad": "Barbero Profesional"
  }
]
```

### **GET** `/api/estilistas/1`
Estilista por ID.

### **GET** `/api/estilistas/1/horarios`
Horarios de un estilista.

### **GET** `/api/estilistas/1/servicios`
Servicios que ofrece un estilista.

### **GET** `/api/estilistas/servicios/1`
Estilistas que ofrecen un servicio específico.

---

## 🎁 6. PROMOCIONES

### **GET** `/api/promociones`
Todas las promociones activas.

**Respuesta esperada:** Array con 3 promociones
```json
[
  {
    "idPromocion": 1,
    "titulo": "Promo Combo Belleza",
    "descripcion": "Corte + Tinte con 20% de descuento",
    "descuento": 20.00,
    "fechaInicio": "2025-11-01",
    "fechaFin": "2025-12-31",
    "imagen": "https://...",
    "activa": true
  },
  ...
]
```

### **GET** `/api/promociones/1/servicios`
Servicios incluidos en una promoción.

---

## 🖼️ 7. PORTAFOLIO

### **GET** `/api/imagenes`
Todas las imágenes del portafolio.

**Respuesta esperada:** Array con 8 imágenes

### **GET** `/api/imagenes/inicio`
Solo imágenes destacadas (máximo 4).

```json
[
  {
    "idImagen": 1,
    "titulo": "Corte y Color Balayage",
    "descripcion": "Hermoso balayage rubio con corte moderno",
    "url": "https://...",
    "destacada": true
  },
  ...
]
```

---

## ⭐ 8. VALORACIONES

### **GET** `/api/valoraciones`
Todas las valoraciones.

**Respuesta esperada:** Array con 6 valoraciones
```json
[
  {
    "idValoracion": 1,
    "idCliente": 4,
    "calificacion": 5,
    "comentario": "Excelente servicio...",
    "fecha": "2025-11-15"
  },
  ...
]
```

### **POST** `/api/valoraciones`
```json
{
  "idCliente": 4,
  "calificacion": 5,
  "comentario": "Muy satisfecha con el servicio"
}
```

---

## 💬 9. COMENTARIOS

### **GET** `/api/comentarios`
Todos los comentarios.

### **GET** `/api/comentarios/fecha`
Comentarios recientes (últimos 8).

### **GET** `/api/comentarios/clientes/4`
Comentarios de un cliente.

---

## ⏰ 10. HORARIOS

### **GET** `/api/horarios`
Todos los horarios.

### **POST** `/api/horarios`
```json
{
  "idEmpleado": 1,
  "diaSemana": "Lunes",
  "horaInicio": "09:00:00",
  "horaFin": "18:00:00"
}
```

---

## 📝 11. FORMULARIOS DE CONTACTO

### **GET** `/api/formularios`
Todos los formularios.

**Respuesta esperada:** Array con 3 formularios

### **POST** `/api/formularios`
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "5551234567",
  "asunto": "Consulta",
  "mensaje": "¿Tienen servicio a domicilio?"
}
```

---

## 🧪 COLECCIÓN DE POSTMAN

### Crear Colección Manualmente:

1. **Abrir Postman**
2. **New Collection** → "Glamsoft API"
3. **Agregar carpetas:**
   - Autenticación
   - Servicios
   - Categorías
   - Citas
   - Estilistas
   - Promociones
   - Portafolio
   - Valoraciones
   - Comentarios
   - Horarios
   - Formularios

4. **Configurar Environment:**
   - Variable: `base_url`
   - Valor: `http://localhost:7000/api`

5. **Agregar Requests básicos** en cada carpeta

---

## ✅ VERIFICACIÓN RÁPIDA

### Prueba 1: API funcionando
```bash
GET http://localhost:7000
# Debe responder: "API Glamsoft is running"
```

### Prueba 2: Obtener servicios
```bash
GET http://localhost:7000/api/servicios
# Debe retornar array con 21 servicios
```

### Prueba 3: Login
```bash
POST http://localhost:7000/api/login
Body: {"email": "admin@glamsoft.com", "password": "admin123"}
# Debe retornar token JWT
```

### Prueba 4: Portafolio destacado
```bash
GET http://localhost:7000/api/imagenes/inicio
# Debe retornar 4 imágenes destacadas
```

---

## 🚨 Solución de Problemas

### Error: "Cannot connect to localhost:7000"
- Verificar que el backend esté corriendo
- Verificar que el puerto 7000 no esté ocupado

### Error: "Table doesn't exist"
- Ejecutar el script de datos de prueba: `datos_prueba_glamsoft.sql`

### Error: "No data found"
- Verificar que se insertaron los datos correctamente:
```sql
SELECT COUNT(*) FROM servicio; -- Debe ser 21
SELECT COUNT(*) FROM categoria; -- Debe ser 6
SELECT COUNT(*) FROM imagen; -- Debe ser 8
```

### Servicios no aparecen en frontend
1. Verificar API: `GET http://localhost:7000/api/servicios`
2. Abrir DevTools (F12) → Console
3. Verificar errores de CORS o conexión
4. Verificar que `api.config.js` tiene `BASE_URL: 'http://localhost:7000/api'`

---

## 📊 DATOS DE PRUEBA

### Usuarios:
- **Admin:** admin@glamsoft.com / admin123
- **Empleado1:** empleado1@glamsoft.com / empleado123
- **Cliente1:** cliente1@test.com / cliente123

### IDs útiles:
- Categoría Cabello: 1
- Categoría Uñas: 2
- Servicio Corte Dama: 1
- Empleado Laura: 1
- Cliente Test: 4
- Promoción Black Friday: 2

---

## 🎯 PRUEBA COMPLETA

### 1. Verificar backend
```bash
curl http://localhost:7000
```

### 2. Login
```bash
curl -X POST http://localhost:7000/api/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@glamsoft.com","password":"admin123"}'
```

### 3. Obtener servicios
```bash
curl http://localhost:7000/api/servicios
```

### 4. Obtener portafolio
```bash
curl http://localhost:7000/api/imagenes/inicio
```

### 5. Obtener promociones
```bash
curl http://localhost:7000/api/promociones
```

---

## 📖 Documentación Adicional

- API Backend: `API-GLAMSOFT/README.md`
- Frontend: `INTEGRACION_ADMIN_COMPLETADA.md`
- Estructura DB: `glamsoft_schema.sql`

---

**✅ Una vez verificados todos los endpoints, el frontend debería mostrar los datos reales sin simulaciones**
