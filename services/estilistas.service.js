/**
 * EstilistasService - Gestión de estilistas/profesionales
 * Maneja CRUD y disponibilidad de estilistas
 */
class EstilistasService {
    /**
     * Obtener todos los estilistas
     * @param {Object} params - Parámetros de filtrado
     * @returns {Promise<Array>} Lista de estilistas
     */
    static async getAll(params = {}) {
        try {
            const endpoint = ApiConfig.buildUrl('estilistas.getAll');
            const url = ApiConfig.addQueryParams(endpoint, params);
            return await HttpService.get(url);
        } catch (error) {
            console.error('Error al obtener estilistas:', error);
            throw error;
        }
    }

    /**
     * Obtener estilista por ID
     * @param {string} id - ID del estilista
     * @returns {Promise<Object>} Datos del estilista
     */
    static async getById(id) {
        try {
            const url = ApiConfig.buildUrl('estilistas.getById', { id });
            return await HttpService.get(url);
        } catch (error) {
            console.error(`Error al obtener estilista ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener disponibilidad de un estilista
     * @param {string} id - ID del estilista
     * @param {Object} params - Fecha y hora
     * @returns {Promise<Object>} Horarios disponibles
     */
    static async getDisponibilidad(id, params = {}) {
        try {
            const url = ApiConfig.buildUrl('estilistas.getDisponibilidad', { id });
            const urlWithParams = ApiConfig.addQueryParams(url, params);
            return await HttpService.get(urlWithParams);
        } catch (error) {
            console.error(`Error al obtener disponibilidad de estilista ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear nuevo estilista (Admin)
     * @param {Object} data - Datos del estilista
     * @returns {Promise<Object>} Estilista creado
     */
    static async create(data) {
        try {
            const url = ApiConfig.buildUrl('estilistas.create');
            return await HttpService.post(url, data);
        } catch (error) {
            console.error('Error al crear estilista:', error);
            throw error;
        }
    }

    /**
     * Actualizar estilista (Admin)
     * @param {string} id - ID del estilista
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>} Estilista actualizado
     */
    static async update(id, data) {
        try {
            const url = ApiConfig.buildUrl('estilistas.update', { id });
            return await HttpService.put(url, data);
        } catch (error) {
            console.error(`Error al actualizar estilista ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar estilista (Admin)
     * @param {string} id - ID del estilista
     * @returns {Promise<Object>} Confirmación
     */
    static async delete(id) {
        try {
            const url = ApiConfig.buildUrl('estilistas.delete', { id });
            return await HttpService.delete(url);
        } catch (error) {
            console.error(`Error al eliminar estilista ${id}:`, error);
            throw error;
        }
    }
}

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstilistasService;
}
