/**
 * PortafolioService - Gestión de trabajos del portafolio
 * Maneja la obtención y gestión de imágenes del portafolio
 */
const PortafolioService = {
    /**
     * Obtener todas las imágenes del portafolio
     * @param {Object} params - Parámetros de filtrado
     * @returns {Promise<Array>} Lista de imágenes
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener portafolio:', error);
            throw error;
        }
    },

    /**
     * Obtener últimas 4 imágenes para la página de inicio
     * @returns {Promise<Array>} Lista de imágenes destacadas
     */
    async getDestacados() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.GET_DESTACADOS);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener trabajos destacados:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo trabajo en portafolio (Admin)
     * @param {Object} data - Datos del trabajo { imageURL, nombreImagen }
     * @returns {Promise<Object>} Trabajo creado
     */
    async create(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.CREATE);
            const response = await httpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al crear trabajo:', error);
            throw error;
        }
    },

    /**
     * Actualizar trabajo existente (Admin)
     * @param {Object} data - Datos actualizados (debe incluir idImagen)
     * @returns {Promise<Object>} Trabajo actualizado
     */
    async update(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.UPDATE);
            const response = await httpService.patch(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar trabajo:', error);
            throw error;
        }
    },

    /**
     * Eliminar trabajo (Admin)
     * @param {string|number} id - ID del trabajo
     * @returns {Promise<Object>} Confirmación
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.PORTAFOLIO.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar trabajo ${id}:`, error);
            throw error;
        }
    }
};

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortafolioService;
}
