// Gestión de Comentarios Admin
class ComentariosAdmin {
    constructor() {
        this.comentarios = [];
        this.filteredComentarios = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al inicializar comentarios', 'error');
        }
    }

    async checkAuth() {
        const user = StateManager.getState('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }

    setupEventListeners() {
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterComentarios();
        });
    }

    async loadComentarios() {
        this.showLoader();
        
        try {
            const response = await ComentariosService.getAll();
            console.log('loadComentarios - Response completo:', response);
            
            // Manejar estructura de respuesta: {data: [...], message: "...", status: "success"}
            const comentariosData = response.data?.data || response.data || [];
            console.log('loadComentarios - Comentarios extraídos:', comentariosData);
            
            this.comentarios = comentariosData;
            this.filteredComentarios = [...this.comentarios];
            this.renderComentarios();
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            this.showNotification('Error al cargar comentarios', 'error');
            this.comentarios = [];
            this.filteredComentarios = [];
            this.renderComentarios();
        } finally {
            this.hideLoader();
        }
    }

    filterComentarios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredComentarios = this.comentarios.filter(comentario => {
            const contenido = (comentario.contenido || comentario.comentario || '').toLowerCase();
            const clienteNombre = (comentario.cliente?.nombre || '').toLowerCase();
            
            return contenido.includes(searchTerm) || clienteNombre.includes(searchTerm);
        });
        
        this.renderComentarios();
    }

    renderComentarios() {
        const container = document.getElementById('comentariosContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        if (this.filteredComentarios.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = this.filteredComentarios.map(comentario => {
            const clienteNombre = comentario.cliente?.nombre || 'Usuario Anónimo';
            const iniciales = clienteNombre.charAt(0).toUpperCase();
            const fechaFormateada = this.formatFecha(comentario.fecha);
            // La API retorna 'contenido' pero puede venir como 'comentario'
            const textoComentario = comentario.contenido || comentario.comentario || '';
            
            return `
                <div class="comment-card">
                    <div class="comment-header">
                        <div class="comment-user">
                            <div class="user-avatar">${iniciales}</div>
                            <div class="user-info">
                                <h4>${clienteNombre}</h4>
                                <div class="comment-date">${fechaFormateada}</div>
                            </div>
                        </div>
                        <div>
                            ${comentario.cita ? `
                                <span class="comment-badge" style="background: #3498db; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    <i class="fas fa-calendar"></i> Cita #${comentario.cita.idCita}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="comment-text">
                        ${textoComentario}
                    </div>
                    
                    <div class="comment-actions">
                        <button class="btn btn-danger btn-sm" onclick="comentariosAdmin.deleteComentario(${comentario.idComentario})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteComentario(id) {
        if (!confirm('¿Estás seguro de eliminar este comentario?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await ComentariosService.delete(id);
            this.showNotification('Comentario eliminado correctamente', 'success');
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            this.showNotification('Error al eliminar comentario', 'error');
        } finally {
            this.hideLoader();
        }
    }

    formatFecha(fecha) {
        // Manejar formato de array [year, month, day, hour, minute, second]
        if (Array.isArray(fecha)) {
            const [year, month, day, hour = 0, minute = 0] = fecha;
            const date = new Date(year, month - 1, day, hour, minute);
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Fallback para fechas en formato ISO
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

let comentariosAdmin;

document.addEventListener('DOMContentLoaded', () => {
    comentariosAdmin = new ComentariosAdmin();
});
