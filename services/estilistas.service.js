/**
 * EstilistasService - Gestión de estilistas/profesionales
 */
const EstilistasService = {
    /**
     * Obtener todos los estilistas (incluye horarios y servicios)
     * @returns {Promise<Array>} Lista de estilistas
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estilistas:', error);
            throw error;
        }
    },

    /**
     * Obtener estilista por ID
     * @param {string|number} id - ID del estilista
     * @returns {Promise<Object>} Datos del estilista
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener estilista ${id}:`, error);
            throw error;
        }
    },

    /**
     * Buscar estilistas disponibles por fecha
     * @param {Object} params - { fechaCita: "2025-10-20T15:00:00" }
     * @returns {Promise<Array>} Estilistas disponibles
     */
    async getDisponibilidad(params) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.GET_DISPONIBILIDAD);
            const response = await httpService.post(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            throw error;
        }
    },

    /**
     * Obtener todos los horarios
     * @returns {Promise<Array>} Lista de horarios configurados
     */
    async getHorarios() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.GET_HORARIOS);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            throw error;
        }
    },

    /**
     * Crear bloque de horario
     * @param {Object} horarioData - Ver JSON ejemplo en documentación
     * @returns {Promise<Object>} Horario creado
     */
    async createHorario(horarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.CREATE_HORARIO);
            const response = await httpService.post(url, horarioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    }
};

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstilistasService;
}
