// ================== CONFIGURACIÓN DE LA API ==================

const API_CONFIG = {
    // URL base de tu API (cambiar según el entorno)
    BASE_URL: 'http://localhost:7000',
    
    // Endpoints de la API
    ENDPOINTS: {
        // Autenticación
        AUTH: {
            LOGIN: '/api/login',
            REGISTER: '/api/registrar',
            REGISTER_EMPLEADO: '/api/registrarEmpleados',
            GET_USER_BY_EMAIL: '/api/usuarios/:email'
        },
        
        // Servicios
        SERVICIOS: {
            GET_ALL: '/api/servicios',
            CREATE: '/api/servicios',
            UPDATE: '/api/servicios/:id',
            DELETE: '/api/servicios/:id'
        },
        
        // Citas
        CITAS: {
            GET_ALL: '/api/citas',
            CREATE: '/api/citas',
            GET_BY_ID: '/api/citas/:id',
            UPDATE: '/api/citas',
            UPDATE_ESTADO: '/api/actualizarEstado',
            GET_BY_CLIENT: '/api/citasClientes/:id',
            GET_BY_ESTILISTA: '/api/citasEstilista/:id'
        },
        
        // Usuarios/Perfil
        USUARIOS: {
            GET_BY_EMAIL: '/usuarios/:email',
            UPDATE: '/usuarios',
            DELETE: '/usuarios/:id',
            CREATE_EMPLEADO: '/empleados',
            UPDATE_EMPLEADO: '/empleados'
        },
        
        // Estilistas
        ESTILISTAS: {
            GET_ALL: '/api/estilistas',
            GET_BY_ID: '/api/estilistas/:id',
            GET_DISPONIBILIDAD: '/api/estilistaDisponible',
            GET_HORARIOS: '/api/horarios',
            CREATE_HORARIO: '/api/horarios'
        },
        
        // Promociones
        PROMOCIONES: {
            GET_ALL: '/promociones',
            GET_BY_ID: '/promociones/:id',
            GET_SERVICIOS: '/promociones/:id/servicios',
            CREATE: '/promociones',
            CREATE_SERVICIO: '/promociones/:id/servicios',
            UPDATE: '/promociones',
            DELETE: '/promociones/:id'
        },
        
        // Portafolio
        PORTAFOLIO: {
            GET_ALL: '/imagenes',
            GET_DESTACADOS: '/imagenes/inicio',
            CREATE: '/imagenes',
            UPDATE: '/imagenes',
            DELETE: '/imagenes/:id'
        },
        
        // Valoraciones
        VALORACIONES: {
            GET_ALL: '/valoraciones',
            CREATE: '/valoraciones',
            DELETE: '/valoraciones/:id'
        },
        
        // Categorías (NO tienen prefijo /api/)
        CATEGORIAS: {
            GET_ALL: '/categorias',
            CREATE: '/categorias'
        },
        
        // Promociones (NO tienen prefijo /api/)
        PROMOCIONES: {
            GET_ALL: '/promociones',
            CREATE: '/promociones',
            GET_SERVICIOS: '/promociones/:id/servicios'
        },
        
        // Portafolio (NO tienen prefijo /api/)
        PORTAFOLIO: {
            GET_ALL: '/imagenes',
            GET_DESTACADOS: '/imagenes/inicio'
        },
        
        // Roles (NO tienen prefijo /api/)
        ROLES: {
            GET_ALL: '/roles',
            CREATE: '/roles'
        },
        
        // Comentarios (ERROR 500 según doc)
        COMENTARIOS: {
            GET_ALL: '/api/comentarios',
            CREATE: '/api/comentarios'
        }
    },
    
    // Configuración de tiempo de espera
    TIMEOUT: 30000, // 30 segundos
    
    // Headers por defecto
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'auth_token',
        REFRESH_TOKEN_KEY: 'refresh_token',
        USER_KEY: 'user_data',
        TOKEN_PREFIX: 'Bearer'
    },
    
    // Códigos de estado HTTP
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    }
};

// Helper para reemplazar parámetros en URLs
API_CONFIG.buildUrl = function(endpoint, params = {}) {
    // Soporte para notación de punto (ej: 'portafolio.getAll')
    if (endpoint.includes('.')) {
        const [section, method] = endpoint.split('.');
        const sectionUpper = section.toUpperCase();
        const methodUpper = method.replace(/([A-Z])/g, '_$1').toUpperCase();
        
        if (this.ENDPOINTS[sectionUpper] && this.ENDPOINTS[sectionUpper][methodUpper]) {
            endpoint = this.ENDPOINTS[sectionUpper][methodUpper];
        }
    }
    
    let url = this.BASE_URL + endpoint;
    
    // Reemplazar parámetros de ruta (:id, :userId, etc.)
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
};

// Helper para agregar query parameters
API_CONFIG.addQueryParams = function(url, queryParams = {}) {
    const params = new URLSearchParams();
    
    Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== null && queryParams[key] !== undefined) {
            params.append(key, queryParams[key]);
        }
    });
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

// Crear alias global para facilitar el acceso
const ApiConfig = API_CONFIG;
