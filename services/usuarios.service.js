// ================== SERVICIO DE USUARIOS ==================

const UsuariosService = {
    /**
     * Obtener perfil del usuario autenticado
     */
    async getProfile() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.GET_PROFILE);
            const response = await httpService.get(url);
            
            // Actualizar datos locales
            localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data));
            
            return response.data;
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            throw error;
        }
    },

    /**
     * Actualizar perfil del usuario
     * @param {Object} userData - { nombre, email, telefono, ocupacion, foto }
     */
    async updateProfile(userData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE_PROFILE);
            const response = await httpService.put(url, userData);
            
            // Actualizar datos locales
            localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data));
            
            return response.data;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    },

    /**
     * Obtener usuario por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.USUARIOS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },

    /**
     * Actualizar contraseña
     * @param {Object} passwordData - { currentPassword, newPassword }
     */
    async updatePassword(passwordData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE_PASSWORD);
            const response = await httpService.post(url, passwordData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsuariosService;
}
