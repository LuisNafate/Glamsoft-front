// ================== SERVICIO DE CITAS ==================

const CitasService = {
    /**
     * Obtener todas las citas
     * @param {Object} params - Query params opcionales: estadoCita, fechaCita
     */
    async getAll(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas:', error);
            throw error;
        }
    },

    /**
     * Obtener citas del cliente por ID
     * @param {number|string} clienteId 
     */
    async getByClient(clienteId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_CLIENT,
                { id: clienteId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del cliente:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por mes
     * @param {Object} params - { anio: 2025, mes: 10 }
     */
    async getByMes(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_MES),
                params
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del mes:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por semana
     * @param {Object} params - { anio: 2025, semana: 42 }
     */
    async getBySemana(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_SEMANA),
                params
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas de la semana:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por día
     * @param {Object} params - { fecha: "2025-10-20" }
     */
    async getByDia(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_DIA),
                params
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del día:', error);
            throw error;
        }
    },

    /**
     * Obtener cita por ID
     * @param {number|string} id 
     */
    async getById(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_ID,
                { id }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cita:', error);
            throw error;
        }
    },

    /**
     * Crear nueva cita
     * @param {Object} citaData - Ver JSON ejemplo en documentación
     */
    async create(citaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.CREATE);
            const response = await httpService.post(url, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cita:', error);
            throw error;
        }
    },

    /**
     * Actualizar cita existente
     * @param {Object} citaData - Debe incluir idCita
     */
    async update(citaData) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.UPDATE);
            const response = await httpService.put(url, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            throw error;
        }
    },

    /**
     * Cambiar estado de cita (CONFIRMADA, CANCELADA)
     * @param {Object} data - { estadoCita: "CONFIRMADA" o "CANCELADA" }
     */
    async updateEstado(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.UPDATE_ESTADO);
            const response = await httpService.patch(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar estado de cita:', error);
            throw error;
        }
    },

    /**
     * Actualizar fecha de cita
     * @param {Object} data - { idCita, fechaCita }
     */
    async updateFecha(data) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.UPDATE_FECHA);
            const response = await httpService.patch(url, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar fecha de cita:', error);
            throw error;
        }
    },

    /**
     * Eliminar cita
     * @param {number|string} id
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            throw error;
        }
    },

    /**
     * Obtener citas pendientes de aprobación (ADMIN)
     * @returns {Promise}
     */
    async getPendientes() {
        try {
            const response = await HttpService.get('/citas/pendientes');
            return response;
        } catch (error) {
            console.error('Error al obtener citas pendientes:', error);
            throw error;
        }
    },

    /**
     * Aprobar una cita (ADMIN)
     * @param {number} idCita - ID de la cita
     * @returns {Promise}
     */
    async aprobar(idCita) {
        try {
            const response = await HttpService.put(`/citas/${idCita}/aprobar`);
            return response;
        } catch (error) {
            console.error('Error al aprobar cita:', error);
            throw error;
        }
    },

    /**
     * Rechazar una cita (ADMIN)
     * @param {number} idCita - ID de la cita
     * @param {string} razonRechazo - Motivo del rechazo
     * @returns {Promise}
     */
    async rechazar(idCita, razonRechazo) {
        try {
            const response = await HttpService.put(`/citas/${idCita}/rechazar`, {
                razonRechazo: razonRechazo
            });
            return response;
        } catch (error) {
            console.error('Error al rechazar cita:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CitasService;
}
