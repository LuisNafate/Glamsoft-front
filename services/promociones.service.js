// ================== SERVICIO DE PROMOCIONES ==================

const PromocionesService = {
    /**
     * Obtener todas las promociones
     * @param {Object} params - Filtros { activa, categoria }
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PROMOCIONES.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener promociones:', error);
            throw error;
        }
    },

    /**
     * Obtener solo promociones activas
     */
    async getActive() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PROMOCIONES.GET_ACTIVE);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener promociones activas:', error);
            throw error;
        }
    },

    /**
     * Obtener promoción por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener promoción:', error);
            throw error;
        }
    },

    /**
     * Crear nueva promoción
     * @param {Object} promocionData 
     */
    async create(promocionData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PROMOCIONES.CREATE);
            const response = await httpService.post(url, promocionData);
            return response.data;
        } catch (error) {
            console.error('Error al crear promoción:', error);
            throw error;
        }
    },

    /**
     * Actualizar promoción
     * @param {number|string} id 
     * @param {Object} promocionData 
     */
    async update(id, promocionData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.UPDATE,
                { id }
            );
            const response = await httpService.put(url, promocionData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar promoción:', error);
            throw error;
        }
    },

    /**
     * Eliminar promoción
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar promoción:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromocionesService;
}
