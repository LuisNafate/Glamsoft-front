// ================== SERVICIO DE SERVICIOS/PRODUCTOS ==================

const ServiciosService = {
    /**
     * Obtener todos los servicios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.SERVICIOS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo servicio
     * @param {Object} servicioData - Ver JSON ejemplo en documentación
     */
    async create(servicioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.SERVICIOS.CREATE);
            const response = await httpService.post(url, servicioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear servicio:', error);
            throw error;
        }
    },

    /**
     * Actualizar servicio
     * @param {number|string} id 
     * @param {Object} servicioData - Ver JSON ejemplo en documentación
     */
    async update(id, servicioData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.SERVICIOS.UPDATE,
                { id }
            );
            const response = await httpService.put(url, servicioData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar servicio:', error);
            throw error;
        }
    },

    /**
     * Eliminar servicio
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.SERVICIOS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiciosService;
}
