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
            
            // ✅ NUEVO: Cerrar menú al hacer scroll
            window.addEventListener('scroll', () => {
                const menu = document.getElementById('profileMenuModal');
                if (menu && menu.style.display === 'block') {
                    menu.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
        }
    }

    async checkAuth() {
        try {
            const user = StateManager.getState('user') || JSON.parse(localStorage.getItem('user_data'));
            
            // Validación de rol
            // if (!user || (user.idRol !== 1 && user.idRol !== 2 && user.rol !== 'admin')) {
            //     window.location.href = '../login.html';
            // }

            const nombreReal = user ? user.nombre : 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
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
            ErrorHandler.handle(error);
        } finally {
            this.hideLoader();
        }
    }

    // ... (Resto de métodos loadCitas, etc. sin cambios) ...
    // Mantén el resto del archivo igual que el anterior.
    
    async loadCitas() {
        try {
            const response = await CitasService.getAll();
            const citas = response.data || [];
            const hoy = new Date().toISOString().split('T')[0];
            return {
                total: citas.filter(cita => cita.fecha === hoy).length,
                pendientes: citas.filter(cita => cita.estado === 'pendiente').length,
                todas: citas
            };
        } catch (error) { return { total: 0, pendientes: 0, todas: [] }; }
    }

    async loadServicios() {
        try {
            const response = await ServiciosService.getAll();
            const servicios = response.data || [];
            return { total: servicios.filter(s => s.activo !== false).length, todos: servicios };
        } catch (error) { return { total: 0, todos: [] }; }
    }

    async loadEstilistas() {
        try {
            const response = await EstilistasService.getAll();
            const estilistas = response.data || [];
            return { total: estilistas.length, todos: estilistas };
        } catch (error) { return { total: 0, todos: [] }; }
    }

    async loadNotificaciones() {
        try {
            const response = await NotificacionesService.getAll();
            const notificaciones = response.data || [];
            const noLeidas = notificaciones.filter(n => !n.leida);
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = noLeidas.length;
                badge.style.display = noLeidas.length > 0 ? 'flex' : 'none';
            }
            return noLeidas;
        } catch (error) { return []; }
    }

    updateStats(citas, servicios, estilistas) {
        document.getElementById('totalCitas').textContent = citas.total;
        document.getElementById('citasPendientes').textContent = citas.pendientes;
        document.getElementById('totalServicios').textContent = servicios.total;
        document.getElementById('totalEstilistas').textContent = estilistas.total;
    }

    async loadActivities() {
        const container = document.getElementById('activitiesContainer');
        if (!container) return;
        try {
            const response = await NotificacionesService.getAll();
            const notificaciones = response.data || [];
            const recentNotifications = notificaciones
                .sort((a, b) => new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt))
                .slice(0, 5);

            if (recentNotifications.length === 0) {
                container.innerHTML = `<div class="activity-item"><div class="activity-text">No hay notificaciones recientes</div></div>`;
                return;
            }
            container.innerHTML = recentNotifications.map(notif => `
                <div class="activity-item">
                    <div class="activity-time">${this.formatTime(new Date(notif.fecha_creacion || notif.createdAt))}</div>
                    <div class="activity-text">${notif.mensaje || notif.titulo || 'Notificación'}</div>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = `<div class="activity-item"><div class="activity-text">No hay notificaciones recientes</div></div>`;
        }
    }

    formatTime(date) {
        const diff = new Date() - date;
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        return `Hace ${Math.floor(hours / 24)} días`;
    }

    setupAutoRefresh() {
        setInterval(() => this.loadNotificaciones(), 30000);
        setInterval(() => this.loadAllData(), 300000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => { new Dashboard(); });