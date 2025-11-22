// ================== SERVICIO DE VALORACIONES ==================

const ValoracionesService = {
    /**
     * Obtener todas las valoraciones
     * @param {Object} params - Filtros { limite, pagina }
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.VALORACIONES.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener valoraciones:', error);
            throw error;
        }
    },

    /**
     * Obtener valoraciones por servicio
     * @param {number|string} servicioId 
     */
    async getByServicio(servicioId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.VALORACIONES.GET_BY_SERVICIO,
                { servicioId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener valoraciones del servicio:', error);
            throw error;
        }
    },

    /**
     * Obtener valoraciones del usuario
     * @param {number|string} userId 
     */
    async getByUser(userId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.VALORACIONES.GET_BY_USER,
                { userId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener valoraciones del usuario:', error);
            throw error;
        }
    },

    /**
     * Crear nueva valoración
     * @param {Object} valoracionData - { servicioId, calificacion, comentario }
     */
    async create(valoracionData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.VALORACIONES.CREATE);
            const response = await httpService.post(url, valoracionData);
            return response.data;
        } catch (error) {
            console.error('Error al crear valoración:', error);
            throw error;
        }
    },

    /**
     * Actualizar valoración
     * @param {number|string} id 
     * @param {Object} valoracionData 
     */
    async update(id, valoracionData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.VALORACIONES.UPDATE,
                { id }
            );
            const response = await httpService.put(url, valoracionData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar valoración:', error);
            throw error;
        }
    },

    /**
     * Eliminar valoración
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.VALORACIONES.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar valoración:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValoracionesService;
}
