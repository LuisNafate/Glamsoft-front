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
            const horarios = await this.getAll();
            
            if (horarios && horarios.length > 0) {
                console.log('✓ Horarios encontrados:', horarios.length);
                console.log('→ Usando primer horario:', horarios[0]);
                return horarios[0]; // Retornar el primer horario disponible
            }
            
            // Si no hay horarios, crear uno genérico que cubra toda la semana
            console.log('⚠ No hay horarios, creando horario genérico de lunes...');
            const horarioGenerico = {
                horaInicio: '09:00:00',
                horaFin: '19:00:00',
                diaSemana: 'LUNES'
            };
            
            const nuevoHorario = await this.create(horarioGenerico);
            console.log('✓ Horario genérico creado:', nuevoHorario);
            
            // Crear horarios para el resto de la semana
            const diasSemana = ['MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            for (const dia of diasSemana) {
                try {
                    await this.create({ ...horarioGenerico, diaSemana: dia });
                    console.log(`✓ Horario ${dia} creado`);
                } catch (error) {
                    console.warn(`⚠ No se pudo crear horario para ${dia}:`, error.message);
                }
            }
            
            return nuevoHorario;
            
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
