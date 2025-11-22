// ================== SERVICIO DE EMPLEADOS ==================

const EmpleadosService = {
    /**
     * Obtener empleados por rol
     * @param {number|string} rolId - ID del rol (1=admin, 2=estilista, 3=recepcionista)
     */
    async getByRol(rolId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.EMPLEADOS.GET_BY_ROL,
                { id: rolId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empleados por rol:', error);
            throw error;
        }
    },

    /**
     * Obtener empleado por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.EMPLEADOS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empleado:', error);
            throw error;
        }
    },

    /**
     * Registrar nuevo empleado (usa endpoint de AUTH)
     * @param {Object} empleadoData - Ver estructura en UsuarioRouter
     */
    async create(empleadoData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER_EMPLEADO);
            const response = await httpService.post(url, empleadoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear empleado:', error);
            throw error;
        }
    },

    /**
     * Actualizar empleado completo
     * @param {Object} empleadoData 
     */
    async update(empleadoData) {
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
    module.exports = EmpleadosService;
}
