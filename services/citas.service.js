// ================== SERVICIO DE CITAS ==================

const CitasService = {
    /**
     * Obtener todas las citas
     * @param {Object} params - Filtros { fecha, estado, estilistaId }
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas:', error);
            throw error;
        }
    },

    /**
     * Obtener citas del usuario autenticado
     * @param {number|string} userId 
     */
    async getByUser(userId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_USER,
                { userId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del usuario:', error);
            throw error;
        }
    },

    /**
     * Obtener cita por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cita:', error);
            throw error;
        }
    },

    /**
     * Crear nueva cita
     * @param {Object} citaData - { servicioId, estilistaId, fecha, hora, notas }
     */
    async create(citaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.CREATE);
            const response = await httpService.post(url, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cita:', error);
            throw error;
        }
    },

    /**
     * Actualizar cita
     * @param {number|string} id 
     * @param {Object} citaData 
     */
    async update(id, citaData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.UPDATE,
                { id }
            );
            const response = await httpService.put(url, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            throw error;
        }
    },

    /**
     * Cancelar cita
     * @param {number|string} id 
     * @param {string} motivo 
     */
    async cancel(id, motivo = '') {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.CANCEL,
                { id }
            );
            const response = await httpService.post(url, { motivo });
            return response.data;
        } catch (error) {
            console.error('Error al cancelar cita:', error);
            throw error;
        }
    },

    /**
     * Confirmar cita
     * @param {number|string} id 
     */
    async confirm(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.CONFIRM,
                { id }
            );
            const response = await httpService.post(url);
            return response.data;
        } catch (error) {
            console.error('Error al confirmar cita:', error);
            throw error;
        }
    },

    /**
     * Obtener disponibilidad de horarios
     * @param {Object} params - { fecha, estilistaId, servicioId }
     */
    async getDisponibilidad(params) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_DISPONIBILIDAD);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            throw error;
        }
    },

    /**
     * Eliminar cita
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CitasService;
}
