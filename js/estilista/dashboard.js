// Dashboard Estilista - Lógica Principal
class DashboardEstilista {
    constructor() {
        this.notificacionesData = [];
        this.init();
    }

    async init() {
        try {
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
                const confirmed = await customConfirm(
                    '¿Estás seguro de que deseas cerrar sesión?',
                    'Cerrar Sesión',
                    { icon: 'ph-sign-out' }
                );
                if (confirmed) {
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

    async loadAllData() {
        this.showLoader();
        try {
            let user = StateManager.get('user');

            // Si no hay usuario en StateManager, intentar cargar desde localStorage
            if (!user) {
                const userStr = localStorage.getItem('user_data');
                if (userStr) {
                    user = JSON.parse(userStr);
                    StateManager.set('user', user);
                }
            }

            console.log('📋 Usuario completo desde StateManager/localStorage:', user);

            // IMPORTANTE: Obtener idEmpleado del usuario
            // Priorizar idEstilista, idEmpleado, luego intentar buscar por idUsuario
            let idEmpleado = user.idEstilista || user.id_estilista || user.idEmpleado || user.id_empleado;

            // Si el usuario ya tiene idEmpleado, usarlo directamente
            if (idEmpleado) {
                console.log('✅ idEmpleado encontrado en usuario:', idEmpleado);
            } else {
                console.log('⚠️ idEmpleado no encontrado en usuario, intentando user.id');
                // Solo usar user.id si no es el mismo que idUsuario
                if (user.id && user.id !== user.idUsuario) {
                    idEmpleado = user.id;
                }
            }

            // Si el valor parece ser el idUsuario (login) en lugar de idEmpleado, intentar mapear mediante EmpleadosService (rol 2 -> estilistas)
            if ((user.idUsuario || user.id_usuario) && (!idEmpleado || String(idEmpleado) === String(user.idUsuario || user.id_usuario))) {
                const userIdToMatch = user.idUsuario || user.id || user.id_usuario;
                console.log('⚠️ Dashboard: Intentando resolver idEmpleado para idUsuario:', userIdToMatch);

                try {
                    const respEmp = await EmpleadosService.getByRol(2);
                    const empleados = respEmp?.data || respEmp || [];

                    const matchEmp = empleados.find(emp => {
                        const usuarioCandidates = [emp.usuario?.idUsuario, emp.usuario?.id, emp.idUsuario, emp.id_usuario];
                        return usuarioCandidates.some(c => c !== undefined && c !== null && String(c) === String(userIdToMatch));
                    });

                    if (matchEmp) {
                        idEmpleado = matchEmp.idEstilista || matchEmp.idEmpleado || matchEmp.id || null;
                        console.log('✅ Dashboard: resolved idEmpleado via EmpleadosService.getByRol:', idEmpleado);

                        // Actualizar StateManager con el idEmpleado
                        user.idEmpleado = idEmpleado;
                        user.idEstilista = idEmpleado;
                        StateManager.set('user', user);
                        localStorage.setItem('user_data', JSON.stringify(user));
                    } else {
                        // Si no se encontró en empleados, intentar con EstilistasService
                        try {
                            const resp = await EstilistasService.getAll();
                            const estilistas = resp.data || resp || [];
                            const perfil = estilistas.find(e => {
                                const candidates = [e.idUsuario, e.id_usuario, e.usuario?.idUsuario, e.usuario?.id, e.id, e.idEstilista, e.id_estilista, e.idEmpleado, e.id_empleado];
                                return candidates.some(c => c !== undefined && c !== null && String(c) === String(userIdToMatch));
                            });
                            if (perfil) {
                                idEmpleado = perfil.idEstilista || perfil.id_estilista || perfil.idEmpleado || perfil.id || perfil.idEmpleado;
                                console.log('✅ Dashboard: resolved idEmpleado via EstilistasService (fallback):', idEmpleado);

                                // Actualizar StateManager
                                user.idEmpleado = idEmpleado;
                                user.idEstilista = idEmpleado;
                                StateManager.set('user', user);
                                localStorage.setItem('user_data', JSON.stringify(user));
                            }
                        } catch (e) {
                            console.warn('Dashboard: getAll estilistas falló en fallback', e);
                        }
                    }
                } catch (e) {
                    console.warn('Dashboard: EmpleadosService.getByRol(2) falló', e);
                }
            }

            console.log('🔑 Cargando citas para empleado ID:', idEmpleado);
            console.log('👤 Usuario completo:', user);

            const [citas, notificaciones] = await Promise.all([
                this.loadCitas(idEmpleado),
                this.loadNotificaciones()
            ]);
            this.updateStats(citas);
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

            // Calcular estadísticas
            const citasHoy = d.filter(c => {
                const fechaCita = c.fechaCita || c.fecha || '';
                return fechaCita === h;
            }).length;

            const citasPendientes = d.filter(c => {
                const estado = (c.estadoCita || c.estado || '').toUpperCase();
                return estado === 'PENDIENTE';
            }).length;

            const totalCitas = d.length;

            return {
                total: totalCitas,
                pendientes: citasPendientes,
                hoy: citasHoy,
                todas: d
            };
        } catch (e) {
            console.error('Error al cargar citas:', e);
            return { total: 0, pendientes: 0, hoy: 0, todas: [] };
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

    formatTimeShort(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        if (diffMins < 1440) return `${Math.floor(diffMins/60)}h`;
        return `${date.getDate()}/${date.getMonth()+1}`;
    }

    updateStats(citas) {
        const totalCitasEl = document.getElementById('totalCitas');
        const citasPendientesEl = document.getElementById('citasPendientes');
        const citasHoyEl = document.getElementById('citasHoy');

        if (totalCitasEl) totalCitasEl.textContent = citas.total || 0;
        if (citasPendientesEl) citasPendientesEl.textContent = citas.pendientes || 0;
        if (citasHoyEl) citasHoyEl.textContent = citas.hoy || 0;

        console.log('📊 Estadísticas actualizadas:', {
            total: citas.total,
            pendientes: citas.pendientes,
            hoy: citas.hoy
        });
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

    showLoader() {
        if (window.LoaderManager) {
            LoaderManager.show();
        } else {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'flex';
        }
    }

    hideLoader() {
        if (window.LoaderManager) {
            LoaderManager.hide();
        } else {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { new DashboardEstilista(); });

// Funciones globales para las acciones de confirmación
async function confirmarCita(idCita) {
    const confirmed = await customConfirm(
        '¿Confirmar esta cita?',
        'Confirmar Cita',
        { icon: 'ph-check-circle' }
    );

    if (!confirmed) return;

    try {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';

        await CitasService.aprobar(idCita);
        await customAlert(
            'Cita confirmada exitosamente',
            'Éxito',
            { type: 'success' }
        );
        window.location.reload();
    } catch (error) {
        console.error('Error al confirmar cita:', error);
        await customAlert(
            'Error al confirmar la cita',
            'Error',
            { type: 'error' }
        );
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

async function rechazarCita(idCita) {
    const motivo = await customPrompt(
        '¿Motivo del rechazo?',
        'Rechazar Cita',
        '',
        {
            placeholder: 'Ingrese el motivo del rechazo...',
            icon: 'ph-x-circle'
        }
    );

    if (!motivo) return;

    try {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';

        await CitasService.rechazar(idCita, motivo);
        await customAlert(
            'Cita rechazada',
            'Cita Rechazada',
            { type: 'warning' }
        );
        window.location.reload();
    } catch (error) {
        console.error('Error al rechazar cita:', error);
        await customAlert(
            'Error al rechazar la cita',
            'Error',
            { type: 'error' }
        );
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

function verDetalle(idCita) {
    window.location.href = `calendario.html?cita=${idCita}`;
}
