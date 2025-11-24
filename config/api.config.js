// ================== CONFIGURACIÓN DE LA API ==================

const API_CONFIG = {
    // URL base de tu API (cambiar según el entorno)
    BASE_URL: 'http://98.86.212.2:7000/api',
    
    // Endpoints de la API (según routers reales del backend)
    ENDPOINTS: {
        // Autenticación - UsuarioRouter
        AUTH: {
            LOGIN: '/login',
            REGISTER: '/register',
            REGISTER_EMPLEADO: '/empleados',
            GET_USER_BY_EMAIL: '/usuarios/:email'
        },
        
        // Servicios - ServicioRouter
        SERVICIOS: {
            GET_ALL: '/servicios',
            GET_BY_ID: '/servicios/:id',
            GET_BY_CATEGORIA: '/servicios/categorias/:id',
            GET_NOMBRES: '/servicios/nombres',
            CREATE: '/servicios',
            UPDATE: '/servicios/:id',
            DELETE: '/servicios/:id'
        },
        
        // Citas - CitaRouter
        CITAS: {
            GET_ALL: '/citas',
            GET_BY_ID: '/citas/:id',
            GET_BY_CLIENT: '/citas/cliente/:id',
            GET_BY_ESTILISTA: '/citas/estilista/:id',
            GET_BY_MES: '/citas/mes',
            GET_BY_SEMANA: '/citas/semanas',
            GET_BY_DIA: '/citas/dias',
            CREATE: '/citas',
            APROBAR: '/citas/:id/aprobar',
            RECHAZAR: '/citas/:id/rechazar',
            COMPLETAR: '/citas/:id/completar',
            CANCELAR: '/citas/:id/cancelar',
            UPDATE_FECHA: '/citas/fecha',
            DELETE: '/citas/:id'
        },
        
        // Usuarios - UsuarioRouter
        USUARIOS: {
            GET_BY_EMAIL: '/usuarios/:email',
            // ✅ NUEVA RUTA AGREGADA
            GET_BY_TELEFONO: '/usuarios/telefono/:telefono',
            GET_BY_ID: '/usuarios/:id',
            UPDATE: '/usuarios/:id',
            DELETE: '/usuarios/:id',
            UPDATE_EMPLEADO: '/empleados'
        },
        
        // Estilistas - EstilistaRouter
        ESTILISTAS: {
            GET_ALL: '/estilistas',
            GET_BY_ID: '/estilistas/:id',
            GET_HORARIOS: '/estilistas/:id/horarios',
            GET_SERVICIOS: '/estilistas/:id/servicios',
            GET_BY_SERVICIO: '/estilistas/servicios/:id',
            CREATE_HORARIO: '/estilistas/horarios',
            CREATE_SERVICIO: '/estilistas/servicios',
            UPDATE: '/estilistas/:id',
            DELETE: '/estilistas/:id'
        },
        
        // Horarios - HorarioRouter
        HORARIOS: {
            GET_ALL: '/horarios',
            CREATE: '/horarios',
            UPDATE: '/horarios',
            DELETE: '/horarios/:id'
        },
        
        // Promociones - PromocionRouter
        PROMOCIONES: {
            GET_ALL: '/promociones',
            GET_BY_ID: '/promociones/:id',
            GET_SERVICIOS: '/promociones/:id/servicios',
            CREATE: '/promociones',
            CREATE_SERVICIO: '/promociones/:id/servicios',
            UPDATE: '/promociones/:id',
            DELETE: '/promociones/:id'
        },
        
        // Portafolio - PortafolioRouter
        PORTAFOLIO: {
            GET_ALL: '/portafolio',
            GET_DESTACADOS: '/portafolio',
            CREATE: '/portafolio',
            UPDATE: '/portafolio/:id',
            DELETE: '/portafolio/:id'
        },
        
        // Valoraciones - ValoracionRouter
        VALORACIONES: {
            GET_ALL: '/valoraciones',
            CREATE: '/valoraciones',
            DELETE: '/valoraciones/:id'
        },
        
        // Categorías - CategoriaRouter
        CATEGORIAS: {
            GET_ALL: '/categorias',
            GET_BY_ID: '/categorias/:id',
            CREATE: '/categorias',
            DELETE: '/categorias/:id'
        },
        
        // Roles - RolRouter
        ROLES: {
            GET_ALL: '/roles',
            GET_BY_ID: '/roles/:id',
            CREATE: '/roles'
        },
        
        // Comentarios - ComentarioRouter
        COMENTARIOS: {
            GET_ALL: '/comentarios',
            GET_BY_CLIENT: '/comentarios/cliente/:id',
            GET_RECIENTES: '/comentarios',
            CREATE: '/comentarios',
            DELETE: '/comentarios/:id'
        },
        
        // Formularios - FormularioRouter
        FORMULARIOS: {
            GET_ALL: '/formularios',
            GET_BY_ID: '/formularios/:id',
            CREATE: '/formularios',
            UPDATE: '/formularios/:id',
            DELETE: '/formularios/:id'
        },
        
        // Preguntas - PreguntaRouter
        PREGUNTAS: {
            GET_ALL: '/preguntas',
            GET_BY_ID: '/preguntas/:id',
            GET_BY_SERVICIO: '/servicios/:id/preguntas',
            GET_BY_FORMULARIO: '/preguntas/formularios/:id',
            CREATE: '/preguntas',
            UPDATE: '/preguntas/:id',
            DELETE: '/preguntas/:id'
        },
        
        // Empleados - EmpleadoRouter
        EMPLEADOS: {
            GET_BY_ROL: '/empleados/rol/:id',
            GET_BY_ID: '/empleados/:id'
        },

        // Notificaciones
        NOTIFICACIONES: {
            GET_ALL: '/notificaciones',
            GET_UNREAD: '/notificaciones/no-leidas',
            MARK_AS_READ: '/notificaciones/:id/marcar-leida',
            DELETE: '/notificaciones/:id'
        }
    },
    
    // Configuración general
    TIMEOUT: 30000, 
    
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    AUTH: {
        TOKEN_KEY: 'auth_token',
        REFRESH_TOKEN_KEY: 'refresh_token',
        USER_KEY: 'user_data',
        TOKEN_PREFIX: 'Bearer'
    },
    
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

// Helpers
API_CONFIG.buildUrl = function(endpoint, params = {}) {
    if (endpoint.includes('.')) {
        const [section, method] = endpoint.split('.');
        const sectionUpper = section.toUpperCase();
        const methodUpper = method.replace(/([A-Z])/g, '_$1').toUpperCase();
        if (this.ENDPOINTS[sectionUpper] && this.ENDPOINTS[sectionUpper][methodUpper]) {
            endpoint = this.ENDPOINTS[sectionUpper][methodUpper];
        }
    }
    let url = this.BASE_URL + endpoint;
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    return url;
};

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
const ApiConfig = API_CONFIG;