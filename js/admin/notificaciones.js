// Gestión de Notificaciones Admin
class NotificacionesAdmin {
    constructor() {
        this.notificaciones = [];
        this.currentTab = 'todas';
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadNotificaciones();
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
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });
        
        // Marcar todas como leídas
        document.getElementById('btnMarcarTodas')?.addEventListener('click', () => {
            this.marcarTodasLeidas();
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Actualizar UI de tabs
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
        
        // Renderizar notificaciones filtradas
        this.renderNotificaciones();
    }

    async loadNotificaciones() {
        this.showLoader();
        
        try {
            const response = await NotificacionesService.getAll();
            this.notificaciones = response.data || [];
            
            // Actualizar badges
            this.updateBadges();
            
            // Renderizar
            this.renderNotificaciones();
            
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            this.showNotification('Error al cargar notificaciones', 'error');
            this.notificaciones = [];
            this.renderNotificaciones();
        } finally {
            this.hideLoader();
        }
    }

    updateBadges() {
        const total = this.notificaciones.length;
        const noLeidas = this.notificaciones.filter(n => !n.leida).length;
        
        document.getElementById('badgeTodas').textContent = total;
        document.getElementById('badgeNoLeidas').textContent = noLeidas;
        
        // Mostrar/ocultar badge de no leídas
        const badgeNoLeidas = document.getElementById('badgeNoLeidas');
        if (badgeNoLeidas) {
            badgeNoLeidas.style.display = noLeidas > 0 ? 'inline' : 'none';
        }
    }

    getFilteredNotificaciones() {
        switch (this.currentTab) {
            case 'no-leidas':
                return this.notificaciones.filter(n => !n.leida);
            case 'citas':
                return this.notificaciones.filter(n => n.tipo === 'cita');
            case 'sistema':
                return this.notificaciones.filter(n => n.tipo === 'sistema');
            default:
                return this.notificaciones;
        }
    }

    renderNotificaciones() {
        const container = document.getElementById('notificacionesContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        const filteredNotifs = this.getFilteredNotificaciones();
        
        if (filteredNotifs.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = filteredNotifs.map(notif => {
            const iconMap = {
                'cita': 'fa-calendar-check',
                'comentario': 'fa-comment',
                'sistema': 'fa-cog',
                'usuario': 'fa-user',
                'pago': 'fa-dollar-sign'
            };
            
            const typeMap = {
                'cita': 'info',
                'comentario': 'success',
                'sistema': 'warning',
                'error': 'error'
            };
            
            const icon = iconMap[notif.tipo] || 'fa-bell';
            const type = typeMap[notif.tipo] || 'info';
            
            return `
                <div class="notif-card ${!notif.leida ? 'unread' : ''}">
                    <div class="notif-icon ${type}">
                        <i class="fas ${icon}"></i>
                    </div>
                    
                    <div class="notif-content">
                        <div class="notif-title">${notif.titulo}</div>
                        <div class="notif-message">${notif.mensaje}</div>
                        <div class="notif-time">
                            <i class="fas fa-clock"></i> ${this.formatTiempo(notif.fecha)}
                        </div>
                    </div>
                    
                    <div class="notif-actions">
                        ${!notif.leida ? `
                            <button class="btn-icon" style="background: var(--admin-success); color: white;" 
                                    onclick="notificacionesAdmin.marcarLeida(${notif.id})" title="Marcar como leída">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon delete" 
                                onclick="notificacionesAdmin.deleteNotificacion(${notif.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async marcarLeida(id) {
        try {
            const notif = this.notificaciones.find(n => n.id === id);
            if (!notif) return;
            
            await NotificacionesService.marcarLeida(id);
            notif.leida = true;
            
            this.updateBadges();
            this.renderNotificaciones();
            
        } catch (error) {
            console.error('Error al marcar notificación:', error);
            this.showNotification('Error al actualizar notificación', 'error');
        }
    }

    async marcarTodasLeidas() {
        if (this.notificaciones.filter(n => !n.leida).length === 0) {
            this.showNotification('No hay notificaciones sin leer', 'info');
            return;
        }
        
        this.showLoader();
        
        try {
            // Marcar todas como leídas
            await Promise.all(
                this.notificaciones
                    .filter(n => !n.leida)
                    .map(n => NotificacionesService.marcarLeida(n.id))
            );
            
            this.notificaciones.forEach(n => n.leida = true);
            
            this.showNotification('Todas las notificaciones marcadas como leídas', 'success');
            this.updateBadges();
            this.renderNotificaciones();
            
        } catch (error) {
            console.error('Error al marcar notificaciones:', error);
            this.showNotification('Error al actualizar notificaciones', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async deleteNotificacion(id) {
        if (!confirm('¿Eliminar esta notificación?')) {
            return;
        }
        
        try {
            await NotificacionesService.delete(id);
            this.notificaciones = this.notificaciones.filter(n => n.id !== id);
            
            this.showNotification('Notificación eliminada', 'success');
            this.updateBadges();
            this.renderNotificaciones();
            
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            this.showNotification('Error al eliminar notificación', 'error');
        }
    }

    formatTiempo(fecha) {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diff = ahora - fechaNotif;
        
        const segundos = Math.floor(diff / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);
        
        if (segundos < 60) return 'Hace un momento';
        if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        if (dias < 7) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
        
        return fechaNotif.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            z-index: 10000;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
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

let notificacionesAdmin;

document.addEventListener('DOMContentLoaded', () => {
    notificacionesAdmin = new NotificacionesAdmin();
});
