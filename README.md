# 📚 Documentación del Proyecto - Sistema de Gestión de Salón de Belleza

## 🏗️ Estructura del Proyecto

```
web/
├── config/
│   └── api.config.js           # Configuración de endpoints y constantes de la API
│
├── services/
│   ├── http.service.js         # Servicio HTTP genérico con interceptores
│   ├── auth.service.js         # Servicio de autenticación
│   ├── servicios.service.js    # Servicio de productos/servicios
│   ├── citas.service.js        # Servicio de gestión de citas
│   ├── usuarios.service.js     # Servicio de usuarios/perfil
│   ├── promociones.service.js  # Servicio de promociones
│   ├── valoraciones.service.js # Servicio de valoraciones
│   └── notificaciones.service.js # Servicio de notificaciones
│
├── utils/
│   ├── error-handler.js        # Manejador centralizado de errores
│   └── state-manager.js        # Gestor de estado de la aplicación
│
├── js/                         # Scripts de lógica de negocio
├── Css/                        # Estilos
├── html/                       # Vistas HTML
└── src/                        # Recursos estáticos
```

## 🚀 Configuración Inicial

### 1. Configurar la URL de tu API

Edita el archivo `config/api.config.js`:

```javascript
const API_CONFIG = {
    // Cambiar esta URL por la de tu API real
    BASE_URL: 'https://api.tu-dominio.com/api/v1',
    // ... resto de configuración
};
```

### 2. Incluir Scripts en tus Páginas HTML

El orden de carga de los scripts es IMPORTANTE. Sigue este orden:

```html
<!-- 1. Configuración -->
<script src="config/api.config.js"></script>

<!-- 2. HTTP Service -->
<script src="services/http.service.js"></script>

<!-- 3. Servicios específicos que necesites -->
<script src="services/auth.service.js"></script>
<script src="services/servicios.service.js"></script>
<!-- ... otros servicios ... -->

<!-- 4. Utilidades -->
<script src="utils/error-handler.js"></script>
<script src="utils/state-manager.js"></script>

<!-- 5. Scripts de tu página -->
<script src="js/header_footer.js"></script>
<script src="js/servicios.js"></script>
```

## 📖 Guía de Uso

### Autenticación

```javascript
// Login
try {
    const response = await AuthService.login({
        email: 'usuario@ejemplo.com',
        password: 'contraseña123'
    });
    
    console.log('Login exitoso:', response.user);
    // El token se guarda automáticamente
    
} catch (error) {
    ErrorHandler.showError(error);
}

// Registro
try {
    const response = await AuthService.register({
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        password: 'contraseña123',
        telefono: '1234567890'
    });
    
    console.log('Registro exitoso');
    
} catch (error) {
    ErrorHandler.showError(error);
}

// Logout
await AuthService.logout();

// Verificar si está autenticado
const isAuth = AuthService.isAuthenticated();
```

### Servicios

```javascript
// Obtener todos los servicios
try {
    StateManager.setLoading(true);
    
    const servicios = await ServiciosService.getAll();
    console.log('Servicios:', servicios);
    
    StateManager.setLoading(false);
    
} catch (error) {
    StateManager.setLoading(false);
    ErrorHandler.handle(error, {
        customMessage: 'No se pudieron cargar los servicios',
        showToUser: true
    });
}

// Obtener servicio por ID
const servicio = await ServiciosService.getById(1);

// Crear nuevo servicio
const nuevoServicio = await ServiciosService.create({
    nombre: 'Corte de cabello',
    descripcion: 'Corte profesional',
    precio: 50,
    duracion: '30 minutos'
});
```

### Citas

```javascript
// Crear nueva cita
try {
    const cita = await CitasService.create({
        servicioId: 1,
        estilistaId: 2,
        fecha: '2025-12-01',
        hora: '14:00',
        notas: 'Preferencia por corte moderno'
    });
    
    console.log('Cita creada:', cita);
    
} catch (error) {
    ErrorHandler.showError(error);
}

// Obtener citas del usuario
const user = StateManager.getUser();
const misCitas = await CitasService.getByUser(user.id);

// Cancelar cita
await CitasService.cancel(citaId, 'No puedo asistir');

// Obtener disponibilidad
const disponibilidad = await CitasService.getDisponibilidad({
    fecha: '2025-12-01',
    estilistaId: 2
});
```

### Gestión de Estado

```javascript
// Guardar datos en el estado
StateManager.set('selectedService', servicio);

// Obtener datos del estado
const servicio = StateManager.get('selectedService');

// Suscribirse a cambios
const unsubscribe = StateManager.subscribe('user', (newUser, oldUser) => {
    console.log('Usuario cambió:', newUser);
});

// Desuscribirse
unsubscribe();

// Guardar datos de cita
StateManager.setAppointmentData({
    service: servicio,
    date: '2025-12-01',
    time: '14:00',
    stylist: estilista
});

// Obtener datos de cita
const appointmentData = StateManager.getAppointmentData();

// Limpiar datos de cita
StateManager.clearAppointmentData();

// Mostrar/ocultar loading global
StateManager.setLoading(true);
StateManager.setLoading(false);
```

### Manejo de Errores

```javascript
// Manejar error con mensaje personalizado
try {
    await ServiciosService.getById(999);
} catch (error) {
    ErrorHandler.handle(error, {
        customMessage: 'El servicio no existe',
        showToUser: true
    });
}

// Validar formulario
const formData = {
    nombre: 'Juan',
    email: 'juan@ejemplo.com',
    password: '123'
};

const validationResult = ErrorHandler.validateForm(formData, {
    nombre: {
        required: true,
        minLength: 3,
        label: 'Nombre'
    },
    email: {
        required: true,
        email: true,
        label: 'Email'
    },
    password: {
        required: true,
        minLength: 6,
        label: 'Contraseña'
    }
});

if (!validationResult.isValid) {
    ErrorHandler.showValidationErrors(validationResult.errors);
}
```

## 🔧 Adaptación de Archivos Existentes

### Ejemplo: Adaptar `servicios.js`

```javascript
// ANTES (con mock data)
const servicios = serviciosMock;

// DESPUÉS (con API)
let servicios = [];

async function loadServicios() {
    try {
        StateManager.setLoading(true);
        const response = await ServiciosService.getAll();
        servicios = response.servicios || response;
        renderServicios();
        StateManager.setLoading(false);
    } catch (error) {
        StateManager.setLoading(false);
        ErrorHandler.handle(error, { showToUser: true });
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', loadServicios);
```

## 📝 Estructura de Respuesta de la API

La API debe seguir este formato estándar:

```javascript
// Respuesta exitosa
{
    "status": "success",
    "data": {
        // datos solicitados
    },
    "message": "Operación exitosa"
}

// Respuesta con error
{
    "status": "error",
    "message": "Descripción del error",
    "errors": {
        "campo": "mensaje de error específico"
    }
}
```

## 🎨 Diseños de Figma

Los diseños extraídos del servidor Figma incluyen las siguientes pantallas:

### Vistas Móviles (iPhone 14/15 Pro):
- Inicio
- Portafolio
- Servicios
- Agendar cita
- Login/Registro
- Perfil de usuario
- Historial de citas
- Formularios
- Valoraciones
- Notificaciones

### Vistas Desktop:
- Inicio
- Portafolio
- Editar servicios
- Editar promociones
- Panel administrativo
- Login

## 🔒 Seguridad

- Los tokens se guardan automáticamente en `localStorage`
- Los tokens se incluyen automáticamente en las peticiones mediante interceptores
- Si el token expira (401), se limpia la sesión y se redirige a login
- Nunca guardes contraseñas en `localStorage`

## 🐛 Debugging

```javascript
// Ver el estado completo
console.log('Estado actual:', StateManager.state);

// Ver token guardado
console.log('Token:', localStorage.getItem('auth_token'));

// Ver usuario actual
console.log('Usuario:', StateManager.getUser());

// Verificar autenticación
console.log('¿Autenticado?', StateManager.isAuthenticated());
```

## 🚧 Modo de Desarrollo

Para trabajar sin API backend activa, los servicios tienen datos de respaldo (fallback) que se cargarán automáticamente si la API falla.

## 📞 Contacto y Soporte

Para más información sobre la implementación, consulta los comentarios en cada archivo de servicio.

---

**Última actualización:** Noviembre 2025
