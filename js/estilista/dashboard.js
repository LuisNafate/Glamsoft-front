// Dashboard Estilista - Lógica Principal
class DashboardEstilista {
    constructor() {
        this.notificacionesData = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupMenus(); // Configura ambos menús
            await this.loadMyData();
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
            // 1. Obtener Usuario
            let user = null;
            if (typeof StateManager !== 'undefined') {
                user = StateManager.get('user');
            }
            if (!user) {
                const userStr = localStorage.getItem('user_data');
                if (userStr) user = JSON.parse(userStr);
            }
            
            // 2. Validar Rol (1=Admin, 2=Estilista)
            const rol = user ? parseInt(user.idRol || user.rol) : 0;
            
            if (!user || (rol !== 2 && rol !== 1)) { 
                console.warn("Acceso denegado para Estilista. Redirigiendo...");
                window.location.href = '../inicio.html';
                return;
            }

            // 3. Poner Nombre en UI
            const nombre = user.nombre || 'Estilista';
            document.getElementById('userName').textContent = nombre;
            const menuName = document.getElementById('menuUserName');
            if(menuName) menuName.textContent = nombre;

            this.currentUser = user;
            // El ID puede venir como 'idUsuario' o 'id'
            this.currentUserId = user.idUsuario || user.id;

        } catch (error) {
            console.error("Error auth:", error);
            window.location.href = '../inicio.html';
        }
    }

    // ✅ CONFIGURACIÓN DE MENÚS (PERFIL + NOTIFICACIONES)
    setupMenus() {
        // A. Menú Perfil
        const userIcon = document.getElementById('stylistUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu('profile');
            });
        }

        // B. Menú Notificaciones
        const notifIcon = document.getElementById('notificationIcon');
        const notifMenu = document.getElementById('notificationMenu');

        if (notifIcon && notifMenu) {
            notifIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu('notification');
            });
        }

        // Clic fuera cierra todo
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (profileMenu && profileMenu.style.display === 'block' && !profileMenu.contains(target) && !userIcon.contains(target)) {
                profileMenu.style.display = 'none';
            }
            if (notifMenu && notifMenu.style.display === 'block' && !notifMenu.contains(target) && !notifIcon.contains(target)) {
                notifMenu.style.display = 'none';
            }
        });

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    await AuthService.logout();
                    window.location.href = '../inicio.html';
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

    async loadMyData() {
        this.showLoader();
        try {
            await Promise.all([
                this.loadCitas(),
                this.loadNotificaciones() // Cargar notificaciones junto con citas
            ]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            this.hideLoader();
        }
    }

    async loadCitas() {
        try {
            const citasResponse = await CitasService.getAll(); 
            const todasLasCitas = citasResponse.data || citasResponse || [];
            
            // FILTRAR SOLO CITAS DE ESTE ESTILISTA
            const misCitas = todasLasCitas.filter(cita => {
                const cIdEstilista = cita.idEstilista || (cita.estilista ? cita.estilista.id : 0);
                return cIdEstilista == this.currentUserId;
            });

            // Estadísticas
            const hoy = new Date().toISOString().split('T')[0];
            const citasHoy = misCitas.filter(c => {
                const fecha = c.fecha || (c.fechaHoraCita ? c.fechaHoraCita.split('T')[0] : '');
                return fecha === hoy;
            });
            
            const pendientes = misCitas.filter(c => (c.estado || c.estadoCita || '').toLowerCase() === 'pendiente');

            document.getElementById('citasHoy').textContent = citasHoy.length;
            document.getElementById('citasPendientes').textContent = pendientes.length;
            
            // Renderizar lista
            this.renderUpcomingAppointments(misCitas);

        } catch (error) {
            console.error('Error cargando citas:', error);
        }
    }

    // ✅ CARGAR Y FILTRAR NOTIFICACIONES DEL USUARIO
    async loadNotificaciones() {
        try {
            const response = await NotificacionesService.getAll();
            const todas = response.data || response || [];
            
            // Filtrar solo las que pertenecen a este usuario (Estilista)
            // Asumimos que la notificación tiene 'idUsuario' o 'id_usuario'
            this.notificacionesData = todas.filter(n => 
                n.idUsuario == this.currentUserId || n.id_usuario == this.currentUserId
            );
            
            // Ordenar
            this.notificacionesData.sort((a, b) => {
                if (a.leida === b.leida) return new Date(b.fecha) - new Date(a.fecha);
                return a.leida ? 1 : -1;
            });

            const noLeidas = this.notificacionesData.filter(n => !n.leida);
            
            // Badge
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = noLeidas.length;
                badge.style.display = noLeidas.length > 0 ? 'flex' : 'none';
            }

            // Renderizar
            this.renderNotificationList();

        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
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
                <div class="notification-item ${!notif.leida ? 'unread' : ''}">
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

    renderUpcomingAppointments(citas) {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        const futuras = citas
            .filter(c => {
                const estado = (c.estado || c.estadoCita || '').toLowerCase();
                return estado === 'confirmada';
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fecha || a.fechaHoraCita);
                const fechaB = new Date(b.fecha || b.fechaHoraCita);
                return fechaA - fechaB;
            })
            .slice(0, 5);

        if (futuras.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #999; background: #f9f9f9; border-radius: 8px;">
                    <i class="ph ph-calendar-x" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>No tienes citas próximas confirmadas.</p>
                </div>`;
            return;
        }

        container.innerHTML = futuras.map(cita => {
            let fecha = 'S/F';
            let hora = '--:--';
            if (cita.fechaHoraCita) {
                const partes = cita.fechaHoraCita.split('T');
                fecha = partes[0];
                hora = partes[1].substring(0, 5);
            } else if (cita.fecha) {
                fecha = cita.fecha;
                hora = cita.hora ? cita.hora.substring(0, 5) : '';
            }

            const fechaObj = new Date(fecha);
            const fechaLegible = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            const cliente = cita.clienteNombre || (cita.cliente ? cita.cliente.nombre : 'Cliente');
            
            let servicio = 'Servicio General';
            if (cita.servicios && Array.isArray(cita.servicios) && cita.servicios.length > 0) {
                servicio = cita.servicios[0].nombre || cita.servicios[0];
                if (cita.servicios.length > 1) servicio += ` (+${cita.servicios.length - 1})`;
            } else if (cita.servicioNombre) {
                servicio = cita.servicioNombre;
            }

            return `
                <div class="activity-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: #f0f0f0; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #B8860B; font-weight: bold;">
                            ${cliente.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="activity-text" style="font-weight: 700; color: #333;">${cliente}</div>
                            <div class="activity-time" style="font-size: 13px; color: #777;">${servicio}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: #2c3e50; font-size: 16px;">${hora}</div>
                        <div style="font-size: 12px; color: #999; text-transform: capitalize;">${fechaLegible}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTimeShort(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        return `${date.getDate()}/${date.getMonth()+1}`;
    }

    setupAutoRefresh() {
        setInterval(() => this.loadMyData(), 60000);
    }

    showLoader() { 
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'flex'; 
    }
    
    hideLoader() { 
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'none'; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardEstilista();
});