// Dashboard Estilista - Lógica Principal
class DashboardEstilista {
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
            let user = null;
            if (typeof StateManager !== 'undefined') {
                user = StateManager.get('user');
            }
            if (!user) {
                const userStr = localStorage.getItem('user_data');
                if (userStr) user = JSON.parse(userStr);
            }

            if (!user || (user.rol !== 'estilista' && user.rol !== 'admin')) {
                // window.location.href = '../login.html';
            }

            const nombreReal = user ? user.nombre : 'Estilista';
            
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

        // 2. Menú de Notificaciones
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
            const user = StateManager.get('user');
            
            // IMPORTANTE: Obtener idEmpleado del usuario
            // Puede venir como idEmpleado, id, o necesitar consulta adicional
            let idEmpleado = user.idEmpleado || user.id;
            
            // Si no tiene idEmpleado, intentar obtenerlo del backend
            if (!user.idEmpleado && user.id) {
                console.log('⚠️ Usuario no tiene idEmpleado, consultando al backend...');
                try {
                    const empleadoData = await EmpleadosService.getById(user.id);
                    idEmpleado = empleadoData.data?.idEmpleado || empleadoData.idEmpleado || user.id;
                    console.log('✅ idEmpleado obtenido del backend:', idEmpleado);
                    
                    // Actualizar StateManager con el idEmpleado
                    user.idEmpleado = idEmpleado;
                    StateManager.set('user', user);
                    localStorage.setItem('user_data', JSON.stringify(user));
                } catch (error) {
                    console.error('❌ Error al obtener idEmpleado:', error);
                }
            }
            
            console.log('🔑 Cargando citas para empleado ID:', idEmpleado);
            console.log('👤 Usuario completo:', user);
            
            const [citas, notificaciones] = await Promise.all([
                this.loadCitas(idEmpleado),
                this.loadNotificaciones()
            ]);
            this.updateStats(citas);
            await this.loadConfirmaciones(citas.todas);
            await this.loadActivities();
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            this.hideLoader();
        }
    }

    async loadCitas(estilistaId) {
        try {
            const r = await CitasService.getByEstilista(estilistaId);
            console.log('Respuesta de CitasService.getByEstilista:', r);
            const d = r.data?.data || r.data || [];
            const h = new Date().toISOString().split('T')[0];
            return {
                total: d.filter(c => (c.fechaCita || c.fecha) === h).length,
                pendientes: d.filter(c => (c.estadoCita || c.estado) === 'pendiente').length,
                todas: d
            };
        } catch (e) {
            console.error('Error al cargar citas:', e);
            return { total: 0, pendientes: 0, todas: [] };
        }
    }

    async loadNotificaciones() {
        try {
            const response = await NotificacionesService.getAll();
            this.notificacionesData = response.data || response || [];
            
            this.notificacionesData.sort((a, b) => {
                if (a.leida === b.leida) return new Date(b.fecha) - new Date(a.fecha);
                return a.leida ? 1 : -1;
            });

            const noLeidas = this.notificacionesData.filter(n => !n.leida);
            
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = noLeidas.length;
                badge.style.display = noLeidas.length > 0 ? 'flex' : 'none';
            }

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

    updateStats(citas) {
        document.getElementById('totalCitas').textContent = citas.total;
        document.getElementById('citasPendientes').textContent = citas.pendientes;
    }

    async loadConfirmaciones(todasCitas) {
        const table = document.getElementById('confirmacionesTable');
        if (!table) return;

        try {
            // Filtrar solo citas pendientes de confirmación
            const pendientes = todasCitas.filter(c => 
                (c.estadoCita || c.estado) === 'pendiente'
            ).slice(0, 5); // Mostrar máximo 5

            if (pendientes.length === 0) {
                table.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px; color: #7f8c8d;">
                            No tienes confirmaciones pendientes
                        </td>
                    </tr>
                `;
                return;
            }

            table.innerHTML = pendientes.map(cita => {
                const fecha = cita.fechaCita || cita.fecha || '';
                const hora = cita.horaCita || cita.hora || '';
                const cliente = cita.nombreCliente || cita.cliente || 'Sin nombre';
                const servicio = cita.nombreServicio || cita.servicio || 'Sin servicio';
                
                return `
                    <tr>
                        <td>${cliente}</td>
                        <td>${servicio}</td>
                        <td>${fecha}</td>
                        <td>${hora}</td>
                        <td>
                            <span class="badge badge-warning">Pendiente</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="confirmarCita(${cita.idCita})" title="Confirmar">
                                <i class="ph ph-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="rechazarCita(${cita.idCita})" title="Rechazar">
                                <i class="ph ph-x"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="verDetalle(${cita.idCita})" title="Ver detalle">
                                <i class="ph ph-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error al cargar confirmaciones:', error);
            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">
                        Error al cargar confirmaciones
                    </td>
                </tr>
            `;
        }
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

document.addEventListener('DOMContentLoaded', () => { new DashboardEstilista(); });

// Funciones globales para las acciones de confirmación
async function confirmarCita(idCita) {
    if (!confirm('¿Confirmar esta cita?')) return;
    
    try {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        
        await CitasService.aprobar(idCita);
        alert('Cita confirmada exitosamente');
        window.location.reload();
    } catch (error) {
        console.error('Error al confirmar cita:', error);
        alert('Error al confirmar la cita');
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

async function rechazarCita(idCita) {
    const motivo = prompt('¿Motivo del rechazo?');
    if (!motivo) return;
    
    try {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        
        await CitasService.rechazar(idCita, motivo);
        alert('Cita rechazada');
        window.location.reload();
    } catch (error) {
        console.error('Error al rechazar cita:', error);
        alert('Error al rechazar la cita');
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

function verDetalle(idCita) {
    window.location.href = `calendario.html?cita=${idCita}`;
}
