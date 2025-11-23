// Dashboard Admin - Lógica principal
class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Verificar autenticación (comentado temporalmente para desarrollo)
            // await this.checkAuth();

            // Cargar datos iniciales
            await this.loadAllData();

            // Configurar actualizaciones periódicas
            this.setupAutoRefresh();

        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            // ErrorHandler.handle(error);
        }
    }

    async checkAuth() {
        try {
            const user = StateManager.getState('user');
            if (!user || user.rol !== 'admin') {
                window.location.href = '../login.html';
                return;
            }

            // Actualizar nombre del usuario
            document.getElementById('userName').textContent = user.nombre || 'Administrador';

        } catch (error) {
            window.location.href = '../login.html';
        }
    }
    async loadAllData() {
        this.showLoader();
        
        try {
            // Cargar todas las estadísticas en paralelo
            const [citas, servicios, estilistas, notificaciones] = await Promise.all([
                this.loadCitas(),
                this.loadServicios(),
                this.loadEstilistas(),
                this.loadNotificaciones()
            ]);
            
            // Actualizar estadísticas en la interfaz
            this.updateStats(citas, servicios, estilistas);
            
            // Cargar actividades recientes
            await this.loadActivities();
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            ErrorHandler.handle(error);
        } finally {
            this.hideLoader();
        }
    }

    async loadCitas() {
        try {
            const response = await CitasService.getAll();
            const citas = response.data || [];
            
            // Filtrar citas de hoy
            const hoy = new Date().toISOString().split('T')[0];
            const citasHoy = citas.filter(cita => cita.fecha === hoy);
            const citasPendientes = citas.filter(cita => cita.estado === 'pendiente');
            
            return {
                total: citasHoy.length,
                pendientes: citasPendientes.length,
                todas: citas
            };
        } catch (error) {
            console.error('Error al cargar citas:', error);
            return { total: 0, pendientes: 0, todas: [] };
        }
    }

    async loadServicios() {
        try {
            const response = await ServiciosService.getAll();
            const servicios = response.data || [];
            const activos = servicios.filter(s => s.activo !== false);
            
            return {
                total: activos.length,
                todos: servicios
            };
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            return { total: 0, todos: [] };
        }
    }

    async loadEstilistas() {
        try {
            const response = await EstilistasService.getAll();
            const estilistas = response.data || [];
            
            return {
                total: estilistas.length,
                todos: estilistas
            };
        } catch (error) {
            console.error('Error al cargar estilistas:', error);
            return { total: 0, todos: [] };
        }
    }

    async loadNotificaciones() {
        try {
            const response = await NotificacionesService.getAll();
            const notificaciones = response.data || [];
            const noLeidas = notificaciones.filter(n => !n.leida);
            
            // Actualizar badge
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = noLeidas.length;
                badge.style.display = noLeidas.length > 0 ? 'flex' : 'none';
            }
            
            return noLeidas;
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            return [];
        }
    }

    updateStats(citas, servicios, estilistas) {
        // Actualizar valores en las tarjetas
        document.getElementById('totalCitas').textContent = citas.total;
        document.getElementById('citasPendientes').textContent = citas.pendientes;
        document.getElementById('totalServicios').textContent = servicios.total;
        document.getElementById('totalEstilistas').textContent = estilistas.total;
    }

    async loadActivities() {
        const container = document.getElementById('activitiesContainer');
        if (!container) return;

        try {
            // Cargar notificaciones reales
            const response = await NotificacionesService.getAll();
            const notificaciones = response.data || [];

            // Ordenar por fecha más reciente y tomar las últimas 5
            const recentNotifications = notificaciones
                .sort((a, b) => new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt))
                .slice(0, 5);

            if (recentNotifications.length === 0) {
                container.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-text">No hay notificaciones recientes</div>
                    </div>
                `;
                return;
            }

            const html = recentNotifications.map(notif => `
                <div class="activity-item">
                    <div class="activity-time">${this.formatTime(new Date(notif.fecha_creacion || notif.createdAt))}</div>
                    <div class="activity-text">${notif.mensaje || notif.titulo || 'Notificación'}</div>
                </div>
            `).join('');

            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-text">No hay notificaciones recientes</div>
                </div>
            `;
        }
    }

    formatTime(date) {
        const diff = new Date() - date;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours === 0) {
            return `Hace ${minutes} minutos`;
        } else if (hours < 24) {
            return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        } else {
            const days = Math.floor(hours / 24);
            return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
        }
    }

    setupAutoRefresh() {
        // Actualizar notificaciones cada 30 segundos
        setInterval(() => {
            this.loadNotificaciones();
        }, 30000);
        
        // Actualizar estadísticas cada 5 minutos
        setInterval(() => {
            this.loadAllData();
        }, 300000);
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

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
