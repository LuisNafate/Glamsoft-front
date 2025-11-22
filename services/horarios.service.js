// ================== SERVICIO DE HORARIOS ==================

const HorariosService = {
    /**
     * Obtener todos los horarios
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.HORARIOS.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo horario
     * @param {Object} horarioData - { idEstilista, diaSemana, horaInicio, horaFin }
     */
    async create(horarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.HORARIOS.CREATE);
            const response = await httpService.post(url, horarioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    },

    /**
     * Actualizar horario
     * @param {Object} horarioData - Debe incluir idHorario
     */
    async update(horarioData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.HORARIOS.UPDATE);
            const response = await httpService.patch(url, horarioData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            throw error;
        }
    },

    /**
     * Eliminar horario
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.HORARIOS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HorariosService;
}
