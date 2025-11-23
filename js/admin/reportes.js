// Reportes y Analytics Admin
class ReportesAdmin {
    constructor() {
        this.periodo = 30;
        this.charts = {};
        this.datosReporte = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadReportes();
        } catch (error) {
            console.error('Error al inicializar:', error);
            ErrorHandler.handle(error);
        }
    }

    async checkAuth() {
        const user = StateManager.getState('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }

    setupEventListeners() {
        document.getElementById('filterPeriodo')?.addEventListener('change', (e) => {
            this.periodo = parseInt(e.target.value);
            this.loadReportes();
        });

        document.getElementById('btnExportar')?.addEventListener('click', () => {
            this.exportarReporte();
        });
    }

    async loadReportes() {
        this.showLoader();

        try {
            // Usar el nuevo servicio de reportes para obtener todos los datos
            this.datosReporte = await ReportesService.obtenerDatosReporte(this.periodo);

            console.log('Datos del reporte cargados:', this.datosReporte);

            // Calcular métricas
            this.displayMetrics(this.datosReporte.metricas);

            // Renderizar gráficos
            this.renderCharts(this.datosReporte);

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            ErrorHandler.handle(error);
            this.showError('No se pudieron cargar los reportes. Verifica la conexión con el servidor.');
        } finally {
            this.hideLoader();
        }
    }

    displayMetrics(metricas) {
        // Ingresos totales - usar ingresos confirmadas
        const ingresosConfirmadas = metricas.ingresos.confirmadas || 0;
        document.getElementById('totalIngresos').textContent =
            `$${ingresosConfirmadas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Total de citas
        document.getElementById('totalCitas').textContent = metricas.totalCitas || 0;

        // Tasa de ocupación
        document.getElementById('tasaOcupacion').textContent = `${metricas.tasaOcupacion}%`;

        // Valoración promedio
        document.getElementById('promValoracion').textContent = metricas.valoracionPromedio || '0.0';

        // Calcular cambios (comparando con período anterior - simulado por ahora)
        // TODO: implementar comparación real con período anterior
        const cambioIngresos = '+12.5%';
        const cambioCitas = '+8.3%';

        document.getElementById('changeIngresos').innerHTML =
            `<i class="fas fa-arrow-up"></i> ${cambioIngresos}`;
        document.getElementById('changeCitas').innerHTML =
            `<i class="fas fa-arrow-up"></i> ${cambioCitas}`;
    }

    renderCharts(datosReporte) {
        this.renderIngresosChart(datosReporte.ingresosPorFecha);
        this.renderServiciosChart(datosReporte.servicios);
        this.renderEstilistasChart(datosReporte.estilistas);
        this.renderTopServiciosTable(datosReporte.servicios);
    }

    renderIngresosChart(ingresosPorFecha) {
        const ctx = document.getElementById('ingresosChart');
        if (!ctx) return;

        const { fechas, ingresos } = ingresosPorFecha;

        // Tomar las últimas 15 fechas para mejor visualización
        const ultimas15Fechas = fechas.slice(-15);
        const ultimos15Ingresos = ingresos.slice(-15);

        if (this.charts.ingresos) {
            this.charts.ingresos.destroy();
        }

        this.charts.ingresos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ultimas15Fechas.map(f => {
                    const fecha = new Date(f);
                    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                }),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: ultimos15Ingresos,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Ingresos: $' + context.parsed.y.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                }
            }
        });
    }

    renderServiciosChart(servicios) {
        const ctx = document.getElementById('serviciosChart');
        if (!ctx) return;

        // Tomar los top 5 servicios más solicitados
        const topServicios = servicios.slice(0, 5);

        if (this.charts.servicios) {
            this.charts.servicios.destroy();
        }

        this.charts.servicios = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topServicios.map(s => s.nombre),
                datasets: [{
                    label: 'Cantidad de Citas',
                    data: topServicios.map(s => s.cantidad),
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const servicio = topServicios[context.dataIndex];
                                return 'Ingresos: $' + servicio.ingresos.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    renderEstilistasChart(estilistas) {
        const ctx = document.getElementById('estilistasChart');
        if (!ctx) return;

        const labels = estilistas.map(e => e.nombre);
        const data = estilistas.map(e => e.cantidad);

        if (this.charts.estilistas) {
            this.charts.estilistas.destroy();
        }

        this.charts.estilistas = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6',
                        '#1abc9c',
                        '#34495e',
                        '#e67e22'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const estilista = estilistas[context.dataIndex];
                                const porcentaje = ((estilista.cantidad / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${context.label}: ${estilista.cantidad} citas (${porcentaje}%)`;
                            },
                            afterLabel: function(context) {
                                const estilista = estilistas[context.dataIndex];
                                return 'Ingresos: $' + estilista.ingresos.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    renderTopServiciosTable(servicios) {
        const tbody = document.getElementById('topServiciosTable');
        if (!tbody) return;

        // Tomar los top 10 servicios
        const topServicios = servicios.slice(0, 10);

        if (topServicios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        No hay datos de servicios para este período
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = topServicios.map((servicio, index) => {
            const promedio = servicio.cantidad > 0 ? servicio.ingresos / servicio.cantidad : 0;
            return `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${servicio.nombre}</td>
                    <td>${servicio.cantidad}</td>
                    <td><strong>$${servicio.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    <td>$${promedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');
    }

    exportarReporte() {
        if (!this.datosReporte) {
            alert('No hay datos para exportar');
            return;
        }

        // Preparar datos para exportación
        const reporte = {
            fecha: new Date().toISOString(),
            periodo: `Últimos ${this.periodo} días`,
            metricas: this.datosReporte.metricas,
            topServicios: this.datosReporte.servicios.slice(0, 10),
            estilistas: this.datosReporte.estilistas
        };

        // Convertir a JSON y descargar
        const dataStr = JSON.stringify(reporte, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showError(message) {
        // Crear un elemento de error si no existe
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(errorDiv);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReportesAdmin();
});
