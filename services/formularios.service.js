// ================== SERVICIO DE FORMULARIOS ==================

const FormulariosService = {
    /**
     * Obtener todos los formularios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FORMULARIOS.GET_ALL);
            const response = await httpService.get(url);
            // La respuesta viene en formato: { status, message, data }
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener formularios:', error);
            throw error;
        }
    },

    /**
     * Obtener formulario por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.FORMULARIOS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            // La respuesta viene en formato: { status, message, data }
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener formulario:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo formulario
     * @param {Object} formularioData - { nombreFormulario, descripcion, activo }
     */
    async create(formularioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FORMULARIOS.CREATE);
            const response = await httpService.post(url, formularioData);
            return response.data || response;
        } catch (error) {
            console.error('Error al crear formulario:', error);
            throw error;
        }
    },

    /**
     * Actualizar formulario
     * @param {number|string} id 
     * @param {Object} formularioData - { idFormulario, nombreFormulario, descripcion, activo }
     */
    async update(id, formularioData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.FORMULARIOS.UPDATE,
                { id }
            );
            // Asegurar que el ID esté en el objeto
            const dataToSend = {
                ...formularioData,
                idFormulario: parseInt(id)
            };
            const response = await httpService.patch(url, dataToSend);
            return response.data || response;
        } catch (error) {
            console.error('Error al actualizar formulario:', error);
            throw error;
        }
    },

    /**
     * Eliminar formulario
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.FORMULARIOS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data || response;
        } catch (error) {
            console.error('Error al eliminar formulario:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormulariosService;
}
