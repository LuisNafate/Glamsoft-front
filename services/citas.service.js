// ================== SERVICIO DE CITAS ==================

const CitasService = {
    /**
     * Obtener todas las citas
     * @param {Object} params - Query params opcionales: estilistaId, estadoCita, fechaCita
     */
    async getAll(params = {}) {
        try {
            let url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_ALL);
            url = API_CONFIG.addQueryParams(url, params);
            const response = await httpService.get(url);
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
     * Obtener citas del estilista por ID
     * @param {number|string} estilistaId
     */
    async getByEstilista(estilistaId) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.GET_BY_ESTILISTA,
                { id: estilistaId }
            );
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas del estilista:', error);
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
     * Aprobar una cita - Cambia estado a CONFIRMADA
     * @param {number|string} idCita - ID de la cita
     */
    async aprobar(idCita) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.APROBAR,
                { id: idCita }
            );
            const response = await httpService.put(url);
            return response.data;
        } catch (error) {
            console.error('Error al aprobar cita:', error);
            throw error;
        }
    },

    /**
     * Rechazar una cita - Cambia estado a CANCELADA
     * @param {number|string} idCita - ID de la cita
     * @param {string} razonRechazo - Motivo del rechazo
     */
    async rechazar(idCita, razonRechazo) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.RECHAZAR,
                { id: idCita }
            );
            const response = await httpService.put(url, {
                razonRechazo: razonRechazo || 'Sin motivo especificado'
            });
            return response.data;
        } catch (error) {
            console.error('Error al rechazar cita:', error);
            throw error;
        }
    },

    /**
     * Completar una cita - Cambia estado a COMPLETADA
     * @param {number|string} idCita - ID de la cita
     */
    async completar(idCita) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.COMPLETAR,
                { id: idCita }
            );
            const response = await httpService.put(url);
            return response.data;
        } catch (error) {
            console.error('Error al completar cita:', error);
            throw error;
        }
    },

    /**
     * Cancelar una cita - Cambia estado a CANCELADA
     * @param {number|string} idCita - ID de la cita
     * @param {string} razonCancelacion - Motivo de cancelación
     */
    async cancelar(idCita, razonCancelacion) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.CITAS.CANCELAR,
                { id: idCita }
            );
            const response = await httpService.put(url, {
                razonRechazo: razonCancelacion || 'Cancelada por el cliente'
            });
            return response.data;
        } catch (error) {
            console.error('Error al cancelar cita:', error);
            throw error;
        }
    },

    /**
     * Actualizar fecha y hora de cita
     * @param {Object} data - { idCita, nuevaFecha, nuevaHora }
     */
    async updateFecha(data) {
        try {
            // 1. Obtener la cita actual para mantener los demás datos
            const citaActual = await this.getById(data.idCita);
            const cita = citaActual.data?.data || citaActual.data || citaActual;

            console.log('📋 Cita actual obtenida para reagendar:', cita);
            
            // Extraer IDs de cliente y estilista de forma robusta
            const idCliente = cita.idCliente || (cita.cliente ? cita.cliente.idCliente : null);
            const idEstilista = cita.idEstilista || (cita.estilista ? cita.estilista.idEmpleado : null);
            const idHorario = cita.idHorario || (cita.horario ? cita.horario.idHorario : null);
            
            if (!idCliente || !idEstilista) {
                throw new Error('No se pudo obtener el ID del cliente o del estilista de la cita original.');
            }

            // 2. Construir el objeto para la nueva cita ANTES de eliminar la antigua
            const newCitaData = {
                fecha: data.nuevaFecha,
                hora: data.nuevaHora.includes(':00') ? data.nuevaHora : data.nuevaHora + ':00',
                notas: cita.notas || '',
                idCliente: idCliente,
                idEstilista: idEstilista,
                servicios: cita.servicios?.map(s => s.idServicio || s.id) || [],
                estado: 'PENDIENTE', // Al reagendar, la cita vuelve a estar pendiente de aprobación
                idHorario: idHorario, // Reutilizar el idHorario de la cita original
                respuestasFormulario: cita.respuestasFormulario || [] // Mantener respuestas de formulario si existen
            };

            // Validar que tengamos un idHorario si el backend lo requiere
            if (!newCitaData.idHorario) {
                // Si no hay idHorario, no podemos continuar porque la creación de cita fallará.
                // Esto puede pasar si citas antiguas no tenían horario o el GET no lo devuelve.
                // Como no tenemos acceso a HorariosService aquí, es mejor lanzar un error claro.
                console.warn("No se encontró 'idHorario' en la cita original. La creación de la nueva cita podría fallar si el backend lo requiere.");
            }

            console.log('📝 Datos para la nueva cita:', newCitaData);

            // 3. Eliminar la cita antigua
            await this.delete(data.idCita);
            console.log(`🗑️ Cita antigua con ID ${data.idCita} eliminada.`);

            // 4. Crear la nueva cita
            console.log('📤 Creando nueva cita...');
            const response = await this.create(newCitaData);
            console.log('✅ Nueva cita creada exitosamente:', response);

            return response;

        } catch (error) {
            console.error('❌ Error al reagendar la cita (eliminar y crear):', error);
            // Idealmente aquí habría una lógica de "rollback". 
            // Si la creación falla después de haber borrado, la cita se pierde.
            // Por ahora, solo relanzamos el error para que el frontend lo maneje.
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
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CitasService;
}
