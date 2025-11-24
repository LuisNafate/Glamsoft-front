// Gestión de Comentarios Estilista
class ComentariosEstilista {
    constructor() {
        this.comentarios = [];
        this.filteredComentarios = [];
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al inicializar comentarios', 'error');
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
            const user = StateManager.get('user');
            let response;
            if (user && user.id) {
                // Asumiendo que el servicio puede filtrar por estilista
                response = await ComentariosService.getAll({ estilistaId: user.id });
            } else {
                response = await ComentariosService.getAll();
            }
            
            console.log('loadComentarios - Response completo:', response);
            
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
                </div>
            `;
        }).join('');
    }

    formatFecha(fecha) {
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

let comentariosEstilista;

document.addEventListener('DOMContentLoaded', () => {
    comentariosEstilista = new ComentariosEstilista();
});