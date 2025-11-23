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
     * Obtener usuario por ID
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
            console.error('Error al obtener usuario por ID:', error);
            throw error;
        }
    },

    // ✅ NUEVO MÉTODO: Obtener por teléfono
    async getByTelefono(telefono) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.USUARIOS.GET_BY_TELEFONO,
                { telefono }
            );
            const response = await httpService.get(url);
            return response.data; // Retorna el body { status, data: {...} }
        } catch (error) {
            console.error('Error al buscar usuario por teléfono:', error);
            throw error;
        }
    },

    /**
     * Actualizar usuario
     * @param {Object} userData - Datos del usuario a actualizar
     */
    async update(userData) {
        try {
            // 1. Extraemos el ID para ponerlo en la URL
            const id = userData.idUsuario || userData.id;
            
            // 2. Construimos la URL con el ID (/usuarios/33)
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.USUARIOS.UPDATE,
                { id } 
            );

            // 3. Usamos PUT (porque tu router Java usa app.put)
            // Enviamos userData como cuerpo
            const response = await httpService.put(url, userData);
            
            // Actualizar datos locales si es el usuario autenticado
            const currentUser = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
            if (currentUser) {
                const user = JSON.parse(currentUser);
                if (user.email === userData.email) {
                    // Mezclamos los datos nuevos con los viejos para no perder nada
                    const updatedLocal = { ...user, ...response.data };
                    localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(updatedLocal));
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