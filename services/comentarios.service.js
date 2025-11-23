// ================== SERVICIO DE COMENTARIOS ==================

const ComentariosService = {
    /**
     * Obtener todos los comentarios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.GET_ALL);
            const response = await httpService.get(url);
            console.log('ComentariosService.getAll - Response:', response);
            return response; // Retorna response completo con {data, message, status}
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
            console.log('ComentariosService.getByClient - Response:', response);
            return response;
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
            console.log('ComentariosService.getRecientes - Response:', response);
            return response;
        } catch (error) {
            console.error('Error al obtener comentarios recientes:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo comentario
     * @param {Object} comentarioData - { idCliente, idCita, comentario }
     */
    async create(comentarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.CREATE);
            console.log('ComentariosService.create - Data:', comentarioData);
            const response = await httpService.post(url, comentarioData);
            console.log('ComentariosService.create - Response:', response);
            return response;
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
            console.log('ComentariosService.delete - ID:', id);
            const response = await httpService.delete(url);
            console.log('ComentariosService.delete - Response:', response);
            return response;
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

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComentariosService;
}
