// Gestión de Comentarios Públicos
class ComentariosPublicos {
    constructor() {
        this.comentarios = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            this.checkAuth();
            this.setupEventListeners();
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al cargar comentarios', 'error');
        }
    }

    checkAuth() {
        // Verificar si hay usuario logueado
        this.currentUser = StateManager.getState('user');
        
        const loginPrompt = document.getElementById('loginPrompt');
        const comentarioForm = document.getElementById('comentarioForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!this.currentUser) {
            if (loginPrompt) loginPrompt.style.display = 'flex';
            if (comentarioForm) {
                const textarea = comentarioForm.querySelector('textarea');
                if (textarea) textarea.disabled = true;
            }
            if (submitBtn) submitBtn.disabled = true;
        } else {
            if (loginPrompt) loginPrompt.style.display = 'none';
        }
    }

    setupEventListeners() {
        const form = document.getElementById('comentarioForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComentario();
            });
        }
    }

    async loadComentarios() {
        this.showLoader();
        
        try {
            const response = await ComentariosService.getAll();
            console.log('loadComentarios - Response:', response);
            
            // Extraer datos según estructura de respuesta
            const comentariosData = response.data?.data || response.data || [];
            console.log('loadComentarios - Comentarios:', comentariosData);
            
            this.comentarios = comentariosData;
            this.renderComentarios();
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            this.showNotification('Error al cargar comentarios', 'error');
            this.comentarios = [];
            this.renderComentarios();
        } finally {
            this.hideLoader();
        }
    }

    renderComentarios() {
        const container = document.getElementById('comentariosLista');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        if (this.comentarios.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Ordenar por fecha más reciente primero
        const comentariosOrdenados = [...this.comentarios].sort((a, b) => {
            const fechaA = this.parseFecha(a.fecha);
            const fechaB = this.parseFecha(b.fecha);
            return fechaB - fechaA;
        });
        
        container.innerHTML = comentariosOrdenados.map(comentario => {
            const clienteNombre = comentario.cliente?.nombre || 'Usuario Anónimo';
            const iniciales = clienteNombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
            const fechaFormateada = this.formatFecha(comentario.fecha);
            const textoComentario = comentario.contenido || comentario.comentario || '';
            
            return `
                <div class="comment-card">
                    <div class="comment-header">
                        <div class="user-avatar">${iniciales}</div>
                        <div class="user-info">
                            <h4>${clienteNombre}</h4>
                            <div class="comment-date">
                                <i class="fas fa-clock"></i> ${fechaFormateada}
                            </div>
                        </div>
                    </div>
                    
                    <div class="comment-text">
                        ${textoComentario}
                    </div>
                </div>
            `;
        }).join('');
    }

    async submitComentario() {
        if (!this.currentUser) {
            this.showNotification('Debes iniciar sesión para comentar', 'error');
            return;
        }

        const textarea = document.getElementById('comentarioText');
        const contenido = textarea.value.trim();
        
        if (!contenido) {
            this.showNotification('Por favor escribe un comentario', 'error');
            return;
        }

        if (contenido.length < 10) {
            this.showNotification('El comentario debe tener al menos 10 caracteres', 'error');
            return;
        }

        this.showLoader();
        
        try {
            const comentarioData = {
                idCliente: this.currentUser.idCliente || this.currentUser.idUsuario,
                comentario: contenido
                // No enviamos idCita si no existe para evitar null
            };
            
            console.log('submitComentario - Enviando:', comentarioData);
            
            const response = await ComentariosService.create(comentarioData);
            console.log('submitComentario - Response:', response);
            
            this.showNotification('¡Comentario publicado exitosamente!', 'success');
            
            // Limpiar formulario
            textarea.value = '';
            
            // Recargar comentarios
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al publicar comentario:', error);
            this.showNotification('Error al publicar comentario. Intenta de nuevo.', 'error');
        } finally {
            this.hideLoader();
        }
    }

    parseFecha(fecha) {
        // Manejar formato de array [year, month, day, hour, minute, second]
        if (Array.isArray(fecha)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = fecha;
            return new Date(year, month - 1, day, hour, minute, second);
        }
        
        // Fallback para fechas en formato ISO
        return new Date(fecha);
    }

    formatFecha(fecha) {
        const date = this.parseFecha(fecha);
        const ahora = new Date();
        const diferencia = ahora - date;
        
        // Menos de 1 minuto
        if (diferencia < 60000) {
            return 'Hace un momento';
        }
        
        // Menos de 1 hora
        if (diferencia < 3600000) {
            const minutos = Math.floor(diferencia / 60000);
            return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
        }
        
        // Menos de 24 horas
        if (diferencia < 86400000) {
            const horas = Math.floor(diferencia / 3600000);
            return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
        }
        
        // Menos de 7 días
        if (diferencia < 604800000) {
            const dias = Math.floor(diferencia / 86400000);
            return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
        }
        
        // Fecha completa
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 12px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ComentariosPublicos();
});
