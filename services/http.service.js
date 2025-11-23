// ================== SERVICIO HTTP GENÉRICO ==================

class HttpService {
    constructor(config) {
        this.config = config;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    // ========== INTERCEPTORES ==========
    
    /**
     * Agrega un interceptor de petición
     * @param {Function} interceptor - Función que recibe la config y retorna la config modificada
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Agrega un interceptor de respuesta
     * @param {Function} onSuccess - Función para respuestas exitosas
     * @param {Function} onError - Función para errores
     */
    addResponseInterceptor(onSuccess, onError) {
        this.responseInterceptors.push({ onSuccess, onError });
    }

    /**
     * Aplica los interceptores de petición
     */
    async applyRequestInterceptors(config) {
        let modifiedConfig = { ...config };
        
        for (const interceptor of this.requestInterceptors) {
            modifiedConfig = await interceptor(modifiedConfig);
        }
        
        return modifiedConfig;
    }

    /**
     * Aplica los interceptores de respuesta
     */
    async applyResponseInterceptors(response, isError = false) {
        let modifiedResponse = response;
        
        for (const interceptor of this.responseInterceptors) {
            const handler = isError ? interceptor.onError : interceptor.onSuccess;
            if (handler) {
                modifiedResponse = await handler(modifiedResponse);
            }
        }
        
        return modifiedResponse;
    }

    // ========== MÉTODOS HTTP ==========

    /**
     * Realiza una petición HTTP genérica
     */
    async request(url, options = {}) {
        // Guardamos la configuración inicial para tener acceso a la URL en caso de error
        let config = {
            url,
            method: options.method || 'GET',
            headers: {
                ...this.config.DEFAULT_HEADERS,
                ...options.headers
            },
            body: options.body,
            timeout: options.timeout || this.config.TIMEOUT
        };

        try {
            // Aplicar interceptores de petición
            config = await this.applyRequestInterceptors(config);

            // Construir opciones de fetch
            const fetchOptions = {
                method: config.method,
                headers: config.headers
            };

            if (config.body && config.method !== 'GET' && config.method !== 'HEAD') {
                fetchOptions.body = typeof config.body === 'string' 
                    ? config.body 
                    : JSON.stringify(config.body);
            }

            // Crear controlador de timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            fetchOptions.signal = controller.signal;

            // Realizar petición
            const response = await fetch(config.url, fetchOptions);
            clearTimeout(timeoutId);

            // Parsear respuesta
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Crear objeto de respuesta
            const result = {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: data,
                ok: response.ok,
                url: config.url // ✅ AGREGADO: Guardamos la URL para identificar la petición
            };

            // Si la respuesta no es exitosa, lanzar error
            if (!response.ok) {
                const error = new Error(data.message || response.statusText);
                error.response = result;
                throw error;
            }

            // Aplicar interceptores de respuesta exitosa
            return await this.applyResponseInterceptors(result, false);

        } catch (error) {
            // Manejar errores de timeout
            if (error.name === 'AbortError') {
                error.message = 'La petición ha excedido el tiempo de espera';
            }

            // Manejar errores de red (donde no hay respuesta del servidor)
            if (!error.response) {
                error.response = {
                    status: 0,
                    statusText: 'Error de red',
                    data: { message: error.message },
                    url: config.url // ✅ AGREGADO: Guardamos la URL también aquí
                };
            }

            // Aplicar interceptores de respuesta de error
            const modifiedError = await this.applyResponseInterceptors(error, true);
            throw modifiedError;
        }
    }

    /**
     * Petición GET
     */
    async get(url, params = {}, options = {}) {
        const urlWithParams = this.config.addQueryParams(url, params);
        return this.request(urlWithParams, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * Petición POST
     */
    async post(url, data = {}, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: data
        });
    }

    /**
     * Petición PUT
     */
    async put(url, data = {}, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: data
        });
    }

    /**
     * Petición PATCH
     */
    async patch(url, data = {}, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: data
        });
    }

    /**
     * Petición DELETE
     */
    async delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Upload de archivos (multipart/form-data)
     */
    async upload(url, formData, options = {}) {
        const uploadOptions = {
            ...options,
            method: 'POST',
            headers: {
                ...options.headers
                // No incluir Content-Type, el navegador lo establecerá automáticamente con el boundary
            },
            body: formData
        };

        // Remover Content-Type de los headers por defecto para uploads
        delete uploadOptions.headers['Content-Type'];

        return this.request(url, uploadOptions);
    }
}

// Crear instancia única del servicio HTTP
const httpService = new HttpService(API_CONFIG);

// ========== CONFIGURAR INTERCEPTORES POR DEFECTO ==========

// Interceptor de petición: agregar token de autenticación
httpService.addRequestInterceptor(async (config) => {
    const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
    
    if (token) {
        config.headers['Authorization'] = `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`;
    }
    
    return config;
});

// Interceptor de respuesta exitosa y errores
httpService.addResponseInterceptor(
    async (response) => {
        console.log('✅ Respuesta exitosa:', response);
        return response;
    },
    async (error) => {
        console.error('❌ Error en petición:', error);
        
        // Si el error es 401 (no autorizado)
        if (error.response && error.response.status === API_CONFIG.HTTP_STATUS.UNAUTHORIZED) {
            
            // ✅ CORRECCIÓN CRÍTICA: Verificar si la petición era un Login
            // Si es login, NO redirigimos (es solo contraseña incorrecta)
            const isLoginRequest = error.response.url && (error.response.url.includes('/login') || error.response.url.includes('login'));
            
            if (!isLoginRequest) {
                // Si NO es login (ej. expiró token en perfil), entonces sí limpiamos y sacamos al usuario
                localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
                localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
                localStorage.setItem('isLoggedIn', 'false');
                
                console.warn('Sesión expirada o token inválido. Redirigiendo a login...');
                
                // Redirigir a login si no estamos ya ahí
                if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('inicio.html')) {
                    window.location.href = 'login.html';
                }
            } else {
                console.warn('Fallo de autenticación en login (Contraseña incorrecta). No se fuerza redirección.');
            }
        }
        
        throw error;
    }
);

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = httpService;
}