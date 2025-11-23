// ================== SERVICIO DE PROMOCIONES ==================

const PromocionesService = {
    /**
     * Obtener todas las promociones
     * @param {Object} params - Filtros opcionales
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PROMOCIONES.GET_ALL);
            console.log('URL de petición:', url);
            const response = await httpService.get(url, params);
            console.log('Respuesta HTTP completa:', response);
            return response;
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
            console.log('URL de creación:', url);
            console.log('Datos a enviar:', promocionData);
            const response = await httpService.post(url, promocionData);
            console.log('Respuesta de creación:', response);
            return response;
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
     * @param {number|string} id - ID de la promoción
     * @param {Object} promocionData - Datos a actualizar
     */
    async update(id, promocionData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PROMOCIONES.UPDATE,
                { id }
            );
            console.log('URL de actualización:', url);
            console.log('Datos a actualizar:', promocionData);
            const response = await httpService.put(url, promocionData);
            console.log('Respuesta de actualización:', response);
            return response;
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
            console.log('URL de eliminación:', url);
            const response = await httpService.delete(url);
            console.log('Respuesta de eliminación:', response);
            return response;
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
