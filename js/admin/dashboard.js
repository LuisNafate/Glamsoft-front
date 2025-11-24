// Dashboard Admin - Lógica Principal
class Dashboard {
    constructor() {
        this.notificacionesData = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupMenus(); 
            await this.loadAllData();
            this.setupAutoRefresh();
            
            // Cerrar menús al hacer scroll
            window.addEventListener('scroll', () => {
                this.closeMenus();
            });
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
        }
    }

    async checkAuth() {
        try {
            // ✅ CORRECCIÓN: Usar .get('user') o leer localStorage directamente
            let user = null;
            if (typeof StateManager !== 'undefined') {
                user = StateManager.get('user'); // .get() es el método correcto
            }
            if (!user) {
                const userStr = localStorage.getItem('user_data');
                if (userStr) user = JSON.parse(userStr);
            }

            const nombreReal = user ? user.nombre : 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;
        } catch (error) {
            console.error("Error auth:", error);
        }
    }

    setupMenus() {
        // 1. Menú de Perfil
        const userIcon = document.getElementById('adminUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu('profile');
            });
        }

        // 2. ✅ Menú de Notificaciones
        const notifIcon = document.getElementById('notificationIcon');
        const notifMenu = document.getElementById('notificationMenu');

        if (notifIcon && notifMenu) {
            notifIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu('notification');
            });
        }

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (profileMenu && profileMenu.style.display === 'block' && !profileMenu.contains(target) && !userIcon.contains(target)) {
                profileMenu.style.display = 'none';
            }
            if (notifMenu && notifMenu.style.display === 'block' && !notifMenu.contains(target) && !notifIcon.contains(target)) {
                notifMenu.style.display = 'none';
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

    toggleMenu(type) {
        const profileMenu = document.getElementById('profileMenuModal');
        const notifMenu = document.getElementById('notificationMenu');

        if (type === 'profile') {
            if (notifMenu) notifMenu.style.display = 'none'; 
            if (profileMenu) profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
        } else if (type === 'notification') {
            if (profileMenu) profileMenu.style.display = 'none'; 
            if (notifMenu) notifMenu.style.display = (notifMenu.style.display === 'block') ? 'none' : 'block';
        }
    }

    closeMenus() {
        const profileMenu = document.getElementById('profileMenuModal');
        const notifMenu = document.getElementById('notificationMenu');
        if (profileMenu) profileMenu.style.display = 'none';
        if (notifMenu) notifMenu.style.display = 'none';
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
        } finally {
            this.hideLoader();
        }
    }

    // ... Métodos loadCitas, loadServicios, loadEstilistas (mantenlos igual) ...
    async loadCitas() { try { const r = await CitasService.getAll(); const d = r.data || []; const h = new Date().toISOString().split('T')[0]; return { total: d.filter(c => c.fecha === h).length, pendientes: d.filter(c => c.estado === 'pendiente').length, todas: d }; } catch (e) { return { total: 0, pendientes: 0, todas: [] }; } }
    async loadServicios() { try { const r = await ServiciosService.getAll(); const d = r.data || []; return { total: d.filter(s => s.activo !== false).length, todos: d }; } catch (e) { return { total: 0, todos: [] }; } }
    async loadEstilistas() { try { const r = await EstilistasService.getAll(); const d = r.data || []; return { total: d.length, todos: d }; } catch (e) { return { total: 0, todos: [] }; } }

    // ✅ LOGICA DE NOTIFICACIONES ACTUALIZADA
    async loadNotificaciones() {
        try {
            const response = await NotificacionesService.getAll();
            this.notificacionesData = response.data || response || [];
            
            // Ordenar: No leídas primero
            this.notificacionesData.sort((a, b) => {
                if (a.leida === b.leida) return new Date(b.fecha) - new Date(a.fecha);
                return a.leida ? 1 : -1;
            });

            const noLeidas = this.notificacionesData.filter(n => !n.leida);
            
            // 1. Badge
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = noLeidas.length;
                badge.style.display = noLeidas.length > 0 ? 'flex' : 'none';
            }

            // 2. Renderizar Lista
            this.renderNotificationList();
            
            return noLeidas;
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            return [];
        }
    }

    renderNotificationList() {
        const listContainer = document.getElementById('notificationList');
        if (!listContainer) return;

        if (this.notificacionesData.length === 0) {
            listContainer.innerHTML = '<div class="empty-notif">No tienes notificaciones</div>';
            return;
        }

        const toShow = this.notificacionesData.slice(0, 8);

        listContainer.innerHTML = toShow.map(notif => {
            const tipo = notif.tipo ? notif.tipo.toLowerCase() : 'info';
            const iconClass = { 'cita': 'ph-calendar', 'sistema': 'ph-gear', 'usuario': 'ph-user' }[tipo] || 'ph-bell';
            const stateClass = { 'cita': 'success', 'sistema': 'warning', 'error': 'error' }[tipo] || 'info';

            return `
                <div class="notification-item ${!notif.leida ? 'unread' : ''}" onclick="window.location.href='notificaciones.html'">
                    <div class="notif-icon-box ${stateClass}">
                        <i class="ph ${iconClass}"></i>
                    </div>
                    <div class="notif-info">
                        <div class="notif-header">
                            <span class="notif-title">${notif.titulo}</span>
                            <span class="notif-time">${this.formatTimeShort(notif.fecha)}</span>
                        </div>
                        <div class="notif-desc">${notif.mensaje}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTimeShort(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        if (diffMins < 1440) return `${Math.floor(diffMins/60)}h`;
        return `${date.getDate()}/${date.getMonth()+1}`;
    }

    // ... (updateStats, loadActivities, formatTime, setupAutoRefresh, loaders) ...
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
            const notifs = response.data || [];
            const recent = notifs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
            
            if (recent.length === 0) {
                container.innerHTML = `<div class="activity-item"><div class="activity-text">No hay actividad reciente</div></div>`;
                return;
            }
            container.innerHTML = recent.map(n => `
                <div class="activity-item">
                    <div class="activity-time">${this.formatTime(new Date(n.fecha))}</div>
                    <div class="activity-text">${n.mensaje}</div>
                </div>
            `).join('');
        } catch (error) { container.innerHTML = ''; }
    }
    
    formatTime(date) { return date.toLocaleDateString(); }
    setupAutoRefresh() { setInterval(() => this.loadNotificaciones(), 30000); setInterval(() => this.loadAllData(), 300000); }
    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => { new Dashboard(); });