// ================== SERVICIO DE COMENTARIOS ==================

const ComentariosService = {
    /**
     * Obtener todos los comentarios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            throw error;
        }
    },

    /**
     * Obtener comentarios por cliente
     * @param {number|string} clienteId 
     */
    async getByClient(clienteId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.COMENTARIOS.GET_BY_CLIENT,
                { id: clienteId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener comentarios del cliente:', error);
            throw error;
        }
    },

    /**
     * Obtener últimos 8 comentarios recientes
     */
    async getRecientes() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.GET_RECIENTES);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener comentarios recientes:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo comentario
     * @param {Object} comentarioData - { idCliente, comentario }
     */
    async create(comentarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.CREATE);
            const response = await httpService.post(url, comentarioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear comentario:', error);
            throw error;
        }
    },

    /**
     * Eliminar comentario
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.COMENTARIOS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComentariosService;
}
