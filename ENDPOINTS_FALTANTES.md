# Endpoints Faltantes en el Backend

Este documento describe los endpoints que necesitan ser implementados en el backend para que las vistas de estilista funcionen correctamente con filtrado del lado del servidor.

## 📋 Estado Actual

### ✅ Endpoints que SÍ existen:
- `GET /api/citas/estilista/{id}` - Obtiene todas las citas de un estilista específico
- `GET /api/citas/cliente/{id}` - Obtiene todas las citas de un cliente específico
- `GET /api/comentarios/cliente/{id}` - Obtiene todos los comentarios de un cliente específico

### ❌ Endpoints que FALTAN:

## 1. Portafolio por Estilista

**Endpoint necesario:** `GET /api/portafolio/estilista/{id}`

**Descripción:** Obtiene todas las imágenes del portafolio de un estilista específico.

**Parámetros:**
- `id` (path param): ID del estilista

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Portafolio del estilista obtenido correctamente",
  "data": [
    {
      "idImagen": 1,
      "titulo": "Corte Bob Moderno",
      "url": "https://ejemplo.com/imagen.jpg",
      "descripcion": "Corte bob con capas",
      "fechaSubida": "2025-11-23T10:30:00",
      "idEstilista": 5,
      "idCategoria": 1,
      "destacado": true
    }
  ]
}
```

**Alternativa temporal (actual):**
El frontend actualmente trae todo el portafolio con `GET /api/portafolio` y filtra en el cliente con:
```javascript
const response = await PortafolioService.getAll({ estilistaId: this.currentUserId });
```
Pero esto envía los query params que el backend **ignora**.

**Solución recomendada:**
Agregar soporte para query param `estilistaId` en `GET /api/portafolio`:
```
GET /api/portafolio?estilistaId=5
```

---

## 2. Comentarios por Estilista

**Endpoint necesario:** `GET /api/comentarios/estilista/{id}`

**Descripción:** Obtiene todos los comentarios relacionados con las citas de un estilista específico.

**Parámetros:**
- `id` (path param): ID del estilista

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Comentarios del estilista obtenidos correctamente",
  "data": [
    {
      "idComentario": 1,
      "comentario": "Excelente servicio",
      "fechaComentario": "2025-11-20T15:30:00",
      "idCita": 101,
      "idCliente": 3,
      "emailCliente": "cliente@ejemplo.com",
      "cliente": {
        "idUsuario": 3,
        "nombre": "María López",
        "email": "cliente@ejemplo.com"
      },
      "cita": {
        "idCita": 101,
        "idEstilista": 5
      }
    }
  ]
}
```

**Alternativa temporal (actual):**
El frontend actualmente trae todos los comentarios con `GET /api/comentarios` y envía query params que el backend **ignora**:
```javascript
const response = await ComentariosService.getAll({ estilistaId: user.id });
```

**Solución recomendada:**
Agregar soporte para query param `estilistaId` en `GET /api/comentarios`:
```
GET /api/comentarios?estilistaId=5
```

---

## 🔧 Implementación en el Backend

### Para Portafolio (Java Spring Boot):

```java
@GetMapping("/portafolio")
public ResponseEntity<ApiResponse<List<Portafolio>>> getAllPortafolio(
    @RequestParam(required = false) Integer estilistaId
) {
    try {
        List<Portafolio> portafolios;

        if (estilistaId != null) {
            portafolios = portafolioService.getByEstilista(estilistaId);
        } else {
            portafolios = portafolioService.getAll();
        }

        return ResponseEntity.ok(new ApiResponse<>("success",
            "Portafolio obtenido correctamente", portafolios));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(
            new ApiResponse<>("error", e.getMessage(), null));
    }
}
```

### Para Comentarios (Java Spring Boot):

```java
@GetMapping("/comentarios")
public ResponseEntity<ApiResponse<List<Comentario>>> getAllComentarios(
    @RequestParam(required = false) Integer estilistaId
) {
    try {
        List<Comentario> comentarios;

        if (estilistaId != null) {
            comentarios = comentarioService.getByEstilista(estilistaId);
        } else {
            comentarios = comentarioService.getAll();
        }

        return ResponseEntity.ok(new ApiResponse<>("success",
            "Comentarios obtenidos correctamente", comentarios));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(
            new ApiResponse<>("error", e.getMessage(), null));
    }
}
```

---

## 📊 Impacto de la Implementación

### Beneficios:
- ✅ **Menor uso de ancho de banda**: El servidor solo envía los datos necesarios
- ✅ **Mejor rendimiento**: El filtrado en base de datos es más eficiente
- ✅ **Escalabilidad**: Cuando haya muchos estilistas e imágenes, no afectará el rendimiento
- ✅ **Seguridad**: Los estilistas solo pueden ver sus propios datos

### Estado Actual (Temporal):
- ⚠️ El frontend trae **TODOS** los datos y filtra en el cliente
- ⚠️ Esto funciona pero es **ineficiente**
- ⚠️ Cuando crezca la base de datos, será un problema de rendimiento

---

## 🎯 Prioridad

**Alta** - Estos endpoints deben implementarse antes de producción para evitar:
1. Problemas de rendimiento
2. Exposición de datos de otros estilistas
3. Consumo excesivo de ancho de banda

---

## ✅ Cambios ya Realizados en el Frontend

Se han actualizado los siguientes archivos para usar los endpoints correctos:

1. **services/citas.service.js**
   - ✅ Agregado método `getByEstilista(estilistaId)`
   - ✅ El método `getAll(params)` ahora envía query params correctamente

2. **services/portafolio.service.js**
   - ✅ El método `getAll(params)` ahora acepta y envía `estilistaId` como query param

3. **services/comentarios.service.js**
   - ✅ El método `getAll(params)` ahora acepta y envía `estilistaId` como query param

4. **js/estilista/dashboard.js**
   - ✅ Usa `CitasService.getByEstilista(estilistaId)` en lugar de `getAll()`

5. **js/estilista/calendario.js**
   - ✅ Usa `CitasService.getByEstilista(user.id)` en lugar de `getAll()`

6. **js/estilista/portafolio.js**
   - ✅ Usa `PortafolioService.getAll({ estilistaId: this.currentUserId })`

7. **js/estilista/comentarios.js**
   - ✅ Usa `ComentariosService.getAll({ estilistaId: user.id })`

---

**Fecha de creación:** 2025-11-23
**Autor:** Claude Code Assistant
