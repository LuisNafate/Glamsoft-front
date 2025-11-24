// Gestión de Comentarios Admin
class ComentariosAdmin {
    constructor() {
        this.comentarios = [];
        this.filteredComentarios = [];
        this.init();
    }

    async init() {
        try {
            // Comentar verificación de auth temporalmente para debug
            // await this.checkAuth();
            this.setupEventListeners();
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al inicializar comentarios', 'error');
        }
    }

async checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user_data') || 'null');
            
            // 🔒 SEGURIDAD: Solo Rol 1 (Admin) puede estar aquí
            if (!user || user.idRol !== 1) {
                console.warn("Acceso denegado: No eres Administrador.");
                window.location.href = '../inicio.html';
                return; // Detener ejecución
            }

            // Actualizar interfaz con datos del usuario
            const nombreReal = user.nombre || 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error de sesión:", error);
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
            
            const comentariosData = response.data?.data || response.data || [];
            console.log('loadComentarios - Comentarios iniciales:', comentariosData);

            // Además obtener valoraciones (como en inicio.js) para enriquecer comentarios que no traen cita/servicio
            let valoraciones = [];
            try {
                const valResp = await ValoracionesService.getAll();
                valoraciones = valResp?.data?.data || valResp?.data || valResp || [];
                console.log('loadComentarios - Valoraciones obtenidas para enriquecimiento:', valoraciones.length);
            } catch (e) {
                console.warn('No se pudieron obtener valoraciones para enriquecer comentarios:', e);
            }

            // Enriquecer cada comentario con los detalles de su cita
            const comentariosEnriquecidos = await Promise.all(
                comentariosData.map(async (comentario) => {
                    // El comentario puede traer la cita como objeto o solo un id
                    const idCita = comentario.id_cita || comentario.idCita;

                    // Si la API ya incluyó la cita como objeto, usarla (evita fetch adicional)
                    if (comentario.cita && typeof comentario.cita === 'object') {
                        console.log('ComentariosAdmin: comentario ya trae objeto cita:', comentario.cita);
                        // Normalizar por si la cita viene envuelta
                        comentario.cita = comentario.cita?.data?.data || comentario.cita?.data || comentario.cita;
                    } else if (idCita) {
                        try {
                            console.log(`ComentariosAdmin: buscando cita para comentario ${comentario.idComentario || comentario.id || comentario._id} -> idCita:`, idCita);

                            // CitasService.getById puede devolver diferentes estructuras
                            const citaResp = await CitasService.getById(idCita);
                            console.log(`ComentariosAdmin: respuesta raw de CitasService.getById(${idCita}):`, citaResp);

                            // Normalizar: preferir `data.data` si existe, luego `data`, luego el objeto mismo
                            const cita = citaResp?.data?.data || citaResp?.data || citaResp || null;
                            console.log(`ComentariosAdmin: cita normalizada para id ${idCita}:`, cita);

                            // Adjuntamos el objeto cita normalizado al comentario
                            comentario.cita = cita;
                        } catch (e) {
                            console.error(`Error al obtener detalles para la cita ${idCita}:`, e);
                            comentario.cita = null; // Marcar que no se pudo cargar
                        }

                    } else {
                        console.warn('ComentariosAdmin: comentario sin idCita ni objeto cita:', comentario);

                        // Intentar emparejar con una valoración (misma cadena de contenido) para obtener servicio
                        try {
                            const texto = (comentario.contenido || comentario.comentario || '').trim();
                            if (texto && Array.isArray(valoraciones) && valoraciones.length > 0) {
                                const match = valoraciones.find(v => {
                                    const vTexto = (v.comentario || v.texto || v.contenido || '').trim();
                                    return vTexto && vTexto === texto;
                                });

                                if (match) {
                                    console.log('ComentariosAdmin: se emparejó comentario con valoracion para obtener servicio:', match);
                                    // Construir un objeto cita mínimo con servicios para mostrar badge
                                    comentario.cita = {
                                        servicios: [ { nombre: match.nombreServicio || match.servicio?.nombre || 'Servicio' , id: match.idServicio || match.servicio?.idServicio } ]
                                    };

                                    // Si no hay cliente, intentar usar datos de la valoración
                                    if (!comentario.cliente) {
                                        comentario.cliente = match.nombreCliente ? { nombre: match.nombreCliente } : (match.usuario ? { nombre: match.usuario } : null);
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn('Error al emparejar comentario con valoracion:', e);
                        }
                    }

                    return comentario;
                })
            );
            
            console.log('loadComentarios - Comentarios enriquecidos:', comentariosEnriquecidos);

            this.comentarios = comentariosEnriquecidos;
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
            const servicioNombre = (comentario.cita?.servicios?.[0]?.nombre || '').toLowerCase();
            
            return contenido.includes(searchTerm) || clienteNombre.includes(searchTerm) || servicioNombre.includes(searchTerm);
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
            const clienteNombre = comentario.cliente?.nombre || comentario.nombreCliente || 'Usuario Anónimo';
            const iniciales = clienteNombre.charAt(0).toUpperCase();

            // Buscar la fecha en posibles campos: 'fecha', 'fechaCita', 'createdAt', 'created_at'
            const fechaRaw = comentario.fecha || comentario.fechaCita || comentario.createdAt || comentario.created_at || comentario.fecha_creacion;
            const fechaFormateada = this.formatFecha(fechaRaw || comentario.cita?.fecha || comentario.cita?.fechaCita || comentario.cita?.fechaHoraCita);

            const textoComentario = comentario.contenido || comentario.comentario || comentario.texto || '';

            // Servicio eliminado de la vista: no mostrar badge ni enlace


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
                        <div></div>
                    </div>
                    
                    <div class="comment-text">
                        ${textoComentario}
                    </div>
                    
                    <div class="comment-actions">
                        <button class="btn btn-danger btn-sm" onclick="comentariosAdmin.deleteComentario(${comentario.idComentario || comentario.id || comentario._id})">
                            <i class="ph-bold ph-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteComentario(id) {
        const confirmed = await customConfirm(
            '¿Estás seguro de eliminar este comentario?',
            'Eliminar Comentario',
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();

        try {
            await ComentariosService.delete(id);
            await customAlert('Comentario eliminado correctamente', 'Éxito', { type: 'success' });
            await this.loadComentarios();
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            await customAlert('Error al eliminar comentario', 'Error', { type: 'error' });
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
