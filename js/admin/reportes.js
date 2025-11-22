// Reportes y Analytics Admin
class ReportesAdmin {
    constructor() {
        this.periodo = 30;
        this.charts = {};
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
            const [citas, servicios, estilistas] = await Promise.all([
                CitasService.getAll(),
                ServiciosService.getAll(),
                EstilistasService.getAll()
            ]);
            
            const citasData = citas.data || [];
            const serviciosData = servicios.data || [];
            const estilistasData = estilistas.data || [];
            
            // Filtrar por período
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - this.periodo);
            
            const citasFiltradas = citasData.filter(c => {
                return new Date(c.fecha) >= fechaLimite;
            });
            
            // Calcular métricas
            this.calculateMetrics(citasFiltradas, serviciosData);
            
            // Renderizar gráficos
            this.renderCharts(citasFiltradas, serviciosData, estilistasData);
            
        } catch (error) {
            console.error('Error al cargar reportes:', error);
        } finally {
            this.hideLoader();
        }
    }

    calculateMetrics(citas, servicios) {
        // Ingresos totales
        const ingresosActuales = citas
            .filter(c => c.estado === 'confirmada')
            .reduce((sum, c) => sum + (c.precio || 0), 0);
        
        document.getElementById('totalIngresos').textContent = 
            `$${ingresosActuales.toFixed(2)}`;
        
        // Total de citas
        document.getElementById('totalCitas').textContent = citas.length;
        
        // Tasa de ocupación (simulada)
        const tasaOcupacion = Math.min(100, Math.round((citas.length / (this.periodo * 10)) * 100));
        document.getElementById('tasaOcupacion').textContent = `${tasaOcupacion}%`;
        
        // Valoración promedio (simulada)
        document.getElementById('promValoracion').textContent = '4.8';
        
        // Cambios (simulados)
        document.getElementById('changeIngresos').innerHTML = 
            '<i class="fas fa-arrow-up"></i> 12.5%';
        document.getElementById('changeCitas').innerHTML = 
            '<i class="fas fa-arrow-up"></i> 8.3%';
    }

    renderCharts(citas, servicios, estilistas) {
        this.renderIngresosChart(citas);
        this.renderServiciosChart(citas, servicios);
        this.renderEstilistasChart(citas, estilistas);
        this.renderTopServiciosTable(citas, servicios);
    }

    renderIngresosChart(citas) {
        const ctx = document.getElementById('ingresosChart');
        if (!ctx) return;
        
        // Agrupar por fecha
        const ingresosPorDia = {};
        citas.forEach(cita => {
            const fecha = cita.fecha;
            if (!ingresosPorDia[fecha]) {
                ingresosPorDia[fecha] = 0;
            }
            if (cita.estado === 'confirmada') {
                ingresosPorDia[fecha] += cita.precio || 0;
            }
        });
        
        const labels = Object.keys(ingresosPorDia).sort().slice(-15);
        const data = labels.map(fecha => ingresosPorDia[fecha]);
        
        if (this.charts.ingresos) {
            this.charts.ingresos.destroy();
        }
        
        this.charts.ingresos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(f => new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: data,
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderServiciosChart(citas, servicios) {
        const ctx = document.getElementById('serviciosChart');
        if (!ctx) return;
        
        // Contar servicios
        const servicioCount = {};
        citas.forEach(cita => {
            const servicio = cita.servicio_nombre || 'Desconocido';
            servicioCount[servicio] = (servicioCount[servicio] || 0) + 1;
        });
        
        const topServicios = Object.entries(servicioCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (this.charts.servicios) {
            this.charts.servicios.destroy();
        }
        
        this.charts.servicios = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topServicios.map(s => s[0]),
                datasets: [{
                    label: 'Cantidad de Citas',
                    data: topServicios.map(s => s[1]),
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderEstilistasChart(citas, estilistas) {
        const ctx = document.getElementById('estilistasChart');
        if (!ctx) return;
        
        // Contar citas por estilista
        const estilistaCitas = {};
        citas.forEach(cita => {
            const estilista = cita.estilista_nombre || 'Sin asignar';
            estilistaCitas[estilista] = (estilistaCitas[estilista] || 0) + 1;
        });
        
        const labels = Object.keys(estilistaCitas);
        const data = Object.values(estilistaCitas);
        
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
                        '#1abc9c'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    renderTopServiciosTable(citas, servicios) {
        const tbody = document.getElementById('topServiciosTable');
        if (!tbody) return;
        
        // Calcular estadísticas por servicio
        const servicioStats = {};
        citas.forEach(cita => {
            const servicio = cita.servicio_nombre || 'Desconocido';
            if (!servicioStats[servicio]) {
                servicioStats[servicio] = {
                    cantidad: 0,
                    ingresos: 0
                };
            }
            servicioStats[servicio].cantidad++;
            if (cita.estado === 'confirmada') {
                servicioStats[servicio].ingresos += cita.precio || 0;
            }
        });
        
        const topServicios = Object.entries(servicioStats)
            .map(([nombre, stats]) => ({
                nombre,
                ...stats,
                promedio: stats.ingresos / stats.cantidad
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);
        
        tbody.innerHTML = topServicios.map((servicio, index) => `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${servicio.nombre}</td>
                <td>${servicio.cantidad}</td>
                <td><strong>$${servicio.ingresos.toFixed(2)}</strong></td>
                <td>$${servicio.promedio.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    exportarReporte() {
        alert('Funcionalidad de exportación en desarrollo');
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
