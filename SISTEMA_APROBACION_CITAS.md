# 📋 Sistema de Aprobación de Citas con Formularios Personalizados y Notificaciones

## 🎯 Resumen del Sistema

Este documento describe la implementación completa del nuevo flujo de aprobación de citas que incluye:

1. **Formularios personalizados por servicio** (preguntas dinámicas configurables por admin)
2. **Sistema de aprobación de citas** (las citas pasan a estado PENDIENTE y requieren aprobación de admin)
3. **Notificaciones en tiempo real** (usuarios y admins reciben notificaciones del estado de citas)
4. **Envío de email solo al aprobar** (confirmación enviada solo cuando admin aprueba la cita)

---

## 🔄 Flujo Completo del Usuario

### Antes (Flujo Antiguo):
```
Usuario → Selecciona servicio/fecha/hora/estilista → Click "Confirmar"
→ Cita creada ✅ → Email enviado 📧 → Modal de éxito
```

### Ahora (Flujo Nuevo):
```
Usuario → Selecciona servicio/fecha/hora/estilista → Click "Confirmar"
→ Modal con formulario personalizado aparece 📝
→ Usuario completa preguntas del servicio
→ Usuario envía → Cita creada con estado "PENDIENTE" ⏳
→ Modal "Solicitud enviada, pendiente de aprobación"
→ Notificación enviada a TODOS los admins 🔔

--- ADMIN revisa en su dashboard ---

CASO 1: Admin aprueba ✅
→ Estado cita cambia a "APROBADA"
→ Email de confirmación enviado al usuario 📧
→ Notificación enviada al usuario "¡Cita confirmada!"

CASO 2: Admin rechaza ❌
→ Estado cita cambia a "RECHAZADA"
→ Notificación enviada al usuario con razón del rechazo
→ NO se envía email
```

---

## 🗄️ Cambios Necesarios en el Backend

### 1. Crear Nueva Tabla: `notificaciones`

```sql
CREATE TABLE notificaciones (
    id_notificacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) NOT NULL COMMENT 'CITA_PENDIENTE, CITA_APROBADA, CITA_RECHAZADA, CITA_CANCELADA',
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    id_cita INT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE,
    INDEX idx_usuario_leida (id_usuario, leida),
    INDEX idx_fecha (fecha_creacion DESC)
);
```

### 2. Modificar Tabla Existente: `citas`

```sql
ALTER TABLE citas
ADD COLUMN estado VARCHAR(20) DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, APROBADA, RECHAZADA, CANCELADA',
ADD COLUMN respuestas_formulario JSON COMMENT 'Respuestas del formulario personalizado',
ADD COLUMN razon_rechazo TEXT,
ADD COLUMN fecha_aprobacion TIMESTAMP NULL,
ADD COLUMN aprobada_por INT NULL,
ADD FOREIGN KEY (aprobada_por) REFERENCES usuarios(id_usuario);

-- Crear índice para consultas de citas pendientes
CREATE INDEX idx_estado ON citas(estado);
```

### 3. Crear Nueva Tabla: `preguntas_formulario`

```sql
CREATE TABLE preguntas_formulario (
    id_pregunta INT PRIMARY KEY AUTO_INCREMENT,
    id_servicio INT NOT NULL,
    pregunta TEXT NOT NULL,
    tipo_respuesta VARCHAR(50) NOT NULL COMMENT 'texto, textarea, opcion_multiple, si_no, numero',
    opciones JSON COMMENT 'Opciones para preguntas de selección múltiple',
    obligatoria BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    INDEX idx_servicio_orden (id_servicio, orden)
);
```

### 4. Crear DTOs (Data Transfer Objects)

#### `PreguntaFormularioDTO.java`
```java
package com.glamsoft.dto;

import lombok.Data;
import java.util.List;

@Data
public class PreguntaFormularioDTO {
    private Integer idPregunta;
    private Integer idServicio;
    private String pregunta;
    private String tipoRespuesta; // texto, textarea, opcion_multiple, si_no, numero
    private List<String> opciones;
    private Boolean obligatoria;
    private Integer orden;
    private Boolean activo;
}
```

#### `NotificacionDTO.java`
```java
package com.glamsoft.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificacionDTO {
    private Integer idNotificacion;
    private Integer idUsuario;
    private String tipo; // CITA_PENDIENTE, CITA_APROBADA, CITA_RECHAZADA, CITA_CANCELADA
    private String titulo;
    private String mensaje;
    private Integer idCita;
    private Boolean leida;
    private LocalDateTime fechaCreacion;
}
```

#### `RechazoCitaDTO.java`
```java
package com.glamsoft.dto;

import lombok.Data;

@Data
public class RechazoCitaDTO {
    private String razonRechazo;
}
```

---

## 📡 Nuevos Endpoints del Backend

### A. `NotificacionesController.java`

```java
package com.glamsoft.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.glamsoft.dto.ResponseDTO;
import com.glamsoft.service.NotificacionesService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NotificacionesController {

    @Autowired
    private NotificacionesService notificacionesService;

    /**
     * Obtener todas las notificaciones de un usuario
     * GET /api/usuarios/{idUsuario}/notificaciones
     */
    @GetMapping("/usuarios/{idUsuario}/notificaciones")
    public ResponseEntity<ResponseDTO> getNotificacionesByUsuario(@PathVariable Integer idUsuario) {
        try {
            List<?> notificaciones = notificacionesService.getByUsuario(idUsuario);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Notificaciones recuperadas")
                    .data(notificaciones)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al obtener notificaciones: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Contar notificaciones no leídas de un usuario
     * GET /api/usuarios/{idUsuario}/notificaciones/no-leidas
     */
    @GetMapping("/usuarios/{idUsuario}/notificaciones/no-leidas")
    public ResponseEntity<ResponseDTO> contarNoLeidas(@PathVariable Integer idUsuario) {
        try {
            Long count = notificacionesService.contarNoLeidas(idUsuario);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Contador de no leídas")
                    .data(count)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al contar notificaciones: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Marcar notificación como leída
     * PUT /api/notificaciones/{id}/marcar-leida
     */
    @PutMapping("/notificaciones/{id}/marcar-leida")
    public ResponseEntity<ResponseDTO> marcarComoLeida(@PathVariable Integer id) {
        try {
            notificacionesService.marcarComoLeida(id);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Notificación marcada como leída")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al marcar notificación: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Eliminar notificación
     * DELETE /api/notificaciones/{id}
     */
    @DeleteMapping("/notificaciones/{id}")
    public ResponseEntity<ResponseDTO> eliminar(@PathVariable Integer id) {
        try {
            notificacionesService.eliminar(id);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Notificación eliminada")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al eliminar notificación: " + e.getMessage())
                    .build());
        }
    }
}
```

### B. `PreguntasFormularioController.java`

```java
package com.glamsoft.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.glamsoft.dto.ResponseDTO;
import com.glamsoft.dto.PreguntaFormularioDTO;
import com.glamsoft.service.PreguntasFormularioService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PreguntasFormularioController {

    @Autowired
    private PreguntasFormularioService preguntasFormularioService;

    /**
     * Obtener todas las preguntas activas de un servicio
     * GET /api/servicios/{idServicio}/preguntas
     */
    @GetMapping("/servicios/{idServicio}/preguntas")
    public ResponseEntity<ResponseDTO> getPreguntasByServicio(@PathVariable Integer idServicio) {
        try {
            List<?> preguntas = preguntasFormularioService.getByServicio(idServicio);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Preguntas del servicio recuperadas")
                    .data(preguntas)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al obtener preguntas: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Crear nueva pregunta para un servicio (ADMIN)
     * POST /api/preguntas
     */
    @PostMapping("/preguntas")
    public ResponseEntity<ResponseDTO> crear(@RequestBody PreguntaFormularioDTO preguntaDTO) {
        try {
            PreguntaFormulario pregunta = preguntasFormularioService.crear(preguntaDTO);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Pregunta creada")
                    .data(pregunta)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al crear pregunta: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Actualizar pregunta existente (ADMIN)
     * PUT /api/preguntas/{id}
     */
    @PutMapping("/preguntas/{id}")
    public ResponseEntity<ResponseDTO> actualizar(
            @PathVariable Integer id,
            @RequestBody PreguntaFormularioDTO preguntaDTO) {
        try {
            PreguntaFormulario pregunta = preguntasFormularioService.actualizar(id, preguntaDTO);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Pregunta actualizada")
                    .data(pregunta)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al actualizar pregunta: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Eliminar/desactivar pregunta (ADMIN)
     * DELETE /api/preguntas/{id}
     */
    @DeleteMapping("/preguntas/{id}")
    public ResponseEntity<ResponseDTO> eliminar(@PathVariable Integer id) {
        try {
            preguntasFormularioService.desactivar(id);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .status("success")
                    .message("Pregunta desactivada")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status("error")
                    .message("Error al desactivar pregunta: " + e.getMessage())
                    .build());
        }
    }
}
```

### C. Modificar `CitasController.java`

Agregar estos métodos al controlador existente:

```java
/**
 * Obtener citas pendientes de aprobación (ADMIN)
 * GET /api/citas/pendientes
 */
@GetMapping("/citas/pendientes")
public ResponseEntity<ResponseDTO> getCitasPendientes() {
    try {
        List<?> citas = citasService.getCitasPendientes();

        return ResponseEntity.ok(ResponseDTO.builder()
                .status("success")
                .message("Citas pendientes recuperadas")
                .data(citas)
                .build());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status("error")
                .message("Error al obtener citas pendientes: " + e.getMessage())
                .build());
    }
}

/**
 * Aprobar una cita (ADMIN)
 * PUT /api/citas/{idCita}/aprobar
 */
@PutMapping("/citas/{idCita}/aprobar")
public ResponseEntity<ResponseDTO> aprobarCita(@PathVariable Integer idCita) {
    try {
        // IMPORTANTE: Obtener ID del admin autenticado desde el token/sesión
        Integer idAdmin = obtenerIdUsuarioAutenticado(); // Implementar según tu sistema de auth

        citasService.aprobarCita(idCita, idAdmin);

        return ResponseEntity.ok(ResponseDTO.builder()
                .status("success")
                .message("Cita aprobada exitosamente")
                .build());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status("error")
                .message("Error al aprobar cita: " + e.getMessage())
                .build());
    }
}

/**
 * Rechazar una cita (ADMIN)
 * PUT /api/citas/{idCita}/rechazar
 */
@PutMapping("/citas/{idCita}/rechazar")
public ResponseEntity<ResponseDTO> rechazarCita(
        @PathVariable Integer idCita,
        @RequestBody RechazoCitaDTO rechazoDTO) {
    try {
        citasService.rechazarCita(idCita, rechazoDTO.getRazonRechazo());

        return ResponseEntity.ok(ResponseDTO.builder()
                .status("success")
                .message("Cita rechazada")
                .build());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status("error")
                .message("Error al rechazar cita: " + e.getMessage())
                .build());
    }
}
```

---

## 🔧 Lógica de Negocio (Services)

### `NotificacionesService.java`

```java
@Service
public class NotificacionesService {

    @Autowired
    private NotificacionesRepository notificacionesRepository;

    /**
     * Crear notificación para un usuario
     */
    public Notificacion crear(Integer idUsuario, String tipo, String titulo, String mensaje, Integer idCita) {
        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuario(idUsuario);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setIdCita(idCita);
        notificacion.setLeida(false);

        return notificacionesRepository.save(notificacion);
    }

    /**
     * Obtener notificaciones de un usuario (ordenadas por fecha DESC)
     */
    public List<Notificacion> getByUsuario(Integer idUsuario) {
        return notificacionesRepository.findByIdUsuarioOrderByFechaCreacionDesc(idUsuario);
    }

    /**
     * Contar notificaciones no leídas
     */
    public Long contarNoLeidas(Integer idUsuario) {
        return notificacionesRepository.countByIdUsuarioAndLeida(idUsuario, false);
    }

    /**
     * Marcar como leída
     */
    public void marcarComoLeida(Integer idNotificacion) {
        Notificacion notificacion = notificacionesRepository.findById(idNotificacion)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);
        notificacionesRepository.save(notificacion);
    }

    /**
     * Eliminar notificación
     */
    public void eliminar(Integer idNotificacion) {
        notificacionesRepository.deleteById(idNotificacion);
    }
}
```

### Modificar `CitasService.java`

Agregar estos métodos:

```java
@Autowired
private NotificacionesService notificacionesService;

@Autowired
private UsuarioRepository usuarioRepository;

/**
 * MODIFICAR método crear() existente para:
 * 1. Guardar estado = PENDIENTE
 * 2. Guardar respuestas_formulario
 * 3. Crear notificaciones para TODOS los admins
 */
public Cita crear(CitaDTO citaDTO) {
    Cita cita = new Cita();
    // ... mapear campos existentes ...

    cita.setEstado("PENDIENTE"); // NUEVO
    cita.setRespuestasFormulario(citaDTO.getRespuestasFormulario()); // NUEVO (JSON)

    Cita citaGuardada = citasRepository.save(cita);

    // NUEVO: Crear notificaciones para TODOS los administradores
    List<Usuario> admins = usuarioRepository.findByIdRol(1); // 1 = ADMIN
    for (Usuario admin : admins) {
        notificacionesService.crear(
            admin.getIdUsuario(),
            "CITA_PENDIENTE",
            "Nueva cita pendiente de aprobación",
            "El cliente " + cita.getUsuario().getNombre() + " ha solicitado una cita para el servicio " + cita.getServicio().getNombre(),
            citaGuardada.getIdCita()
        );
    }

    return citaGuardada;
}

/**
 * Obtener citas pendientes
 */
public List<Cita> getCitasPendientes() {
    return citasRepository.findByEstado("PENDIENTE");
}

/**
 * Aprobar cita
 */
@Transactional
public void aprobarCita(Integer idCita, Integer idAdmin) {
    Cita cita = citasRepository.findById(idCita)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

    cita.setEstado("APROBADA");
    cita.setFechaAprobacion(LocalDateTime.now());
    cita.setAprobadaPor(idAdmin);
    citasRepository.save(cita);

    // Crear notificación para el cliente
    notificacionesService.crear(
        cita.getIdUsuario(),
        "CITA_APROBADA",
        "¡Cita confirmada!",
        "Tu cita para " + cita.getServicio().getNombre() + " el " +
        cita.getFecha() + " a las " + cita.getHora() + " ha sido confirmada.",
        cita.getIdCita()
    );

    // AQUÍ EL FRONTEND DEBE ENVIAR EL EMAIL
    // Ya que EmailJS está en el frontend
}

/**
 * Rechazar cita
 */
@Transactional
public void rechazarCita(Integer idCita, String razonRechazo) {
    Cita cita = citasRepository.findById(idCita)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

    cita.setEstado("RECHAZADA");
    cita.setRazonRechazo(razonRechazo);
    citasRepository.save(cita);

    // Crear notificación para el cliente
    notificacionesService.crear(
        cita.getIdUsuario(),
        "CITA_RECHAZADA",
        "Cita no aprobada",
        "Tu cita no pudo ser aprobada. Razón: " + razonRechazo,
        cita.getIdCita()
    );
}
```

---

## 📁 Archivos Creados/Modificados en el Frontend

### ✅ Archivos Nuevos Creados:

1. **`/services/notificaciones.service.js`** - Servicio para gestionar notificaciones
2. **`/services/preguntas-formulario.service.js`** - Servicio para gestionar preguntas de formularios
3. **`/services/email.service.js`** - Servicio para envío de emails con EmailJS
4. **`/html/modals/formulario_cita.html`** - Modal con formulario personalizado
5. **`/Css/modals/formulario_cita.css`** - Estilos del modal de formulario
6. **`EMAILJS_SETUP.md`** - Guía de configuración de EmailJS
7. **`SISTEMA_APROBACION_CITAS.md`** - Este documento

### ✏️ Archivos Modificados:

1. **`/services/citas.service.js`** - Agregados métodos `aprobar()`, `rechazar()`, `getPendientes()`
2. **`/services/notificaciones.service.js`** - Actualizado con nuevos métodos
3. **`/html/header_footer.html`** - Agregado badge de notificaciones
4. **`/Css/header_footer.css`** - Estilos para badge de notificaciones
5. **`/js/header_footer.js`** - Lógica de notificaciones y badge
6. **`/html/modals/notificaciones.html`** - Rediseñado modal de notificaciones
7. **`/Css/modals/notificacion.css`** - Nuevos estilos para notificaciones
8. **`/html/agendar.html`** - Agregados scripts y placeholders
9. **`/js/agendar.js`** - Agregadas funciones para formulario personalizado
10. **`/html/inicio.html`** - Agregado script de notificaciones

---

## 🚀 Pasos Siguientes (PENDIENTES)

### En el Frontend (JavaScript):

1. **Modificar lógica del botón "Confirmar" en agendar.js**:
   - Detectar cuando usuario hace click en "Confirmar"
   - Cargar preguntas del servicio seleccionado
   - Mostrar modal de formulario
   - Al enviar formulario → crear cita con respuestas

2. **Remover envío automático de email al crear cita**:
   - El email ahora solo se envía cuando admin APRUEBA
   - Actualizar agendar.js para no enviar email al crear

3. **Implementar polling o WebSockets para notificaciones en tiempo real**:
   - Actualizar contador cada 30 segundos (ya implementado)
   - Opcional: WebSockets para notificaciones instantáneas

### En el Backend (Java/Spring Boot):

1. **Crear todas las tablas SQL** (ejecutar scripts DDL)
2. **Crear entidades JPA**:
   - `Notificacion.java`
   - `PreguntaFormulario.java`
3. **Crear repositorios**:
   - `NotificacionesRepository.java`
   - `PreguntasFormularioRepository.java`
4. **Crear servicios**:
   - `NotificacionesService.java`
   - `PreguntasFormularioService.java`
5. **Crear controladores**:
   - `NotificacionesController.java`
   - `PreguntasFormularioController.java`
6. **Modificar `CitasService.java`** y **`CitasController.java`**

### En el Panel Admin:

1. **Crear vista de gestión de formularios** (`formularios_admin.html`):
   - CRUD de preguntas por servicio
   - Reordenar preguntas (drag & drop)
   - Vista previa del formulario

2. **Crear vista de citas pendientes**:
   - Lista de citas con estado PENDIENTE
   - Botones Aprobar/Rechazar
   - Modal para ver respuestas del formulario
   - Al aprobar → trigger envío de email en frontend

---

## 📊 Diagrama de Flujo de Datos

```
┌─────────────┐
│   CLIENTE   │
└──────┬──────┘
       │ 1. Selecciona servicio/fecha/hora
       │
       ▼
┌─────────────────────────────┐
│  GET /servicios/{id}/       │
│      preguntas              │  ← Obtiene formulario personalizado
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Usuario completa           │
│  formulario                 │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  POST /citas                │
│  {                          │
│    ...datos cita...         │
│    estado: "PENDIENTE"      │
│    respuestas_formulario:   │
│      [{...}]                │
│  }                          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Backend crea               │
│  notificaciones para        │
│  TODOS los admins           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│   ADMIN Dashboard           │
│   - Ve cita pendiente       │
│   - Lee respuestas          │
│   - Decide: Aprobar/Rechazar│
└─────────────┬───────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
 ┌─────────┐   ┌──────────┐
 │ APROBAR │   │ RECHAZAR │
 └────┬────┘   └─────┬────┘
      │              │
      ▼              ▼
PUT /citas/      PUT /citas/
  {id}/aprobar    {id}/rechazar
      │              │
      ▼              ▼
Backend crea    Backend crea
notificación    notificación
"APROBADA"      "RECHAZADA"
      │              │
      ▼              ▼
Frontend        NO se envía
envía EMAIL     email
📧
```

---

## ✅ Checklist de Implementación

### Backend:
- [ ] Crear tabla `notificaciones`
- [ ] Crear tabla `preguntas_formulario`
- [ ] Modificar tabla `citas` (agregar columnas)
- [ ] Crear entidad `Notificacion.java`
- [ ] Crear entidad `PreguntaFormulario.java`
- [ ] Crear `NotificacionesRepository.java`
- [ ] Crear `PreguntasFormularioRepository.java`
- [ ] Crear `NotificacionesService.java`
- [ ] Crear `PreguntasFormularioService.java`
- [ ] Crear `NotificacionesController.java`
- [ ] Crear `PreguntasFormularioController.java`
- [ ] Modificar `CitasService.crear()` para estado PENDIENTE
- [ ] Agregar `CitasService.aprobarCita()`
- [ ] Agregar `CitasService.rechazarCita()`
- [ ] Agregar `CitasService.getCitasPendientes()`
- [ ] Agregar endpoints en `CitasController.java`
- [ ] Probar todos los endpoints con Postman

### Frontend (Cliente):
- [✅] Crear `notificaciones.service.js`
- [✅] Crear `preguntas-formulario.service.js`
- [✅] Crear `email.service.js`
- [✅] Modificar `citas.service.js`
- [✅] Crear modal `formulario_cita.html`
- [✅] Crear estilos `formulario_cita.css`
- [✅] Actualizar header con badge de notificaciones
- [✅] Actualizar modal de notificaciones
- [✅] Actualizar `js/header_footer.js` con lógica de notificaciones
- [ ] Modificar botón "Confirmar" en `agendar.js`
- [ ] Cargar y mostrar formulario personalizado
- [ ] Enviar respuestas al crear cita
- [ ] Remover envío automático de email
- [ ] Configurar EmailJS (credenciales ya agregadas)

### Frontend (Admin):
- [ ] Crear vista `formularios_admin.html`
- [ ] Implementar CRUD de preguntas
- [ ] Crear vista de citas pendientes
- [ ] Implementar botones Aprobar/Rechazar
- [ ] Mostrar respuestas del formulario en modal
- [ ] Trigger envío de email al aprobar

---

## 🎉 Resultado Final

Cuando todo esté implementado:

1. **Usuario agenda cita** → Completa formulario personalizado → Cita queda PENDIENTE
2. **Admin recibe notificación** con badge en campana 🔔
3. **Admin revisa** respuestas del formulario
4. **Admin aprueba** → Usuario recibe notificación + email de confirmación 📧
5. **Admin rechaza** → Usuario recibe notificación con razón

**El sistema es escalable, profesional y da control total al administrador sobre las citas.**

---

## 📞 Soporte

Si necesitas ayuda con la implementación:
1. Revisa este documento completo
2. Verifica que todos los endpoints estén creados
3. Prueba cada endpoint individualmente
4. Verifica logs del backend y consola del frontend

¡Buena suerte con la implementación! 🚀
