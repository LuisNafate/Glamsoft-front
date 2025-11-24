const PortafolioService = {
    /**
     * Obtener todos los trabajos del portafolio
     * @param {Object} params - Query params opcionales: estilistaId
     */
    async getAll(params = {}) {
        try {
            let url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.GET_ALL);
            url = API_CONFIG.addQueryParams(url, params);
            const response = await httpService.get(url);
            // La API devuelve { data: [...], message: "...", status: "..." }
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error al obtener portafolio:', error);
            throw error;
        }
    },

    async getDestacados(limit = 4) {
        try {
            // Usar el endpoint GET_ALL en lugar de GET_DESTACADOS
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.GET_ALL);
            const response = await httpService.get(url);
            // La API devuelve { data: [...], message: "...", status: "..." }
            // Extraer el array de datos
            const trabajos = response.data?.data || response.data || [];
            // Limitar la cantidad de resultados si se especifica
            return limit ? trabajos.slice(0, limit) : trabajos;
        } catch (error) {
            console.error('Error al obtener portafolio destacados:', error);
            throw error;
        }
    },

    async create(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.CREATE);
            const response = await httpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al crear imagen:', error);
            throw error;
        }
    },

    async update(data) {
        try {
            // El ID debe ir en la URL
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.UPDATE, { id: data.idImagen });
            const response = await httpService.put(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar imagen:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.DELETE, { id });
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            throw error;
        }
    }
};
// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortafolioService;
}
