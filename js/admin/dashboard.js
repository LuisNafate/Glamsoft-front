// Dashboard Admin - Lógica principal
class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupProfileMenu();
            await this.loadAllData();
            this.setupAutoRefresh();
            
            // Cerrar menú al hacer scroll
            window.addEventListener('scroll', () => {
                const menu = document.getElementById('profileMenuModal');
                if (menu && menu.style.display === 'block') {
                    menu.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            // ErrorHandler.handle(error);
        }
    }

    async checkAuth() {
        try {
            // 1. Obtener usuario (Corregido: usar .get() o leer de localStorage directamente)
            let user = null;
            if (typeof StateManager !== 'undefined') {
                user = StateManager.get('user');
            }
            
            // Respaldo directo al localStorage si StateManager falla o está vacío
            if (!user) {
                const userStr = localStorage.getItem('user_data');
                if (userStr) user = JSON.parse(userStr);
            }

            // Validación de rol (Opcional: descomentar para seguridad estricta)
            /*
            if (!user || user.rol !== 'admin') {
                window.location.href = '../login.html';
                return;
            }
            */

            // 2. Actualizar Nombres en la Interfaz
            const nombreReal = user ? user.nombre : 'Administrador';
            
            // A) Nombre en el Header ("Bienvenido ...")
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            // B) Nombre en el Menú Desplegable (Icono de usuario)
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error auth:", error);
        }
    }

    setupProfileMenu() {
        const userIcon = document.getElementById('adminUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (profileMenu.style.display === 'block') {
                    profileMenu.style.display = 'none';
                } else {
                    profileMenu.style.display = 'block';
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (profileMenu && profileMenu.style.display === 'block') {
                if (!profileMenu.contains(e.target) && !userIcon.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    await AuthService.logout();
                    window.location.href = '../login.html';
                }
            });
        }
    }

    async loadAllData() {
        this.showLoader();
        try {
            const [citas, servicios, estilistas, notificaciones] = await Promise.all([
                this.loadCitas(),
                this.loadServicios(),
                this.loadEstilistas(),
                this.loadNotificaciones()
            ]);
            this.updateStats(citas, servicios, estilistas);
            await this.loadActivities();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // ErrorHandler.handle(error);
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
        // Actualizar valores en las tarjetas si existen los elementos
        const elCitas = document.getElementById('totalCitas');
        if(elCitas) elCitas.textContent = citas.total;
        
        const elPendientes = document.getElementById('citasPendientes');
        if(elPendientes) elPendientes.textContent = citas.pendientes;
        
        const elServicios = document.getElementById('totalServicios');
        if(elServicios) elServicios.textContent = servicios.total;
        
        const elEstilistas = document.getElementById('totalEstilistas');
        if(elEstilistas) elEstilistas.textContent = estilistas.total;
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