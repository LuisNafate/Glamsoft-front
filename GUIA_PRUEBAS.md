# 🧪 GUÍA DE PRUEBAS - GLAMSOFT

## 📋 REQUISITOS PREVIOS

1. **Base de Datos:** Ejecutar `datos_prueba.sql` en MySQL
2. **API Backend:** Debe estar corriendo en `http://localhost:7000`
3. **Frontend:** Abrir con Live Server o similar

---

## 🔐 CREDENCIALES DE PRUEBA

```javascript
// Cliente
email: "cliente1@test.com"
password: "clientePass"

// Estilista
email: "maria.lopez@glamsoft.com"
password: "estilistaPass"

// Admin
email: "admin@glamsoft.com"
password: "adminPass"
```

---

## 🚀 FLUJOS DE NAVEGACIÓN

### 1️⃣ FLUJO BÁSICO - CLIENTE SIN CUENTA

**Ruta:** `index.html` → Exploración → Registro → Login → Agendar

#### Paso a Paso:

1. **Página de Inicio** (`index.html` o `html/inicio.html`)
   - ✅ Ver portafolio (4 imágenes destacadas)
   - ✅ Ver promociones activas
   - ✅ Ver servicios disponibles
   ```javascript
   // Test en consola:
   PortafolioService.getAll()
   PromocionesService.getAll()
   ServiciosService.getAll()
   ```

2. **Ver Todos los Servicios** (`html/servicios.html`)
   - ✅ Ver catálogo completo de servicios
   - ✅ Filtrar por categoría
   - ✅ Ver precios y duración
   ```javascript
   // Test:
   ServiciosService.getByCategoria(1) // Cortes
   ServiciosService.getByCategoria(2) // Tintes
   ```

3. **Registro de Cliente** (Modal `html/modals/register.html`)
   - ✅ Abrir modal de registro
   - ✅ Completar formulario:
     ```json
     {
       "email": "nuevocliente@test.com",
       "password": "password123",
       "idRol": 3
     }
     ```
   - ✅ Recibir confirmación
   ```javascript
   // Test:
   AuthService.register({
     email: "nuevocliente@test.com",
     password: "password123",
     idRol: 3
   })
   ```

4. **Login** (`html/login.html` o modal)
   - ✅ Iniciar sesión con credenciales
   - ✅ Guardar token en localStorage
   - ✅ Redirección al perfil
   ```javascript
   // Test:
   AuthService.login({
     email: "cliente1@test.com",
     password: "clientePass"
   })
   ```

---

### 2️⃣ FLUJO COMPLETO - AGENDAR CITA

**Ruta:** Login → Servicios → Estilistas → Agendar → Confirmar

#### Paso a Paso:

1. **Seleccionar Servicio** (`html/servicios.html`)
   - ✅ Ver detalles del servicio
   - ✅ Clic en "Agendar"
   - Guardar ID del servicio seleccionado

2. **Ver Estilistas Disponibles** (`html/agendar.html`)
   - ✅ Cargar estilistas que ofrecen ese servicio
   ```javascript
   // Test:
   EstilistasService.getByServicio(1) // Servicio ID 1
   ```

3. **Seleccionar Fecha y Hora**
   - ✅ Calendario con disponibilidad
   - ✅ Ver horarios del estilista
   ```javascript
   // Test:
   EstilistasService.getHorarios(1) // Estilista María (ID 1)
   ```

4. **Confirmar Cita** (Modal `html/modals/agendar_servicios.html`)
   - ✅ Revisar resumen:
     - Servicio: Corte Clásico
     - Estilista: María López
     - Fecha: 2025-11-28 10:00:00
     - Precio: $200.00
   - ✅ Confirmar agendamiento
   ```javascript
   // Test:
   CitasService.create({
     idCliente: 4, // Tu ID de usuario
     idServicio: 1,
     idEstilista: 1,
     fechaCita: "2025-11-28T10:00:00",
     estadoCita: "PENDIENTE",
     idHorario: 1
   })
   ```

5. **Ver Confirmación** (Modal `html/modals/agenda_sucess.html`)
   - ✅ Mensaje de éxito
   - ✅ Número de cita
   - ✅ Detalles completos

---

### 3️⃣ FLUJO GESTIÓN - CLIENTE CON CITAS

**Ruta:** Login → Perfil → Historial → Gestionar Citas

#### Paso a Paso:

1. **Perfil de Usuario** (`html/perfil.html`)
   - ✅ Ver datos personales
   - ✅ Estadísticas de citas
   ```javascript
   // Test:
   AuthService.getUserByEmail("cliente1@test.com")
   ```

2. **Historial de Citas** (`html/historial_citas.html`)
   - ✅ Ver todas las citas del cliente
   - ✅ Filtrar por estado: PENDIENTE, CONFIRMADA, CANCELADA
   ```javascript
   // Test:
   CitasService.getByClient(4) // ID cliente
   ```

3. **Ver Detalle de Cita**
   - ✅ Información completa
   - ✅ Servicios incluidos
   - ✅ Estilista asignado
   ```javascript
   // Test:
   CitasService.getById(1)
   ```

4. **Cancelar Cita**
   - ✅ Botón "Cancelar Cita"
   - ✅ Modal de confirmación
   - ✅ Actualizar estado
   ```javascript
   // Test:
   CitasService.updateEstado({
     estadoCita: "CANCELADA"
   })
   ```

---

### 4️⃣ FLUJO VALORACIÓN

**Ruta:** Historial → Cita Completada → Valorar

#### Paso a Paso:

1. **Ver Citas Completadas** (`html/historial_citas.html`)
   - ✅ Filtrar citas con estado COMPLETADA
   - ✅ Botón "Valorar Servicio"

2. **Dejar Valoración** (Modal `html/modals/valoracion_confirm.html`)
   - ✅ Seleccionar estrellas (1-5)
   - ✅ Escribir comentario
   - ✅ Enviar valoración
   ```javascript
   // Test:
   ValoracionesService.create({
     puntuacion: 5,
     comentario: "Excelente servicio",
     idCliente: 4
   })
   ```

3. **Ver Valoraciones** (`html/valoracion.html`)
   - ✅ Ver todas las reseñas
   - ✅ Ordenar por fecha o puntuación
   ```javascript
   // Test:
   ValoracionesService.getAll()
   ```

---

### 5️⃣ FLUJO PORTAFOLIO Y PROMOCIONES

**Ruta:** Inicio → Galería → Promociones

#### Paso a Paso:

1. **Ver Portafolio Completo** (`html/portafolio.html`)
   - ✅ Galería de trabajos realizados
   - ✅ Imágenes de antes/después
   ```javascript
   // Test:
   PortafolioService.getAll() // Todas las imágenes
   PortafolioService.getDestacados() // Solo 4 para inicio
   ```

2. **Ver Promociones Activas** (`html/promocion.html`)
   - ✅ Lista de promociones vigentes
   - ✅ Ver servicios en promoción
   - ✅ Calcular descuentos
   ```javascript
   // Test:
   PromocionesService.getAll()
   PromocionesService.getById(1)
   ```

---

## 🧪 PRUEBAS TÉCNICAS CON CONSOLA DEL NAVEGADOR

### 1. Probar Conexión API

```javascript
// Verificar que la API responde
fetch('http://localhost:7000/servicios')
  .then(r => r.json())
  .then(data => console.log('✅ API conectada:', data))
  .catch(err => console.error('❌ Error API:', err));
```

### 2. Probar Servicios

```javascript
// Auth
await AuthService.login({ email: "cliente1@test.com", password: "clientePass" });
await AuthService.register({ email: "nuevo@test.com", password: "pass123", idRol: 3 });

// Servicios
await ServiciosService.getAll();
await ServiciosService.getById(1);
await ServiciosService.getByCategoria(1);

// Citas
await CitasService.getAll();
await CitasService.getByClient(4);
await CitasService.getByMes({ anio: 2025, mes: 11 });

// Estilistas
await EstilistasService.getAll();
await EstilistasService.getById(1);
await EstilistasService.getHorarios(1);
await EstilistasService.getByServicio(1);

// Promociones
await PromocionesService.getAll();

// Portafolio
await PortafolioService.getAll();
await PortafolioService.getDestacados();
```

### 3. Crear Nueva Cita

```javascript
const nuevaCita = {
  idCliente: 4,
  idServicio: 1,
  idEstilista: 1,
  fechaCita: "2025-12-01T14:00:00",
  estadoCita: "PENDIENTE",
  idHorario: 1
};

await CitasService.create(nuevaCita);
```

---

## 📊 ESCENARIOS DE PRUEBA

### ✅ Casos de Éxito

1. **Usuario nuevo se registra correctamente**
   - Datos válidos → Cuenta creada → Puede hacer login

2. **Cliente agenda cita exitosamente**
   - Servicio disponible → Estilista con horario → Cita creada

3. **Cliente ve su historial completo**
   - Citas pasadas, presentes y futuras visibles

4. **Cliente cancela cita pendiente**
   - Estado cambia a CANCELADA → No se puede modificar

### ❌ Casos de Error

1. **Login con credenciales incorrectas**
   ```javascript
   // Debería fallar
   await AuthService.login({ email: "fake@test.com", password: "wrong" });
   ```

2. **Agendar cita en horario ocupado**
   ```javascript
   // Validar disponibilidad primero
   await EstilistasService.getHorarios(1);
   ```

3. **Ver citas sin autenticación**
   ```javascript
   // Debería retornar 401 Unauthorized
   localStorage.removeItem('auth_token');
   await CitasService.getByClient(4);
   ```

---

## 🎯 MÉTRICAS DE ÉXITO

### Frontend
- ✅ Todas las páginas cargan sin errores 404
- ✅ Modales se abren/cierran correctamente
- ✅ Formularios validan datos antes de enviar
- ✅ Token de autenticación se guarda en localStorage

### Backend/API
- ✅ Respuestas en < 500ms
- ✅ Códigos HTTP correctos (200, 201, 400, 404)
- ✅ JSON válido en todas las respuestas
- ✅ CORS habilitado correctamente

### Base de Datos
- ✅ Datos de prueba insertados correctamente
- ✅ Relaciones entre tablas funcionan
- ✅ Queries no generan errores SQL

---

## 🐛 DEBUGGING

### Si algo no funciona:

1. **Revisar consola del navegador** (F12)
   - Ver errores de red (tab Network)
   - Ver errores JavaScript (tab Console)

2. **Verificar API está corriendo**
   ```powershell
   curl http://localhost:7000/servicios
   ```

3. **Verificar base de datos**
   ```sql
   SELECT COUNT(*) FROM servicio;
   SELECT COUNT(*) FROM cita;
   ```

4. **Usar test-api.html**
   - Abrir `test-api.html` en navegador
   - Probar endpoints uno por uno

---

## 📝 CHECKLIST DE PRUEBAS

```
[ ] Registro de usuario nuevo funciona
[ ] Login con credenciales correctas funciona
[ ] Se puede ver lista de servicios
[ ] Se puede filtrar servicios por categoría
[ ] Se puede ver lista de estilistas
[ ] Se pueden ver horarios de estilista
[ ] Se puede crear una cita nueva
[ ] Se puede ver historial de citas
[ ] Se puede cancelar una cita
[ ] Se puede dejar valoración
[ ] Se muestran promociones activas
[ ] Se muestra galería de portafolio
[ ] Modales se abren correctamente
[ ] Navegación entre páginas funciona
[ ] Logout cierra sesión correctamente
```

---

## 🎨 PÁGINAS PRINCIPALES

```
index.html ────────────► Página principal
│
├── html/inicio.html ──► Inicio con portafolio destacado
├── html/servicios.html ► Catálogo completo de servicios
├── html/agendar.html ─► Agendar nueva cita
├── html/perfil.html ──► Perfil de usuario
├── html/historial_citas.html ► Historial de citas
├── html/valoracion.html ► Ver y dejar reseñas
├── html/portafolio.html ► Galería completa
├── html/promocion.html ► Promociones activas
└── html/login.html ───► Login/registro
```

---

## 💡 TIPS

- **Usar datos de prueba:** Los IDs van del 1 al 8 para servicios
- **Fechas futuras:** Usar fechas >= 2025-11-25 para citas
- **Estados de cita:** PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
- **Roles:** 1=Admin, 2=Estilista, 3=Cliente
- **LocalStorage:** Revisar `auth_token` y `user_data`

---

## 🚨 ERRORES COMUNES

1. **CORS error:** API debe tener `enableCors` activo
2. **404 Not Found:** Verificar endpoints sin `/api/` prefix
3. **401 Unauthorized:** Token expirado o inválido
4. **500 Server Error:** Revisar logs del backend Java

---

**¡Listo para probar!** 🚀
