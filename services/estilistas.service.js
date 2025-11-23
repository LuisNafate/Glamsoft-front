/**
 * EstilistasService - Gestión de estilistas/profesionales
 */
const EstilistasService = {
    /**
     * Obtener todos los estilistas (incluye horarios y servicios)
     * @returns {Promise<Array>} Lista de estilistas
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estilistas:', error);
            throw error;
        }
    },

    /**
     * Obtener estilista por ID
     * @param {string|number} id - ID del estilista
     * @returns {Promise<Object>} Datos del estilista
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener estilista ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtener horarios de un estilista específico
     * @param {string|number} id - ID del estilista
     * @returns {Promise<Array>} Horarios del estilista
     */
    async getHorarios(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.GET_HORARIOS,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener horarios del estilista ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtener servicios que ofrece un estilista
     * @param {string|number} id - ID del estilista
     * @returns {Promise<Array>} Servicios del estilista
     */
    async getServicios(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.GET_SERVICIOS,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener servicios del estilista ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtener estilistas que ofrecen un servicio específico
     * @param {string|number} servicioId - ID del servicio
     * @returns {Promise<Array>} Estilistas que ofrecen el servicio
     */
    async getByServicio(servicioId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.GET_BY_SERVICIO,
                { id: servicioId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener estilistas por servicio ${servicioId}:`, error);
            throw error;
        }
    },

    /**
     * Crear bloque de horario
     * @param {Object} horarioData - { idEstilista, diaSemana, horaInicio, horaFin }
     * @returns {Promise<Object>} Horario creado
     */
    async createHorario(horarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.CREATE_HORARIO);
            const response = await httpService.post(url, horarioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    },

    /**
     * Asignar servicio a estilista
     * @param {Object} data - { idEstilista, idServicio }
     * @returns {Promise<Object>} Relación creada
     */
    async createServicio(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.CREATE_SERVICIO);
            const response = await httpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al asignar servicio a estilista:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo estilista
     * @param {Object} estilistaData - Datos del estilista
     * @returns {Promise<Object>} Estilista creado
     */
    async create(estilistaData) {
        try {
            // Asegurar que tenga idRol = 2 (Estilista)
            const data = {
                ...estilistaData,
                idRol: 2,
                activo: estilistaData.activo !== undefined ? estilistaData.activo : true
            };

            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER_EMPLEADO);
            const response = await httpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al crear estilista:', error);
            throw error;
        }
    },

    /**
     * Actualizar estilista
     * @param {string|number} id - ID del estilista
     * @param {Object} estilistaData - Datos actualizados
     * @returns {Promise<Object>} Estilista actualizado
     */
    async update(id, estilistaData) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.UPDATE,
                { id }
            );
            const response = await httpService.put(url, estilistaData);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar estilista ${id}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar estilista
     * @param {string|number} id - ID del estilista
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.ESTILISTAS.DELETE,
                { id }
            );
            console.log('URL de eliminación:', url);
            console.log('ID que se envía:', id);
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar estilista ${id}:`, error);
            throw error;
        }
    }
};

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstilistasService;
}
