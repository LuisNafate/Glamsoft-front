// ================== SERVICIO DE REPORTES ==================

const ReportesService = {
    /**
     * Obtener todas las citas para un período de tiempo
     * @param {Object} params - { fechaInicio, fechaFin, estadoCita }
     */
    async getCitasPeriodo(params = {}) {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_ALL);
            const response = await httpService.get(url, params);
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener citas del período:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por mes para reportes
     * @param {Object} params - { anio, mes }
     */
    async getCitasPorMes(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_MES),
                params
            );
            const response = await httpService.get(url);
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener citas por mes:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por semana
     * @param {Object} params - { anio, semana }
     */
    async getCitasPorSemana(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_SEMANA),
                params
            );
            const response = await httpService.get(url);
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener citas por semana:', error);
            throw error;
        }
    },

    /**
     * Obtener citas por día
     * @param {Object} params - { fecha }
     */
    async getCitasPorDia(params) {
        try {
            const url = API_CONFIG.addQueryParams(
                API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_BY_DIA),
                params
            );
            const response = await httpService.get(url);
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener citas por día:', error);
            throw error;
        }
    },

    /**
     * Obtener citas de un estilista específico
     * @param {number} idEstilista
     */
    async getCitasPorEstilista(idEstilista) {
        try {
            // Usar el endpoint genérico de citas y filtrar por estilista
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CITAS.GET_ALL);
            const response = await httpService.get(url);
            const todasCitas = response.data || response || [];
            // Filtrar por estilista en el frontend
            return todasCitas.filter(cita => cita.idEstilista === idEstilista || cita.estilista_id === idEstilista);
        } catch (error) {
            console.error('Error al obtener citas del estilista:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las valoraciones
     */
    async getValoraciones() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.VALORACIONES.GET_ALL);
            const response = await httpService.get(url);
            return response.data || response;
        } catch (error) {
            console.error('Error al obtener valoraciones:', error);
            throw error;
        }
    },

    /**
     * Calcular métricas de ingresos basadas en citas
     * @param {Array} citas - Array de citas del backend
     * @returns {Object} - { total, porEstado, promedio }
     */
    calcularIngresos(citas) {
        const ingresos = {
            total: 0,
            confirmadas: 0,
            canceladas: 0,
            pendientes: 0,
            promedioPorCita: 0
        };

        if (!citas || citas.length === 0) {
            return ingresos;
        }

        citas.forEach(cita => {
            // Leer el precio total de la cita
            const precio = parseFloat(cita.precioTotal || cita.precio || 0);
            const estado = (cita.estadoCita || cita.estado || '').toLowerCase();

            ingresos.total += precio;

            switch (estado) {
                case 'confirmada':
                    ingresos.confirmadas += precio;
                    break;
                case 'cancelada':
                    ingresos.canceladas += precio;
                    break;
                case 'pendiente':
                    ingresos.pendientes += precio;
                    break;
            }
        });

        ingresos.promedioPorCita = citas.length > 0 ? ingresos.total / citas.length : 0;

        return ingresos;
    },

    /**
     * Agrupar citas por servicio
     * @param {Array} citas - Array de citas del backend
     * @returns {Array} - Servicios ordenados por cantidad
     */
    agruparPorServicio(citas) {
        const servicioMap = {};

        citas.forEach(cita => {
            // Manejar múltiples servicios por cita si existen
            if (cita.servicios && Array.isArray(cita.servicios)) {
                cita.servicios.forEach(servicio => {
                    const nombre = servicio.nombre || servicio.nombreServicio || 'Servicio Desconocido';
                    const precio = parseFloat(servicio.precio || 0);

                    if (!servicioMap[nombre]) {
                        servicioMap[nombre] = {
                            nombre,
                            cantidad: 0,
                            ingresos: 0
                        };
                    }
                    servicioMap[nombre].cantidad++;
                    servicioMap[nombre].ingresos += precio;
                });
            } else {
                // Servicio único (fallback por si acaso)
                const nombre = cita.servicio_nombre || cita.nombreServicio || 'Servicio Desconocido';
                const precio = parseFloat(cita.precioTotal || cita.precio || 0);

                if (!servicioMap[nombre]) {
                    servicioMap[nombre] = {
                        nombre,
                        cantidad: 0,
                        ingresos: 0
                    };
                }
                servicioMap[nombre].cantidad++;
                servicioMap[nombre].ingresos += precio;
            }
        });

        // Convertir a array y ordenar por cantidad
        return Object.values(servicioMap)
            .sort((a, b) => b.cantidad - a.cantidad);
    },

    /**
     * Agrupar citas por estilista
     * @param {Array} citas - Array de citas del backend
     * @returns {Array} - Estilistas ordenados por cantidad de citas
     */
    agruparPorEstilista(citas) {
        const estilistaMap = {};

        citas.forEach(cita => {
            const nombre = cita.estilista?.nombre || cita.estilista_nombre || cita.nombreEstilista || 'Sin Asignar';
            const precio = parseFloat(cita.precioTotal || cita.precio || 0);

            if (!estilistaMap[nombre]) {
                estilistaMap[nombre] = {
                    nombre,
                    cantidad: 0,
                    ingresos: 0
                };
            }
            estilistaMap[nombre].cantidad++;
            estilistaMap[nombre].ingresos += precio;
        });

        return Object.values(estilistaMap)
            .sort((a, b) => b.cantidad - a.cantidad);
    },

    /**
     * Agrupar ingresos por fecha
     * @param {Array} citas - Array de citas del backend
     * @returns {Object} - { fechas: [], ingresos: [] }
     */
    agruparIngresosPorFecha(citas) {
        const ingresosPorDia = {};

        citas.forEach(cita => {
            let fechaStr = '';

            // Manejar formato array [2025, 11, 28, 13, 0]
            if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
                const [year, month, day] = cita.fechaHoraCita;
                fechaStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else if (cita.fecha) {
                fechaStr = cita.fecha.split('T')[0]; // Obtener solo la fecha (YYYY-MM-DD)
            } else if (cita.fechaCita) {
                fechaStr = cita.fechaCita.split('T')[0];
            }

            if (!fechaStr) return;

            const precio = parseFloat(cita.precioTotal || cita.precio || 0);
            const estado = (cita.estadoCita || cita.estado || '').toLowerCase();

            if (!ingresosPorDia[fechaStr]) {
                ingresosPorDia[fechaStr] = 0;
            }

            // Solo contar ingresos de citas confirmadas
            if (estado === 'confirmada' || estado === 'aprobada') {
                ingresosPorDia[fechaStr] += precio;
            }
        });

        // Ordenar por fecha
        const fechasOrdenadas = Object.keys(ingresosPorDia).sort();

        return {
            fechas: fechasOrdenadas,
            ingresos: fechasOrdenadas.map(fecha => ingresosPorDia[fecha])
        };
    },

    /**
     * Calcular tasa de ocupación
     * @param {Array} citas - Array de citas del backend
     * @param {number} diasPeriodo - Número de días del período
     * @param {number} citasPorDia - Capacidad de citas por día (default: 10)
     * @returns {number} - Porcentaje de ocupación
     */
    calcularTasaOcupacion(citas, diasPeriodo, citasPorDia = 10) {
        const capacidadTotal = diasPeriodo * citasPorDia;
        const citasRealizadas = citas.filter(c => {
            const estado = (c.estadoCita || c.estado || '').toLowerCase();
            return estado === 'confirmada' || estado === 'aprobada' || estado === 'completada';
        }).length;

        const tasa = (citasRealizadas / capacidadTotal) * 100;
        return Math.min(100, Math.round(tasa));
    },

    /**
     * Calcular valoración promedio
     * @param {Array} valoraciones - Array de valoraciones del backend
     * @returns {number} - Promedio de valoraciones
     */
    calcularValoracionPromedio(valoraciones) {
        console.log('Calculando valoración promedio. Valoraciones recibidas:', valoraciones);

        if (!valoraciones || valoraciones.length === 0) {
            console.log('No hay valoraciones');
            return 0;
        }

        console.log('Primera valoración:', valoraciones[0]);

        const suma = valoraciones.reduce((acc, val) => {
            // Intentar diferentes nombres de campos
            const puntuacion = parseFloat(val.puntuacion || val.calificacion || val.rating || val.valoracion || 0);
            console.log('Puntuación de valoración:', puntuacion, 'de objeto:', val);
            return acc + puntuacion;
        }, 0);

        const promedio = (suma / valoraciones.length).toFixed(1);
        console.log('Promedio calculado:', promedio);
        return promedio;
    },

    /**
     * Filtrar citas por período de tiempo
     * @param {Array} citas - Array de citas
     * @param {number} dias - Número de días hacia atrás
     * @returns {Array} - Citas filtradas
     */
    filtrarPorPeriodo(citas, dias) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);

        return citas.filter(cita => {
            let fecha;

            // Manejar formato array [2025, 11, 28, 13, 0]
            if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
                const [year, month, day] = cita.fechaHoraCita;
                fecha = new Date(year, month - 1, day); // month - 1 porque Date usa meses 0-11
            } else if (cita.fecha) {
                fecha = new Date(cita.fecha);
            } else if (cita.fechaCita) {
                fecha = new Date(cita.fechaCita);
            } else {
                return false; // Sin fecha, excluir
            }

            return fecha >= fechaLimite;
        });
    },

    /**
     * Obtener datos completos para el dashboard de reportes
     * @param {number} diasPeriodo - Días hacia atrás para el reporte
     * @returns {Object} - Datos completos del reporte
     */
    async obtenerDatosReporte(diasPeriodo = 30) {
        try {
            // Obtener todos los datos necesarios en paralelo
            const [citasResponse, valoracionesResponse, serviciosResponse, estilistasResponse] = await Promise.all([
                this.getCitasPeriodo(),
                this.getValoraciones(),
                httpService.get(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.SERVICIOS.GET_ALL)),
                httpService.get(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ESTILISTAS.GET_ALL))
            ]);

            const todasLasCitas = citasResponse.data || citasResponse || [];
            const valoraciones = valoracionesResponse.data || valoracionesResponse || [];
            const servicios = serviciosResponse.data || serviciosResponse || [];
            const estilistas = estilistasResponse.data || estilistasResponse || [];

            // Filtrar citas por período
            const citasFiltradas = this.filtrarPorPeriodo(todasLasCitas, diasPeriodo);

            // Calcular todas las métricas
            const ingresos = this.calcularIngresos(citasFiltradas);
            const serviciosPorPopularidad = this.agruparPorServicio(citasFiltradas);
            const estilistasPorRendimiento = this.agruparPorEstilista(citasFiltradas);
            const ingresosPorFecha = this.agruparIngresosPorFecha(citasFiltradas);
            const tasaOcupacion = this.calcularTasaOcupacion(citasFiltradas, diasPeriodo);
            const valoracionPromedio = this.calcularValoracionPromedio(valoraciones);

            return {
                periodo: diasPeriodo,
                citas: citasFiltradas,
                metricas: {
                    totalCitas: citasFiltradas.length,
                    ingresos: ingresos,
                    tasaOcupacion: tasaOcupacion,
                    valoracionPromedio: valoracionPromedio
                },
                servicios: serviciosPorPopularidad,
                estilistas: estilistasPorRendimiento,
                ingresosPorFecha: ingresosPorFecha,
                datosOriginales: {
                    servicios,
                    estilistas,
                    valoraciones
                }
            };
        } catch (error) {
            console.error('Error al obtener datos del reporte:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesService;
}
