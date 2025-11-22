// ================== SERVICIO DE ROLES ==================

const RolesService = {
    /**
     * Obtener todos los roles
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ROLES.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    },

    /**
     * Obtener rol por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ROLES.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener rol:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo rol
     * @param {Object} rolData - { nombreRol }
     */
    async create(rolData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ROLES.CREATE);
            const response = await httpService.post(url, rolData);
            return response.data;
        } catch (error) {
            console.error('Error al crear rol:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RolesService;
}
