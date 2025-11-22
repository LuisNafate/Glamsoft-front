# Guía de Endpoints y JSONs de la API GlamSoftt

Esta guía detalla los endpoints disponibles en la API, sus métodos HTTP, una breve descripción de su funcionalidad y ejemplos de los cuerpos de solicitud (JSON) necesarios para las operaciones de creación y actualización.

---

### **1. Módulo de Valoraciones (`ValoracionRouter`)**

**Modelo:** `Valoracion.java`
```java
public class Valoracion {
    private int idValoracion;
    private BigDecimal puntuacion;
    private String comentario;
    private int idCita;
    private int  idCliente;
    private int idServicio;
    // ... getters y setters
}
```

*   **POST /api/valoraciones** (Crear Valoración)
    *   **Descripción:** Crea una nueva valoración.
    ```json
    {
        "puntuacion": 4.5,
        "comentario": "Excelente servicio y atención. Muy recomendado.",
        "idCita": 101,
        "idCliente": 5,
        "idServicio": 20
    }
    ```
*   **PUT /api/valoraciones/{id}** (Actualizar Valoración)
    *   **Descripción:** Actualiza la información de una valoración existente.
    ```json
    {
        "puntuacion": 5.0,
        "comentario": "Servicio impecable, superó mis expectativas.",
        "idCita": 101,
        "idCliente": 5,
        "idServicio": 20
    }
    ```
*   **GET /api/valoraciones**
    *   **Descripción:** Obtiene una lista de todas las valoraciones existentes en el sistema.
*   **GET /api/valoraciones/{id}**
    *   **Descripción:** Recupera los detalles de una valoración específica utilizando su `id`.
*   **DELETE /api/valoraciones/{id}**
    *   **Descripción:** Elimina una valoración del sistema utilizando su `id`.

---

### **2. Módulo de Servicios (`ServicioRouter`)**

**Modelo:** `Servicio.java`
```java
public class Servicio {
    private int idServicio;
    private String imagenURL;
    private String nombre;
    private int duracionMinutos;
    private double precio;
    private String descripcion;
    private int categoria;
    private Integer idFormulario;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/servicios** (Crear Servicio)
    *   **Descripción:** Crea un nuevo servicio.
    ```json
    {
        "imagenURL": "https://ejemplo.com/imagen_corte.jpg",
        "nombreServicio": "Corte de Cabello Masculino",
        "duracionMinutos": 45,
        "precio": 25.00,
        "descripcion": "Corte moderno con lavado y peinado.",
        "idCategoria": 1,
        "idFormulario": null,
        "activo": true
    }
    ```
*   **PUT /api/servicios/{id}** (Actualizar Servicio)
    *   **Descripción:** Actualiza la información de un servicio existente.
    ```json
    {
        "imagenURL": "https://ejemplo.com/imagen_corte_actualizado.jpg",
        "nombreServicio": "Corte y Barba",
        "duracionMinutos": 60,
        "precio": 35.00,
        "descripcion": "Corte de cabello y arreglo de barba con productos premium.",
        "idCategoria": 1,
        "idFormulario": null,
        "activo": true
    }
    ```
*   **GET /api/servicios**
    *   **Descripción:** Obtiene una lista de todos los servicios disponibles.
*   **GET /api/servicios/{id}**
    *   **Descripción:** Recupera los detalles de un servicio específico utilizando su `id`.
*   **DELETE /api/servicios/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un servicio del sistema utilizando su `id`.

---

### **3. Módulo de Estilistas (`EstilistaRouter`)**

**Modelo:** `Estilista.java` (Extiende de `Empleado`, que extiende de `Usuario`)
```java
public class Estilista extends Empleado {
    private int idHorario;
    // ... getters y setters
}

public class Empleado extends Usuario {
    private int idEmpleado;
    private String puesto;
    private String imagenPerfil;
    // ... getters y setters
}

public class Usuario {
    private int idUsuario;
    private String nombre;
    private String email;
    private String telefono;
    private String password;
    private int idRol;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/estilistas** (Crear Estilista)
    *   **Descripción:** Crea un nuevo registro de estilista.
    ```json
    {
        "nombre": "Ana García",
        "email": "ana.garcia@glamsoft.com",
        "telefono": "555-1234",
        "password": "passwordSeguro123",
        "idRol": 2,
        "activo": true,
        "puesto": "Estilista Senior",
        "imagenPerfil": "https://ejemplo.com/perfil_ana.jpg",
        "idHorario": 1
    }
    ```
*   **PUT /api/estilistas/{id}** (Actualizar Estilista)
    *   **Descripción:** Actualiza la información de un estilista existente.
    ```json
    {
        "nombre": "Ana Sofía García",
        "email": "ana.sofia.garcia@glamsoft.com",
        "telefono": "555-5678",
        "password": "nuevaPasswordSegura",
        "idRol": 2,
        "activo": true,
        "puesto": "Estilista Principal",
        "imagenPerfil": "https://ejemplo.com/perfil_ana_actualizado.jpg",
        "idHorario": 2
    }
    ```
*   **POST /api/estilistas/servicio/{idServicio}** (Asociar servicio a estilista)
    *   **Descripción:** Encuentra estilistas disponibles que ofrecen un servicio específico.
    ```json
    {}
    ```
    *(Nota: El controlador toma `idServicio` del path. El cuerpo de la solicitud no se usa explícitamente para datos adicionales en el controlador actual.)*
*   **GET /api/estilistas**
    *   **Descripción:** Obtiene una lista de todos los estilistas registrados.
*   **GET /api/estilistas/{id}**
    *   **Descripción:** Recupera los detalles de un estilista específico utilizando su `id`.
*   **DELETE /api/estilistas/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un estilista del sistema utilizando su `id`.

---

### **4. Módulo de Comentarios (`ComentarioRouter`)**

**Modelo:** `Comentario.java`
```java
package org.pi.Models;

import java.time.LocalDateTime;

public class Comentario {
    private int idComentario;
    private String comentario;
    private LocalDateTime fechaComentario;
    private int idCita;
    private int idCliente;
    private String emailCliente;
    // ... getters y setters
}
```

*   **POST /api/comentarios** (Crear Comentario)
    *   **Descripción:** Crea un nuevo comentario.
    ```json
    {
        "comentario": "El servicio de corte fue excelente, muy profesional.",
        "idCita": 105,
        "idCliente": 8
        // idComentario y fechaComentario son generados por el sistema
        // emailCliente podría ser derivado del idCliente o del usuario autenticado
    }
    ```
*   **PUT /api/comentarios/{id}** (Actualizar Comentario)
    *   **Descripción:** Actualiza la información de un comentario existente.
    ```json
    {
        "comentario": "El servicio de corte fue excelente, muy profesional y rápido.",
        "idCita": 105,
        "idCliente": 8
        // idComentario se toma del path, fechaComentario no suele actualizarse por el cliente
    }
    ```
*   **GET /api/comentarios**
    *   **Descripción:** Obtiene todos los comentarios.
*   **GET /api/comentarios/{id}**
    *   **Descripción:** Obtiene un comentario por su ID.
*   **DELETE /api/comentarios/{id}**
    *   **Descripción:** Elimina un comentario por su ID.
*   **GET /api/comentarios/cliente/{idCliente}**
    *   **Descripción:** Obtiene los comentarios de un cliente específico.

---

### **5. Módulo de Promociones (`PromocionRouter`)**

**Modelo:** `Promocion.java`
```java
package org.pi.Models;
import java.time.LocalDate;

public class Promocion {
    private int idPromocion;
    private String nombrePromocion;
    private String tipoDescuento; // Ej: "PORCENTAJE", "MONTO_FIJO"
    private double descuento;     // El valor del porcentaje o monto
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private int idServicio; // Si la promoción es para un solo servicio
    // ... getters y setters
}
```

*   **POST /api/promociones** (Crear Promoción)
    *   **Descripción:** Crea una nueva promoción.
    ```json
    {
        "nombrePromocion": "Descuento Verano",
        "tipoDescuento": "PORCENTAJE",
        "descuento": 15.0, // 15% de descuento
        "fechaInicio": "2024-06-01",
        "fechaFin": "2024-08-31",
        "idServicio": 20 // O null si es una promoción general
    }
    ```
*   **PUT /api/promociones/{id}** (Actualizar Promoción)
    *   **Descripción:** Actualiza la información de una promoción existente.
    ```json
    {
        "nombrePromocion": "Descuento Verano Extendido",
        "tipoDescuento": "PORCENTAJE",
        "descuento": 10.0,
        "fechaInicio": "2024-06-01",
        "fechaFin": "2024-09-30",
        "idServicio": null
    }
    ```
*   **POST /api/promociones/{id}/servicios** (Agregar Servicio a Promoción)
    *   **Descripción:** Agrega un servicio a una promoción existente.
    ```json
    {
        "idServicio": 25
    }
    ```
*   **GET /api/promociones**
    *   **Descripción:** Obtiene todas las promociones activas.
*   **GET /api/promociones/{id}**
    *   **Descripción:** Obtiene una promoción por su ID.
*   **DELETE /api/promociones/{id}**
    *   **Descripción:** Elimina una promoción por su ID.
*   **GET /api/promociones/{id}/servicios**
    *   **Descripción:** Obtiene la lista de servicios asociados a una promoción específica.

---

### **6. Módulo de Preguntas (`PreguntaRouter`)**

**Modelo:** `Pregunta.java`
```java
package org.pi.Models;

public class Pregunta {
    private int idPregunta;
    private String pregunta;
    private String respuesta;
    private String categoria; // Mapeado desde 'tipo' en la DB
    private boolean activo;
    private int idFormulario;
    // ... getters y setters
}
```

*   **POST /api/preguntas** (Crear Pregunta)
    *   **Descripción:** Crea una nueva pregunta.
    ```json
    {
        "pregunta": "¿Cuál es la política de cancelación?",
        "respuesta": "Las cancelaciones deben realizarse con 24 horas de anticipación.",
        "categoria": "General",
        "activo": true,
        "idFormulario": 1 // Si aplica a un formulario específico, de lo contrario null o 0
    }
    ```
*   **PUT /api/preguntas/{id}** (Actualizar Pregunta)
    *   **Descripción:** Actualiza la información de una pregunta existente.
    ```json
    {
        "pregunta": "¿Cuál es la política de cancelación de citas?",
        "respuesta": "Las cancelaciones deben realizarse con al menos 24 horas de anticipación para evitar cargos.",
        "categoria": "Citas",
        "activo": true,
        "idFormulario": 1
    }
    ```
*   **GET /api/preguntas**
    *   **Descripción:** Obtiene una lista de todas las preguntas frecuentes o de formulario.
*   **GET /api/preguntas/{id}**
    *   **Descripción:** Recupera los detalles de una pregunta específica utilizando su `id`.
*   **DELETE /api/preguntas/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) una pregunta del sistema utilizando su `id`.

---

### **7. Módulo de Empleados (`EmpleadoRouter`)**

**Modelo:** `Empleado.java` (Extiende de `Usuario`)
```java
public class Empleado extends Usuario {
    private int idEmpleado;
    private String puesto;
    private String imagenPerfil;
    // ... getters y setters
}

public class Usuario {
    private int idUsuario;
    private String nombre;
    private String email;
    private String telefono;
    private String password;
    private int idRol;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/empleados** (Crear Empleado)
    *   **Descripción:** Crea un nuevo registro de empleado.
    ```json
    {
        "nombre": "Carlos Pérez",
        "email": "carlos.perez@glamsoft.com",
        "telefono": "555-9876",
        "password": "empleadoSeguro456",
        "idRol": 3, // Rol de Empleado (no estilista)
        "activo": true,
        "puesto": "Recepcionista",
        "imagenPerfil": "https://ejemplo.com/perfil_carlos.jpg"
    }
    ```
*   **PUT /api/empleados/{id}** (Actualizar Empleado)
    *   **Descripción:** Actualiza la información de un empleado existente.
    ```json
    {
        "nombre": "Carlos David Pérez",
        "email": "carlos.david.perez@glamsoft.com",
        "telefono": "555-1122",
        "password": "nuevaPassEmpleado",
        "idRol": 3,
        "activo": true,
        "puesto": "Gerente de Sucursal",
        "imagenPerfil": "https://ejemplo.com/perfil_carlos_actualizado.jpg"
    }
    ```
*   **GET /api/empleados**
    *   **Descripción:** Obtiene una lista de todos los empleados (incluyendo estilistas, administradores, etc.).
*   **GET /api/empleados/{id}**
    *   **Descripción:** Recupera los detalles de un empleado específico utilizando su `id`.
*   **DELETE /api/empleados/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un empleado del sistema utilizando su `id`.

---

### **8. Módulo de Horarios (`HorarioRouter`)**

**Modelo:** `Horario.java`
```java
package org.pi.Models;
import java.time.LocalTime;

public class Horario {
    private int idHorario;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String diaSemana; // Ej: "LUNES", "MARTES"
    // ... getters y setters
}
```

*   **POST /api/horarios** (Crear Horario)
    *   **Descripción:** Crea un nuevo horario.
    ```json
    {
        "horaInicio": "09:00:00",
        "horaFin": "18:00:00",
        "diaSemana": "LUNES"
    }
    ```
*   **PUT /api/horarios/{id}** (Actualizar Horario)
    *   **Descripción:** Actualiza la información de un horario existente.
    ```json
    {
        "horaInicio": "10:00:00",
        "horaFin": "19:00:00",
        "diaSemana": "LUNES"
    }
    ```
*   **GET /api/horarios**
    *   **Descripción:** Obtiene una lista de todos los horarios disponibles.
*   **GET /api/horarios/{id}**
    *   **Descripción:** Recupera los detalles de un horario específico utilizando su `id`.
*   **DELETE /api/horarios/{id}**
    *   **Descripción:** Elimina un horario del sistema utilizando su `id`.

---

### **9. Módulo de Portafolio (`PortafolioRouter`)**

**Modelo:** `Portafolio.java`
```java
package org.pi.Models;

import java.time.LocalDateTime;

public class Portafolio {
    private int idImagen;
    private String titulo;
    private String url; // URL de la imagen
    private String descripcion;
    private LocalDateTime fechaSubida;
    private int idEstilista;
    private Integer idCategoria; // Puede ser null
    private boolean destacado;
    // ... getters y setters
}
```

*   **POST /api/portafolio** (Crear Entrada de Portafolio)
    *   **Descripción:** Crea una nueva entrada en el portafolio.
    ```json
    {
        "titulo": "Peinado de Novia Clásico",
        "url": "https://ejemplo.com/portafolio/novia_clasico.jpg",
        "descripcion": "Peinado elegante para boda con recogido bajo.",
        "idEstilista": 1,
        "idCategoria": 5, // ID de la categoría de peinados
        "destacado": true
        // fechaSubida se genera automáticamente en el backend
    }
    ```
*   **PUT /api/portafolio/{id}** (Actualizar Entrada de Portafolio)
    *   **Descripción:** Actualiza la información de una entrada del portafolio existente.
    ```json
    {
        "titulo": "Peinado de Novia Moderno",
        "url": "https://ejemplo.com/portafolio/novia_moderno.jpg",
        "descripcion": "Recogido alto con trenzas y accesorios florales.",
        "idEstilista": 1,
        "idCategoria": 5,
        "destacado": false
    }
    ```
*   **GET /api/portafolio**
    *   **Descripción:** Obtiene una lista de todas las entradas del portafolio (imágenes de trabajos realizados).
*   **GET /api/portafolio/{id}**
    *   **Descripción:** Recupera los detalles de una entrada específica del portafolio utilizando su `id`.
*   **DELETE /api/portafolio/{id}**
    *   **Descripción:** Elimina una entrada del portafolio del sistema utilizando su `id`.

---

### **10. Módulo de Roles (`RolRouter`)**

**Modelo:** `Rol.java`
```java
package org.pi.Models;

public class Rol {
    private int idRol;
    private String nombreRol;
    private String descripcion;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/roles** (Crear Rol)
    *   **Descripción:** Crea un nuevo rol.
    ```json
    {
        "nombreRol": "Administrador",
        "descripcion": "Acceso total al sistema.",
        "activo": true
    }
    ```
*   **PUT /api/roles/{id}** (Actualizar Rol)
    *   **Descripción:** Actualiza la información de un rol existente.
    ```json
    {
        "nombreRol": "Administrador de Contenido",
        "descripcion": "Gestiona promociones y portafolio.",
        "activo": true
    }
    ```
*   **GET /api/roles**
    *   **Descripción:** Obtiene una lista de todos los roles de usuario definidos en el sistema.
*   **GET /api/roles/{id}**
    *   **Descripción:** Recupera los detalles de un rol específico utilizando su `id`.
*   **DELETE /api/roles/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un rol del sistema utilizando su `id`.

---

### **11. Módulo de Formularios (`FormularioRouter`)**

**Modelo:** `Formulario.java`
```java
package org.pi.Models;

public class Formulario {
    private int idFormulario;
    private String nombreFormulario;
    private String descripcion;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/formularios** (Crear Formulario)
    *   **Descripción:** Crea un nuevo formulario.
    ```json
    {
        "nombreFormulario": "Encuesta de Satisfacción",
        "descripcion": "Formulario para recopilar feedback de los clientes.",
        "activo": true
    }
    ```
*   **PUT /api/formularios/{id}** (Actualizar Formulario)
    *   **Descripción:** Actualiza la información de un formulario existente.
    ```json
    {
        "nombreFormulario": "Encuesta Post-Servicio",
        "descripcion": "Formulario detallado para evaluar la experiencia del cliente después de un servicio.",
        "activo": true
    }
    ```
*   **GET /api/formularios**
    *   **Descripción:** Obtiene una lista de todos los formularios definidos.
*   **GET /api/formularios/{id}**
    *   **Descripción:** Recupera los detalles de un formulario específico utilizando su `id`.
*   **DELETE /api/formularios/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un formulario del sistema utilizando su `id`.

---

### **12. Módulo de Usuarios (`UsuarioRouter`)**

**Modelo:** `Usuario.java`
```java
public class Usuario {
    private int idUsuario;
    private String nombre;
    private String email;
    private String telefono;
    private String password;
    private int idRol;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/register** (Registrar Usuario)
    *   **Descripción:** Registra un nuevo usuario en el sistema.
    ```json
    {
        "nombre": "Laura Martínez",
        "email": "laura.martinez@example.com",
        "telefono": "555-3333",
        "password": "miPasswordSeguro123",
        "idRol": 1, // Rol de Cliente
        "activo": true
    }
    ```
*   **POST /api/login** (Iniciar Sesión)
    *   **Descripción:** Autentica a un usuario.
    ```json
    {
        "email": "laura.martinez@example.com",
        "password": "miPasswordSeguro123"
    }
    ```
*   **PUT /api/usuarios/{id}** (Actualizar Usuario)
    *   **Descripción:** Actualiza la información de un usuario existente.
    ```json
    {
        "nombre": "Laura Sofía Martínez",
        "email": "laura.sofia.martinez@example.com",
        "telefono": "555-4444",
        "password": "nuevaPasswordLaura",
        "idRol": 1,
        "activo": true
    }
    ```
*   **GET /api/usuarios/{id}**
    *   **Descripción:** Obtiene los detalles de un usuario específico utilizando su `id`.
*   **DELETE /api/usuarios/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) un usuario del sistema utilizando su `id`.

---

### **13. Módulo de Citas (`CitaRouter`)**

**Modelo:** `Cita.java`
```java
package org.pi.Models;
import java.time.LocalDateTime;
import java.util.List;

public class Cita {
    private int idCita;
    private String estadoCita;
    private LocalDateTime fechaHoraCita;
    private LocalDateTime fechaSolicitudCita; // Se genera en el backend
    private String notas;
    private int idCliente;
    private int idEstilista;
    private int idHorario; // Podría ser el ID de un horario específico del estilista
    private List<Integer> servicios; // Lista de IDs de servicios
    // ... getters y setters
}
```

*   **POST /api/citas** (Crear Cita)
    *   **Descripción:** Crea una nueva cita.
    ```json
    {
        "fecha": "2024-07-15",
        "hora": "10:30:00",
        "notas": "Cliente prefiere productos orgánicos.",
        "idCliente": 1,
        "idEstilista": 1,
        "idHorario": 3, // ID de un horario disponible
        "servicios": [20, 21] // IDs de los servicios solicitados
    }
    ```
*   **PUT /api/citas/{id}** (Actualizar Cita)
    *   **Descripción:** Actualiza la información de una cita existente.
    ```json
    {
        "fecha": "2024-07-16",
        "hora": "11:00:00",
        "notas": "Cliente prefiere productos orgánicos. Confirmar alergias.",
        "idEstilista": 2,
        "idHorario": 5,
        "servicios": [20]
    }
    ```
*   **PUT /api/citas/{id}/estado** (Actualizar Estado de Cita)
    *   **Descripción:** Actualiza únicamente el estado de una cita específica.
    ```json
    {
        "estado": "CONFIRMADA"
    }
    ```
*   **GET /api/citas**
    *   **Descripción:** Obtiene una lista de todas las citas. Puede filtrar por `estado` y `fecha` usando parámetros de consulta.
*   **GET /api/citas/{id}**
    *   **Descripción:** Recupera los detalles completos de una cita específica utilizando su `id`.
*   **DELETE /api/citas/{id}**
    *   **Descripción:** Elimina una cita del sistema utilizando su `id`.
*   **GET /api/citas/cliente/{idCliente}**
    *   **Descripción:** Obtiene todas las citas asociadas a un cliente específico.
*   **GET /api/citas/estilista/{idEstilista}**
    *   **Descripción:** Obtiene todas las citas asignadas a un estilista específico.
*   **GET /api/citas/mes/{mes}/{year}**
    *   **Descripción:** Obtiene todas las citas programadas para un mes y año específicos.

---

### **14. Módulo de Categorías (`CategoriaRouter`)**

**Modelo:** `Categoria.java`
```java
package org.pi.Models;

public class Categoria {
    private int idCategoria;
    private String nombreCategoria;
    private String descripcion;
    private boolean activo;
    // ... getters y setters
}
```

*   **POST /api/categorias** (Crear Categoría)
    *   **Descripción:** Crea una nueva categoría.
    ```json
    {
        "nombreCategoria": "Cortes de Cabello",
        "descripcion": "Categoría para todos los tipos de cortes de cabello.",
        "activo": true
    }
    ```
*   **PUT /api/categorias/{id}** (Actualizar Categoría)
    *   **Descripción:** Actualiza la información de una categoría existente.
    ```json
    {
        "nombreCategoria": "Cortes y Peinados",
        "descripcion": "Categoría para cortes, peinados y tratamientos capilares.",
        "activo": true
    }
    ```
*   **GET /api/categorias**
    *   **Descripción:** Obtiene una lista de todas las categorías de servicios.
*   **GET /api/categorias/{id}**
    *   **Descripción:** Recupera los detalles de una categoría específica utilizando su `id`.
*   **DELETE /api/categorias/{id}**
    *   **Descripción:** Elimina (o desactiva lógicamente) una categoría del sistema utilizando su `id`.
