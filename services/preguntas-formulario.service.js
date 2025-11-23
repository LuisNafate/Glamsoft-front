/**
 * PreguntasFormularioService - Gestión de preguntas personalizadas por servicio
 */

const PreguntasFormularioService = {
    /**
     * Obtener todas las preguntas de un servicio específico
     * @param {number} idServicio - ID del servicio
     * @returns {Promise}
     */
    async getByServicio(idServicio) {
        try {
            const response = await HttpService.get(`/servicios/${idServicio}/preguntas`);
            return response;
        } catch (error) {
            console.error(`Error al obtener preguntas del servicio ${idServicio}:`, error);
            throw error;
        }
    },

    /**
     * Obtener todas las preguntas
     * @returns {Promise}
     */
    async getAll() {
        try {
            const response = await HttpService.get('/preguntas');
            return response;
        } catch (error) {
            console.error('Error al obtener todas las preguntas:', error);
            throw error;
        }
    },

    /**
     * Crear nueva pregunta para un servicio
     * @param {Object} preguntaData - Datos de la pregunta
     * @returns {Promise}
     */
    async create(preguntaData) {
        try {
            const response = await HttpService.post('/preguntas', preguntaData);
            return response;
        } catch (error) {
            console.error('Error al crear pregunta:', error);
            throw error;
        }
    },

    /**
     * Actualizar pregunta existente
     * @param {number} idPregunta - ID de la pregunta
     * @param {Object} preguntaData - Datos actualizados
     * @returns {Promise}
     */
    async update(idPregunta, preguntaData) {
        try {
            const response = await HttpService.put(`/preguntas/${idPregunta}`, preguntaData);
            return response;
        } catch (error) {
            console.error('Error al actualizar pregunta:', error);
            throw error;
        }
    },

    /**
     * Eliminar/desactivar pregunta
     * @param {number} idPregunta - ID de la pregunta
     * @returns {Promise}
     */
    async delete(idPregunta) {
        try {
            const response = await HttpService.delete(`/preguntas/${idPregunta}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar pregunta:', error);
            throw error;
        }
    },

    /**
     * Reordenar preguntas de un servicio
     * @param {number} idServicio - ID del servicio
     * @param {Array} ordenPreguntas - Array de IDs en el nuevo orden
     * @returns {Promise}
     */
    async reordenar(idServicio, ordenPreguntas) {
        try {
            const response = await HttpService.put(`/servicios/${idServicio}/preguntas/reordenar`, {
                orden: ordenPreguntas
            });
            return response;
        } catch (error) {
            console.error('Error al reordenar preguntas:', error);
            throw error;
        }
    }
};

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreguntasFormularioService;
}
