// ================== SERVICIO DE AUTENTICACIÓN ==================

const AuthService = {
    /**
     * Iniciar sesión
     * @param {Object} credentials - { email, password }
     */
    async login(credentials) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
            const response = await httpService.post(url, credentials);
            
            // Guardar token y datos del usuario según respuesta de la API
            if (response.data.token) {
                localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.token);
            }
            
            if (response.data.usuario) {
                localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data.usuario));
            }
            
            localStorage.setItem('isLoggedIn', 'true');
            
            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    /**
     * Registrar nuevo usuario
     * @param {Object} userData - { email, password, nombreCompleto, telefono }
     */
    async register(userData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER);
            const response = await httpService.post(url, userData);
            
            return response.data;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
            await httpService.post(url);
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar datos locales siempre
            localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
            localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
            localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
            localStorage.setItem('isLoggedIn', 'false');
        }
    },

    /**
     * Verificar si el token es válido
     */
    async verifyToken() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
            const response = await httpService.get(url);
            return response.data.valid;
        } catch (error) {
            return false;
        }
    },

    /**
     * Refrescar token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
            
            if (!refreshToken) {
                throw new Error('No hay refresh token disponible');
            }
            
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN);
            const response = await httpService.post(url, { refreshToken });
            
            if (response.data.token) {
                localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.token);
            }
            
            return response.data;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            throw error;
        }
    },

    /**
     * Obtener usuario actual del localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return localStorage.getItem('isLoggedIn') === 'true' && 
               localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY) !== null;
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
