// js/estilista/comentarios.js

class ComentariosEstilista {
    constructor() {
        this.currentUser = null;
        this.currentUserId = null;
        this.allReviews = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadReviews();
        } catch (error) {
            console.error('Error al inicializar comentarios:', error);
        }
    }

    async checkAuth() {
        try {
            // Obtener usuario solo de localStorage
            const userStr = localStorage.getItem('user_data');

            console.log("[COMENTARIOS] user_data raw:", userStr);

            if (!userStr) {
                console.warn("[COMENTARIOS] No hay usuario en localStorage. Redirigiendo...");
                window.location.href = '../inicio.html';
                return;
            }

            const user = JSON.parse(userStr);
            console.log("[COMENTARIOS] Usuario parseado:", user);

            const rol = parseInt(user.idRol || user.rol || 0);
            console.log("[COMENTARIOS] Rol detectado:", rol);

            if (rol !== 2 && rol !== 1) {
                console.warn("[COMENTARIOS] Rol no autorizado:", rol, "- Se requiere 1 o 2");
                window.location.href = '../inicio.html';
                return;
            }

            const nombre = user.nombre || 'Estilista';
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombre;

            this.currentUser = user;
            this.currentUserId = user.idUsuario || user.id;

            console.log("[COMENTARIOS] ✅ Auth exitosa. Usuario ID:", this.currentUserId);

        } catch (error) {
            console.error("[COMENTARIOS] ❌ Error auth:", error);
            window.location.href = '../inicio.html';
        }
    }

    setupEventListeners() {
        // Profile menu
        const userIcon = document.getElementById('stylistUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
            });
        }

        document.addEventListener('click', (e) => {
            if (profileMenu && profileMenu.style.display === 'block') {
                if (!profileMenu.contains(e.target) && !userIcon.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
            }
        });

        window.addEventListener('scroll', () => {
            if (profileMenu) profileMenu.style.display = 'none';
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    await AuthService.logout();
                    window.location.href = '../login.html';
                }
            });
        }

        // Filter
        const filterRating = document.getElementById('filterRating');
        if (filterRating) {
            filterRating.addEventListener('change', () => this.applyFilter());
        }
    }

    async loadReviews() {
        this.showLoader();
        try {
            // Cargar comentarios
            const comentariosResponse = await ComentariosService.getAll();
            const todosComentarios = comentariosResponse.data || comentariosResponse || [];

            // Cargar citas para relacionar comentario -> cita -> estilista
            const citasResponse = await CitasService.getAll();
            const todasCitas = citasResponse.data || citasResponse || [];

            // Filtrar solo las citas de este estilista
            const misCitasIds = todasCitas
                .filter(cita => {
                    const idEstilista = cita.idEstilista || (cita.estilista ? cita.estilista.id : 0);
                    return idEstilista == this.currentUserId;
                })
                .map(cita => cita.idCita || cita.id);

            // Filtrar comentarios que pertenecen a mis citas
            this.allReviews = todosComentarios.filter(comentario => {
                const idCita = comentario.idCita || comentario.cita?.id || 0;
                return misCitasIds.includes(idCita);
            });

            // Enriquecer comentarios con información de la cita
            this.allReviews = this.allReviews.map(comentario => {
                const cita = todasCitas.find(c => (c.idCita || c.id) === (comentario.idCita || comentario.cita?.id));
                return {
                    ...comentario,
                    citaInfo: cita
                };
            });

            console.log(`Comentarios cargados: ${this.allReviews.length}`);

            this.updateStats();
            this.renderReviews(this.allReviews);

        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            this.showError('Error al cargar las reseñas');
        } finally {
            this.hideLoader();
        }
    }

    updateStats() {
        const total = this.allReviews.length;
        const fiveStars = this.allReviews.filter(r => (r.calificacion || 0) === 5).length;

        // Calcular promedio
        const sum = this.allReviews.reduce((acc, r) => acc + (r.calificacion || 0), 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';

        document.getElementById('totalReviews').textContent = total;
        document.getElementById('avgRating').innerHTML = `<i class="ph-fill ph-star"></i> ${avg}`;
        document.getElementById('fiveStars').textContent = fiveStars;
    }

    applyFilter() {
        const filterValue = document.getElementById('filterRating').value;

        if (filterValue === 'all') {
            this.renderReviews(this.allReviews);
        } else {
            const rating = parseInt(filterValue);
            const filtered = this.allReviews.filter(r => (r.calificacion || 0) === rating);
            this.renderReviews(filtered);
        }
    }

    renderReviews(reviews) {
        const container = document.getElementById('reviewsList');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-chat-teardrop-text"></i>
                    <h3>No tienes reseñas aún</h3>
                    <p>Las reseñas de tus clientes aparecerán aquí</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha (más reciente primero)
        const sortedReviews = [...reviews].sort((a, b) => {
            const dateA = new Date(a.fechaComentario || a.fecha || 0);
            const dateB = new Date(b.fechaComentario || b.fecha || 0);
            return dateB - dateA;
        });

        container.innerHTML = sortedReviews.map(review => {
            const calificacion = review.calificacion || 0;
            const comentario = review.comentario || 'Sin comentario';
            const fecha = this.formatDate(review.fechaComentario || review.fecha);

            // Información del cliente
            let clienteNombre = 'Cliente';
            let servicioNombre = 'Servicio';

            if (review.citaInfo) {
                clienteNombre = review.citaInfo.clienteNombre ||
                               (review.citaInfo.cliente ? review.citaInfo.cliente.nombre : 'Cliente');

                if (review.citaInfo.servicios && Array.isArray(review.citaInfo.servicios) && review.citaInfo.servicios.length > 0) {
                    servicioNombre = review.citaInfo.servicios[0].nombre || review.citaInfo.servicios[0];
                } else if (review.citaInfo.servicioNombre) {
                    servicioNombre = review.citaInfo.servicioNombre;
                }
            }

            const inicial = clienteNombre.charAt(0).toUpperCase();

            // Generar estrellas
            const stars = this.generateStars(calificacion);

            return `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-user">
                            <div class="user-avatar">${inicial}</div>
                            <div class="user-info">
                                <h4>${clienteNombre}</h4>
                                <div class="review-date">${fecha}</div>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${stars}
                        </div>
                    </div>
                    <div class="review-content">${comentario}</div>
                    <div class="review-service">
                        <i class="ph ph-scissors"></i> ${servicioNombre}
                    </div>
                </div>
            `;
        }).join('');
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="ph-fill ph-star"></i>';
            } else {
                stars += '<i class="ph ph-star"></i>';
            }
        }
        return stars;
    }

    formatDate(dateString) {
        if (!dateString) return 'Fecha desconocida';

        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoy';
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    showError(message) {
        const container = document.getElementById('reviewsList');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="ph ph-warning" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>${message}</p>
                </div>
            `;
        }
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

document.addEventListener('DOMContentLoaded', () => {
    new ComentariosEstilista();
});
