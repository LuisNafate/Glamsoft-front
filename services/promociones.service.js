// ================== SERVICIO DE PROMOCIONES ==================

const PromocionesService = {
    /**
     * Obtener todas las promociones
     * @param {Object} params - Filtros opcionales
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
     * Obtener servicios de una promoción
     * @param {number|string} id 
     */
    async getServicios(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.GET_SERVICIOS,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios de promoción:', error);
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
     * Agregar servicio a promoción
     * @param {number|string} id - ID de la promoción
     * @param {Object} servicioData - Datos del servicio a agregar
     */
    async addServicio(id, servicioData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.CREATE_SERVICIO,
                { id }
            );
            const response = await httpService.post(url, servicioData);
            return response.data;
        } catch (error) {
            console.error('Error al agregar servicio a promoción:', error);
            throw error;
        }
    },

    /**
     * Actualizar promoción
     * @param {Object} promocionData - Debe incluir el ID
     */
    async update(promocionData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PROMOCIONES.UPDATE);
            const response = await httpService.patch(url, promocionData);
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
