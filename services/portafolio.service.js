/**
 * PortafolioService - Gestión de trabajos del portafolio
 * Maneja la obtención y gestión de imágenes del portafolio
 */
class PortafolioService {
    /**
     * Obtener todos los trabajos del portafolio
     * @param {Object} params - Parámetros de filtrado
     * @param {number} params.limit - Límite de resultados
     * @param {number} params.page - Número de página
     * @param {string} params.categoria - Filtrar por categoría
     * @returns {Promise<Array>} Lista de trabajos
     */
    static async getAll(params = {}) {
        try {
            const queryParams = {};
            if (params.limit) queryParams.limit = params.limit;
            if (params.page) queryParams.page = params.page;
            if (params.categoria) queryParams.categoria = params.categoria;
            
            const endpoint = ApiConfig.buildUrl('portafolio.getAll');
            const url = ApiConfig.addQueryParams(endpoint, queryParams);
            
            return await HttpService.get(url);
        } catch (error) {
            console.error('Error al obtener portafolio:', error);
            throw error;
        }
    }

    /**
     * Obtener trabajo específico por ID
     * @param {string} id - ID del trabajo
     * @returns {Promise<Object>} Datos del trabajo
     */
    static async getById(id) {
        try {
            const url = ApiConfig.buildUrl('portafolio.getById', { id });
            return await HttpService.get(url);
        } catch (error) {
            console.error(`Error al obtener trabajo ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear nuevo trabajo en portafolio (Admin)
     * @param {FormData} formData - Datos del trabajo con imagen
     * @returns {Promise<Object>} Trabajo creado
     */
    static async create(formData) {
        try {
            const url = ApiConfig.buildUrl('portafolio.create');
            return await HttpService.upload(url, formData, 'POST');
        } catch (error) {
            console.error('Error al crear trabajo:', error);
            throw error;
        }
    }

    /**
     * Actualizar trabajo existente (Admin)
     * @param {string} id - ID del trabajo
     * @param {FormData} formData - Datos actualizados
     * @returns {Promise<Object>} Trabajo actualizado
     */
    static async update(id, formData) {
        try {
            const url = ApiConfig.buildUrl('portafolio.update', { id });
            return await HttpService.upload(url, formData, 'PUT');
        } catch (error) {
            console.error(`Error al actualizar trabajo ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar trabajo (Admin)
     * @param {string} id - ID del trabajo
     * @returns {Promise<Object>} Confirmación
     */
    static async delete(id) {
        try {
            const url = ApiConfig.buildUrl('portafolio.delete', { id });
            return await HttpService.delete(url);
        } catch (error) {
            console.error(`Error al eliminar trabajo ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener trabajos destacados para la página de inicio
     * @param {number} limit - Número máximo de trabajos a obtener
     * @returns {Promise<Array>} Lista de trabajos destacados
     */
    static async getDestacados(limit = 4) {
        try {
            const endpoint = ApiConfig.buildUrl('portafolio.destacados');
            const url = ApiConfig.addQueryParams(endpoint, { limit });
            return await HttpService.get(url);
        } catch (error) {
            console.error('Error al obtener trabajos destacados:', error);
            throw error;
        }
    }

    /**
     * Obtener categorías disponibles
     * @returns {Promise<Array>} Lista de categorías
     */
    static async getCategorias() {
        try {
            const url = ApiConfig.buildUrl('portafolio.categorias');
            return await HttpService.get(url);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    }
}

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortafolioService;
}
