// ================== SERVICIO DE CATEGORÍAS ==================

const CategoriasService = {
    /**
     * Obtener todas las categorías
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CATEGORIAS.GET_ALL);
            const response = await httpService.get(url);
            // La API devuelve { data: [...], message: "...", status: "..." }
            // Extraer el array de datos
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    },

    /**
     * Obtener categoría por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CATEGORIAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            throw error;
        }
    },

    /**
     * Crear nueva categoría
     * @param {Object} categoriaData - { nombre }
     */
    async create(categoriaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CATEGORIAS.CREATE);
            const response = await httpService.post(url, categoriaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear categoría:', error);
            throw error;
        }
    },

    /**
     * Eliminar categoría
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CATEGORIAS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoriasService;
}
