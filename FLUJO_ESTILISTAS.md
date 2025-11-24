# Flujo de Estilistas - Glamsoft

## Problema Resuelto

Anteriormente, el sistema no diferenciaba correctamente entre `id_usuario` e `id_empleado`, causando que:
- Las citas no se asignaran correctamente a los estilistas
- El dashboard del estilista no mostraba sus citas

## Solución Implementada

### El Flujo Correcto en Dos Pasos

Para que un estilista pueda ser asignado a citas, el proceso debe ser:

#### Paso 1: Registrar el Usuario
Un administrador (o el propio estilista) crea la cuenta de usuario.

**Endpoint:** `POST /api/register`

**Body:**
```json
{
  "nombre": "Nuevo Estilista",
  "email": "nuevo.estilista@glamsoft.com",
  "password": "password123",
  "telefono": "555-0000",
  "id_rol": 2
}
```

**Resultado:** La API devuelve el `id_usuario` del nuevo usuario creado (ej: `id_usuario = 50`)

#### Paso 2: Crear el Perfil de Empleado
Un administrador debe "promover" a este usuario a empleado, creando su perfil profesional.

**Endpoint:** `POST /api/empleados`

**Body:**
```json
{
  "idUsuario": 50,
  "puesto": "Estilista Junior",
  "nombre": "Nuevo Estilista",
  "telefono": "555-0000",
  "imagenPerfil": "url/a/la/imagen.jpg"
}
```

**Resultado:** El backend crea un nuevo registro en la tabla `empleado` (ej: con `id_empleado = 15`) y lo vincula al `id_usuario = 50`.

### ¡Ahora sí funciona!

- ✅ El estilista con `id_usuario = 50` ahora tiene un perfil profesional con `id_empleado = 15`
- ✅ Cuando crees una cita, usarás `id_estilista = 15` (el `id_empleado`)
- ✅ Cuando consultes `GET /api/citas/estilista/15`, ¡la lista de citas aparecerá correctamente!

## Archivos Modificados

### 1. `js/agendar.js`
- `renderizarEstilistas()`: Ahora guarda `estilista.idEmpleado` en el dataset de la card
- `crearCitaEnAPI()`: Usa `selectedStylist` que contiene el `idEmpleado`
- `enviarCitaConFormulario()`: Usa `selectedStylist` con el `idEmpleado` correcto

### 2. `js/estilista/dashboard.js`
- `loadAllData()`: Obtiene el `idEmpleado` del usuario logueado
- `loadCitas()`: Usa el `idEmpleado` para obtener las citas del estilista

### 3. `services/estilistas.service.js`
- Ya está configurado correctamente para devolver `idEmpleado` en los endpoints

## Cómo Verificar que Funciona

### 1. Verificar que el estilista tiene perfil de empleado
```javascript
// En la consola del navegador cuando el estilista inicia sesión
const user = StateManager.get('user');
console.log('ID Usuario:', user.id);
console.log('ID Empleado:', user.idEmpleado);
```

**Debe mostrar ambos IDs**. Si `idEmpleado` es `undefined`, significa que el usuario NO tiene perfil de empleado.

### 2. Verificar al agendar una cita
```javascript
// En agendar.js, antes de enviar la cita
console.log('ID Estilista seleccionado (idEmpleado):', selectedStylist);
```

**Debe mostrar el `idEmpleado` del estilista**, no su `idUsuario`.

### 3. Verificar en el dashboard del estilista
```javascript
// En dashboard.js
console.log('🔑 Cargando citas para empleado ID:', idEmpleado);
```

**Debe mostrar el `idEmpleado`** y las citas deben cargarse correctamente.

## Problemas Comunes

### Error: "No se encuentran citas del estilista"
**Causa:** El usuario estilista NO tiene registro en la tabla `empleado`  
**Solución:** Crear el perfil de empleado usando `POST /api/empleados`

### Error: "Las citas se crean pero no aparecen en el dashboard"
**Causa:** El `idEstilista` en la cita es el `idUsuario` en lugar del `idEmpleado`  
**Solución:** Verificar que `selectedStylist` contiene el `idEmpleado` correcto

### Error: "El estilista no aparece en la lista de selección"
**Causa:** El endpoint `GET /api/estilistas` no devuelve el `idEmpleado`  
**Solución:** Verificar que el backend incluya `idEmpleado` en la respuesta

## Endpoints Relevantes

| Endpoint | Propósito | ID Usado |
|----------|-----------|----------|
| `POST /api/register` | Crear cuenta de usuario | Devuelve `id_usuario` |
| `POST /api/empleados` | Crear perfil de empleado | Recibe `idUsuario`, devuelve `id_empleado` |
| `GET /api/estilistas` | Lista de estilistas | Devuelve `idEmpleado` |
| `POST /api/citas` | Crear cita | Recibe `idEstilista` (debe ser `id_empleado`) |
| `GET /api/citas/estilista/:id` | Citas del estilista | `:id` debe ser `id_empleado` |

## Notas Importantes

1. **NO confundir `id_usuario` con `id_empleado`:**
   - `id_usuario`: ID en la tabla `usuario` (para autenticación)
   - `id_empleado`: ID en la tabla `empleado` (para asignación de citas)

2. **Un usuario puede ser estilista pero NO tener perfil de empleado:**
   - En este caso, NO podrá recibir citas
   - Debe completarse el Paso 2 del flujo

3. **Las citas siempre usan `id_empleado`, nunca `id_usuario`**

## Última actualización
23 de noviembre de 2025
