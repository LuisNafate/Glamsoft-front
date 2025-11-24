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
        try {
            const user = JSON.parse(localStorage.getItem('user_data') || 'null');
            
            // 🔒 SEGURIDAD: Solo Rol 1 (Admin) puede estar aquí
            if (!user || user.idRol !== 1) {
                console.warn("Acceso denegado: No eres Administrador.");
                window.location.href = '../inicio.html';
                return; // Detener ejecución
            }

            // Actualizar interfaz con datos del usuario
            const nombreReal = user.nombre || 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error de sesión:", error);
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
        console.log('Métricas recibidas:', metricas);

        // Ingresos totales - usar ingresos confirmadas
        const ingresosConfirmadas = metricas.ingresos.confirmadas || 0;
        console.log('Ingresos confirmadas:', ingresosConfirmadas);
        document.getElementById('totalIngresos').textContent =
            `$${ingresosConfirmadas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Total de citas
        console.log('Total de citas:', metricas.totalCitas);
        document.getElementById('totalCitas').textContent = metricas.totalCitas || 0;

        // Tasa de ocupación
        console.log('Tasa de ocupación:', metricas.tasaOcupacion);
        document.getElementById('tasaOcupacion').textContent = `${metricas.tasaOcupacion}%`;

        // Valoración promedio
        console.log('Valoración promedio:', metricas.valoracionPromedio);
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
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart',
                    onComplete: function() {
                        // Animación completada
                    }
                },
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
                    ],
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1200,
                    easing: 'easeOutBounce'
                },
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
            return `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${servicio.nombre}</td>
                    <td>${servicio.cantidad}</td>
                    <td><strong>$${servicio.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>
            `;
        }).join('');
    }

    async exportarReporte() {
        if (!this.datosReporte) {
            await customAlert('No hay datos para exportar', 'Advertencia', { type: 'warning' });
            return;
        }

        try {
            // Acceder a jsPDF desde el objeto global window
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configuración
            const margin = 20;
            let y = margin;

            // Título
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('Reporte de Analytics', margin, y);
            y += 10;

            // Fecha y período
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const fechaActual = new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.text(`Fecha: ${fechaActual}`, margin, y);
            y += 6;
            doc.text(`Período: Últimos ${this.periodo} días`, margin, y);
            y += 12;

            // Línea divisoria
            doc.setLineWidth(0.5);
            doc.line(margin, y, 190, y);
            y += 10;

            // Métricas principales
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Métricas Principales', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const metricas = this.datosReporte.metricas;
            const ingresosConfirmadas = metricas.ingresos.confirmadas || 0;

            doc.text(`• Ingresos Totales (Confirmadas): $${ingresosConfirmadas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 5, y);
            y += 6;
            doc.text(`• Total de Citas: ${metricas.totalCitas}`, margin + 5, y);
            y += 6;
            doc.text(`• Tasa de Ocupación: ${metricas.tasaOcupacion}%`, margin + 5, y);
            y += 6;
            doc.text(`• Valoración Promedio: ${metricas.valoracionPromedio}`, margin + 5, y);
            y += 12;

            // Línea divisoria
            doc.line(margin, y, 190, y);
            y += 10;

            // Top 10 Servicios
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Top 10 Servicios Más Solicitados', margin, y);
            y += 8;

            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            const topServicios = this.datosReporte.servicios.slice(0, 10);

            // Encabezados de tabla
            doc.setFont(undefined, 'bold');
            doc.text('#', margin, y);
            doc.text('Servicio', margin + 10, y);
            doc.text('Cantidad', margin + 100, y);
            doc.text('Ingresos', margin + 140, y);
            y += 6;

            // Línea bajo encabezados
            doc.setLineWidth(0.3);
            doc.line(margin, y, 190, y);
            y += 5;

            doc.setFont(undefined, 'normal');

            topServicios.forEach((servicio, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = margin;
                }

                doc.text(`${index + 1}`, margin, y);

                // Truncar nombre si es muy largo
                const nombreTruncado = servicio.nombre.length > 40
                    ? servicio.nombre.substring(0, 37) + '...'
                    : servicio.nombre;
                doc.text(nombreTruncado, margin + 10, y);

                doc.text(`${servicio.cantidad}`, margin + 100, y);
                doc.text(`$${servicio.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 140, y);
                y += 6;
            });

            // Pie de página
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont(undefined, 'italic');
                doc.text(
                    `Generado con Glamsoft - Página ${i} de ${totalPages}`,
                    105,
                    290,
                    { align: 'center' }
                );
            }

            // Descargar PDF
            const nombreArchivo = `reporte_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(nombreArchivo);

        } catch (error) {
            console.error('Error al exportar PDF:', error);
            await customAlert('Error al exportar el reporte. Verifica que la librería jsPDF esté cargada correctamente.', 'Error', { type: 'error' });
        }
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
