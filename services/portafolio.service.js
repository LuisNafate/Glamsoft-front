const PortafolioService = {
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.PORTAFOLIO.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener portafolio:', error);
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
