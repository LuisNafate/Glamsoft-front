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
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterComentarios();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterComentarios();
        });
        
        document.getElementById('filterCalificacion')?.addEventListener('change', () => {
            this.filterComentarios();
        });
    }

    async loadComentarios() {
        this.showLoader();
        
        try {
            const response = await ValoracionesService.getAll();
            this.comentarios = response.data || [];
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
        const estadoFilter = document.getElementById('filterEstado').value;
        const calificacionFilter = document.getElementById('filterCalificacion').value;
        
        this.filteredComentarios = this.comentarios.filter(comentario => {
            const matchesSearch = comentario.comentario.toLowerCase().includes(searchTerm) ||
                                (comentario.usuario_nombre || '').toLowerCase().includes(searchTerm);
            
            const matchesEstado = !estadoFilter || comentario.estado === estadoFilter;
            
            const matchesCalificacion = !calificacionFilter || 
                                      comentario.calificacion === parseInt(calificacionFilter);
            
            return matchesSearch && matchesEstado && matchesCalificacion;
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
            const iniciales = (comentario.usuario_nombre || 'U').charAt(0).toUpperCase();
            const stars = '★'.repeat(comentario.calificacion) + '☆'.repeat(5 - comentario.calificacion);
            
            return `
                <div class="comment-card">
                    <div class="comment-header">
                        <div class="comment-user">
                            <div class="user-avatar">${iniciales}</div>
                            <div class="user-info">
                                <h4>${comentario.usuario_nombre || 'Usuario Anónimo'}</h4>
                                <div class="comment-date">${this.formatFecha(comentario.fecha)}</div>
                            </div>
                        </div>
                        <div>
                            <div class="rating-stars">${stars}</div>
                            <span class="comment-status ${comentario.estado || 'pendiente'}">
                                ${this.getEstadoText(comentario.estado)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="comment-text">
                        ${comentario.comentario}
                    </div>
                    
                    ${comentario.servicio_nombre ? `
                        <div style="font-size: 13px; color: #7f8c8d; margin-bottom: 15px;">
                            <i class="fas fa-concierge-bell"></i> ${comentario.servicio_nombre}
                        </div>
                    ` : ''}
                    
                    <div class="comment-actions">
                        ${comentario.estado !== 'aprobado' ? `
                            <button class="btn btn-success btn-sm" onclick="comentariosAdmin.updateEstado(${comentario.id}, 'aprobado')">
                                <i class="fas fa-check"></i> Aprobar
                            </button>
                        ` : ''}
                        
                        ${comentario.estado !== 'rechazado' ? `
                            <button class="btn btn-danger btn-sm" onclick="comentariosAdmin.updateEstado(${comentario.id}, 'rechazado')">
                                <i class="fas fa-times"></i> Rechazar
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-secondary btn-sm" onclick="comentariosAdmin.deleteComentario(${comentario.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getEstadoText(estado) {
        const estados = {
            'aprobado': 'Aprobado',
            'pendiente': 'Pendiente',
            'rechazado': 'Rechazado'
        };
        return estados[estado] || 'Pendiente';
    }

    async updateEstado(id, nuevoEstado) {
        this.showLoader();
        
        try {
            const comentario = this.comentarios.find(c => c.id === id);
            if (!comentario) throw new Error('Comentario no encontrado');
            
            await ValoracionesService.update(id, {
                ...comentario,
                estado: nuevoEstado
            });
            
            this.showNotification(
                `Comentario ${nuevoEstado === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente`, 
                'success'
            );
            
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            this.showNotification('Error al actualizar comentario', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async deleteComentario(id) {
        if (!confirm('¿Estás seguro de eliminar este comentario?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await ValoracionesService.delete(id);
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
