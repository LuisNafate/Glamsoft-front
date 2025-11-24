// ================== SERVICIO DE COMENTARIOS ==================

const ComentariosService = {
    /**
     * Obtener todos los comentarios
     * @param {Object} params - Query params opcionales: estilistaId
     */
    async getAll(params = {}) {
        try {
            let url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.GET_ALL);
            url = API_CONFIG.addQueryParams(url, params);
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
     * @param {Object} comentarioData - { idCliente, comentario, idCita (opcional) }
     */
    async create(comentarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMENTARIOS.CREATE);
            
            // Preparar datos según API: el campo debe ser 'comentario' no 'contenido'
            // idCita es opcional, si no existe se omite
            // Enviar ambos campos ('comentario' y 'contenido') por compatibilidad
            const dataToSend = {
                idCliente: comentarioData.idCliente && Number(comentarioData.idCliente),
                comentario: comentarioData.comentario,
                contenido: comentarioData.comentario,
                ...(comentarioData.idCita && { idCita: Number(comentarioData.idCita) })
            };
            
            console.log('ComentariosService.create - Data enviada:', dataToSend);
            const response = await httpService.post(url, dataToSend);
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
