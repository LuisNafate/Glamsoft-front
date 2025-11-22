// ================== CONFIGURACIÓN DE LA API ==================

const API_CONFIG = {
    // URL base de tu API (cambiar según el entorno)
    BASE_URL: 'https://api.tu-dominio.com/api/v1',
    
    // Endpoints de la API
    ENDPOINTS: {
        // Autenticación
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh',
            VERIFY_TOKEN: '/auth/verify'
        },
        
        // Servicios
        SERVICIOS: {
            GET_ALL: '/servicios',
            GET_BY_ID: '/servicios/:id',
            CREATE: '/servicios',
            UPDATE: '/servicios/:id',
            DELETE: '/servicios/:id',
            GET_BY_CATEGORY: '/servicios/categoria/:categoria'
        },
        
        // Citas
        CITAS: {
            GET_ALL: '/citas',
            GET_BY_USER: '/citas/usuario/:userId',
            GET_BY_ID: '/citas/:id',
            CREATE: '/citas',
            UPDATE: '/citas/:id',
            DELETE: '/citas/:id',
            CONFIRM: '/citas/:id/confirmar',
            CANCEL: '/citas/:id/cancelar',
            GET_DISPONIBILIDAD: '/citas/disponibilidad'
        },
        
        // Usuarios/Perfil
        USUARIOS: {
            GET_PROFILE: '/usuarios/perfil',
            UPDATE_PROFILE: '/usuarios/perfil',
            GET_BY_ID: '/usuarios/:id',
            UPDATE_PASSWORD: '/usuarios/password'
        },
        
        // Estilistas
        ESTILISTAS: {
            GET_ALL: '/estilistas',
            GET_BY_ID: '/estilistas/:id',
            GET_DISPONIBILIDAD: '/estilistas/:id/disponibilidad',
            CREATE: '/estilistas',
            UPDATE: '/estilistas/:id',
            DELETE: '/estilistas/:id'
        },
        
        // Promociones
        PROMOCIONES: {
            GET_ALL: '/promociones',
            GET_ACTIVE: '/promociones/activas',
            GET_BY_ID: '/promociones/:id',
            CREATE: '/promociones',
            UPDATE: '/promociones/:id',
            DELETE: '/promociones/:id'
        },
        
        // Portafolio
        PORTAFOLIO: {
            GET_ALL: '/portafolio',
            GET_BY_ID: '/portafolio/:id',
            GET_DESTACADOS: '/portafolio/destacados',
            GET_CATEGORIAS: '/portafolio/categorias',
            CREATE: '/portafolio',
            UPDATE: '/portafolio/:id',
            DELETE: '/portafolio/:id',
            UPLOAD_IMAGE: '/portafolio/upload'
        },
        
        // Valoraciones
        VALORACIONES: {
            GET_ALL: '/valoraciones',
            GET_BY_SERVICIO: '/valoraciones/servicio/:servicioId',
            GET_BY_USER: '/valoraciones/usuario/:userId',
            CREATE: '/valoraciones',
            UPDATE: '/valoraciones/:id',
            DELETE: '/valoraciones/:id'
        },
        
        // Notificaciones
        NOTIFICACIONES: {
            GET_ALL: '/notificaciones',
            GET_UNREAD: '/notificaciones/no-leidas',
            MARK_AS_READ: '/notificaciones/:id/leido',
            DELETE: '/notificaciones/:id'
        },
        
        // Formularios
        FORMULARIOS: {
            GET_ALL: '/formularios',
            GET_BY_ID: '/formularios/:id',
            SUBMIT: '/formularios/enviar'
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
