// ================== SERVICIO DE VALORACIONES ==================

const ValoracionesService = {
    /**
     * Obtener todas las valoraciones
     * @param {Object} params - Filtros opcionales
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.VALORACIONES.GET_ALL);
            const response = await httpService.get(url, params);
            // La API devuelve { data: [...], message: "...", status: "..." }
            // Extraer el array de datos
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error al obtener valoraciones:', error);
            throw error;
        }
    },

    /**
     * Crear nueva valoración
     * @param {Object} valoracionData - { idCliente, idServicio, calificacion, comentario }
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
