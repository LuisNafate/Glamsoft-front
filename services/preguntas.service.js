// ================== SERVICIO DE PREGUNTAS ==================

const PreguntasService = {
    /**
     * Obtener todas las preguntas
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PREGUNTAS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            throw error;
        }
    },

    /**
     * Obtener pregunta por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PREGUNTAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener pregunta:', error);
            throw error;
        }
    },

    /**
     * Obtener preguntas por servicio
     * @param {number|string} servicioId 
     */
    async getByServicio(servicioId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PREGUNTAS.GET_BY_SERVICIO,
                { id: servicioId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener preguntas del servicio:', error);
            throw error;
        }
    },

    /**
     * Obtener preguntas por formulario
     * @param {number|string} formularioId 
     */
    async getByFormulario(formularioId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PREGUNTAS.GET_BY_FORMULARIO,
                { id: formularioId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener preguntas del formulario:', error);
            throw error;
        }
    },

    /**
     * Crear nueva pregunta
     * @param {Object} preguntaData - { textoPregunta, tipoPregunta, idFormulario }
     */
    async create(preguntaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PREGUNTAS.CREATE);
            const response = await httpService.post(url, preguntaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear pregunta:', error);
            throw error;
        }
    },

    /**
     * Actualizar pregunta
     * @param {number|string} id 
     * @param {Object} preguntaData 
     */
    async update(id, preguntaData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PREGUNTAS.UPDATE,
                { id }
            );
            const response = await httpService.put(url, preguntaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar pregunta:', error);
            throw error;
        }
    },

    /**
     * Eliminar pregunta
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PREGUNTAS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar pregunta:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreguntasService;
}
