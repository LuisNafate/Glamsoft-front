// js/estilista/dashboard.js

class DashboardEstilista {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupProfileMenu();
            await this.loadMyData();
            
            // Actualización automática cada minuto
            this.setupAutoRefresh();
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
        }
    }

    /*async checkAuth() {
        try {
            // 1. Obtener Usuario
            const user = StateManager.getState('user') || JSON.parse(localStorage.getItem('user_data'));
            
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
*/
    setupProfileMenu() {
        const userIcon = document.getElementById('stylistUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
            });
        }

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (profileMenu && profileMenu.style.display === 'block') {
                if (!profileMenu.contains(e.target) && !userIcon.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
            }
        });
        
        // Cerrar al hacer scroll
        window.addEventListener('scroll', () => {
             if (profileMenu) profileMenu.style.display = 'none';
        });

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    await AuthService.logout();
                    window.location.href = '../login.html';
                }
            });
        }
    }

    async loadMyData() {
        this.showLoader();
        try {
            // A. CARGAR CITAS
            const citasResponse = await CitasService.getAll(); 
            // Manejo flexible de la respuesta
            const todasLasCitas = citasResponse.data || citasResponse || [];
            
            // B. FILTRAR MIS CITAS
            // Comparamos el ID del estilista de la cita con el ID del usuario logueado
            const misCitas = todasLasCitas.filter(cita => {
                const idEstilistaCita = cita.idEstilista || (cita.estilista ? cita.estilista.id : 0);
                return idEstilistaCita == this.currentUserId;
            });

            console.log(`Citas cargadas: ${todasLasCitas.length}, Mis Citas: ${misCitas.length}`);

            // C. CALCULAR ESTADÍSTICAS
            const hoyStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Citas de Hoy
            const citasHoy = misCitas.filter(c => {
                const fecha = c.fecha || (c.fechaHoraCita ? c.fechaHoraCita.split('T')[0] : '');
                return fecha === hoyStr;
            });
            
            // Citas Pendientes
            const pendientes = misCitas.filter(c => {
                const estado = (c.estado || c.estadoCita || '').toLowerCase();
                return estado === 'pendiente';
            });

            // Actualizar números en pantalla
            document.getElementById('citasHoy').textContent = citasHoy.length;
            document.getElementById('citasPendientes').textContent = pendientes.length;

            // D. CARGAR RESEÑAS (Opcional: Filtro manual si no hay endpoint)
            // Por ahora ponemos 0 o implementamos lógica similar a citas
            this.loadMyReviews(); 

            // E. RENDERIZAR LISTA
            this.renderUpcomingAppointments(misCitas);

        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        } finally {
            this.hideLoader();
        }
    }

    async loadMyReviews() {
        // Intento simple de cargar comentarios para estadísticas
        try {
            const response = await ComentariosService.getAll();
            const todosComentarios = response.data || response || [];
            // Aquí necesitaríamos lógica compleja para vincular comentario -> cita -> estilista
            // Por simplicidad visual, mostramos el total general o 0 si no se puede filtrar
            document.getElementById('totalComentarios').textContent = todosComentarios.length > 0 ? "?" : "0";
        } catch (e) {
            document.getElementById('totalComentarios').textContent = "-";
        }
    }

    renderUpcomingAppointments(citas) {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        // 1. Filtrar confirmadas y futuras
        // 2. Ordenar por fecha
        // 3. Tomar las primeras 5
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
            // Normalizar datos
            let fecha = 'S/F';
            let hora = '--:--';
            
            if (cita.fechaHoraCita) {
                const partes = cita.fechaHoraCita.split('T');
                fecha = partes[0]; // YYYY-MM-DD
                hora = partes[1].substring(0, 5); // HH:MM
            } else if (cita.fecha) {
                fecha = cita.fecha;
                hora = cita.hora ? cita.hora.substring(0, 5) : '';
            }

            // Convertir fecha a formato legible (DD/MM)
            const fechaObj = new Date(fecha);
            const fechaLegible = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            const cliente = cita.clienteNombre || (cita.cliente ? cita.cliente.nombre : 'Cliente');
            
            // Servicio
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