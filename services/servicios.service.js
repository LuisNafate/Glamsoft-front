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
     * Obtener servicio por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.SERVICIOS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicio:', error);
            throw error;
        }
    },

    /**
     * Obtener servicios por categoría
     * @param {number|string} categoriaId 
     */
    async getByCategoria(categoriaId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.SERVICIOS.GET_BY_CATEGORIA,
                { id: categoriaId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios por categoría:', error);
            throw error;
        }
    },

    /**
     * Obtener solo nombres de servicios
     */
    async getNombres() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.SERVICIOS.GET_NOMBRES);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener nombres de servicios:', error);
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
     * @param {number|string} id - ID del servicio a actualizar
     * @param {Object} servicioData - Debe incluir todos los campos del servicio
     */
 async update(id, servicioData) { 
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.SERVICIOS.UPDATE,
                { id } // Pasamos el ID para la URL
            );
            // Cambiamos PATCH por PUT, que es lo que usa tu Java
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
// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiciosService;
}