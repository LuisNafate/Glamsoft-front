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
    },

    /**
     * Obtener o crear horario genérico para las citas
     * IMPORTANTE: idHorario NO es la hora de la cita, sino un bloque de horario del estilista
     * Por ejemplo: "LUNES 09:00-18:00" es un horario, la cita tiene su propia fechaCita
     */
    async getOrCreateDefault() {
        try {
            // Intentar obtener horarios existentes
            console.log('🔍 Buscando horarios disponibles...');
            const response = await this.getAll();

            // Extraer array de horarios de la respuesta
            const horarios = response.data || response;

            if (horarios && horarios.length > 0) {
                console.log('✓ Horarios encontrados:', horarios.length);
                console.log('📋 Todos los horarios disponibles:', horarios);

                // Buscar un horario que tenga idHorario válido
                const horarioValido = horarios.find(h => h.idHorario && h.idHorario > 0);

                if (horarioValido) {
                    console.log('→ Usando horario válido:', horarioValido);
                    return horarioValido;
                }

                // Si ninguno tiene idHorario, usar el primero y esperar que funcione
                console.warn('⚠️ Ningún horario tiene idHorario definido, usando el primero');
                return horarios[0];
            }

            console.log('⚠ No hay horarios disponibles.');
            console.log('⚠ Para crear horarios, debe hacerse desde el panel de administración asignando horarios a estilistas.');
            throw new Error('No hay horarios disponibles. Por favor, contacta al administrador para que configure los horarios de los estilistas.');

        } catch (error) {
            console.error('❌ Error al obtener/crear horario:', error);
            throw new Error('No se pudo obtener un horario válido. Contacta al administrador.');
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HorariosService;
}
