// ================== SERVICIO DE FORMULARIOS ==================

const FormulariosService = {
    /**
     * Obtener todos los formularios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FORMULARIOS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
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
            return response.data;
        } catch (error) {
            console.error('Error al obtener formulario:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo formulario
     * @param {Object} formularioData - { nombre, descripcion }
     */
    async create(formularioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FORMULARIOS.CREATE);
            const response = await httpService.post(url, formularioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear formulario:', error);
            throw error;
        }
    },

    /**
     * Actualizar formulario
     * @param {number|string} id 
     * @param {Object} formularioData 
     */
    async update(id, formularioData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.FORMULARIOS.UPDATE,
                { id }
            );
            const response = await httpService.patch(url, formularioData);
            return response.data;
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
            return response.data;
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
