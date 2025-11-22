// ================== SERVICIO DE CITAS ==================

const CitasService = {
    /**
     * Obtener todas las citas
     * @param {Object} params - Query params opcionales: estadoCita, fechaCita
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
     * Obtener citas del cliente por ID
     * @param {number|string} clienteId 
     */
    async getByClient(clienteId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_CLIENT,
                { id: clienteId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del cliente:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por estilista
     * @param {number|string} estilistaId 
     */
    async getByEstilista(estilistaId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_ESTILISTA,
                { id: estilistaId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del estilista:', error);
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
     * @param {Object} citaData - Ver JSON ejemplo en documentación
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
     * Actualizar cita existente
     * @param {Object} citaData - Debe incluir idCita
     */
    async update(citaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.UPDATE);
            const response = await httpService.put(url, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            throw error;
        }
    },

    /**
     * Cambiar estado de cita (CONFIRMADA, CANCELADA)
     * @param {Object} data - { estadoCita: "CONFIRMADA" o "CANCELADA" }
     */
    async updateEstado(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.UPDATE_ESTADO);
            const response = await httpService.put(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar estado de cita:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CitasService;
}
