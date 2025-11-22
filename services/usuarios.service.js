// ================== SERVICIO DE USUARIOS ==================

const UsuariosService = {
    /**
     * Obtener usuario por email
     * @param {string} email - Email del usuario
     */
    async getByEmail(email) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.USUARIOS.GET_BY_EMAIL,
                { email }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },

    /**
     * Actualizar usuario
     * @param {Object} userData - Datos del usuario a actualizar
     */
    async update(userData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE);
            const response = await httpService.patch(url, userData);
            
            // Actualizar datos locales si es el usuario autenticado
            const currentUser = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
            if (currentUser) {
                const user = JSON.parse(currentUser);
                if (user.email === userData.email) {
                    localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data));
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    /**
     * Eliminar usuario
     * @param {number|string} id - ID del usuario
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.USUARIOS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    },

    /**
     * Crear empleado completo (Admin)
     * @param {Object} empleadoData - Datos del empleado
     */
    async createEmpleado(empleadoData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.CREATE_EMPLEADO);
            const response = await httpService.post(url, empleadoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear empleado:', error);
            throw error;
        }
    },

    /**
     * Actualizar empleado completo (Admin)
     * @param {Object} empleadoData - Datos del empleado a actualizar
     */
    async updateEmpleado(empleadoData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE_EMPLEADO);
            const response = await httpService.patch(url, empleadoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsuariosService;
}
