// Confirmaciones de Citas Admin
class ConfirmacionesAdmin {
    constructor() {
        this.citasPendientes = [];
        this.init();
    }

    async init() {
        try {
            // Inicializar EmailJS
            if (typeof EmailService !== 'undefined') {
                EmailService.init();
            }

            await this.checkAuth();
            this.setupEventListeners();
            await this.loadCitasPendientes();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al cargar las citas pendientes', 'error');
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
        document.getElementById('btnRefresh')?.addEventListener('click', () => {
            this.loadCitasPendientes();
        });
    }

    async loadCitasPendientes() {
        this.showLoader();

        try {
            // Obtener todas las citas
            const response = await CitasService.getAll();
            const todasLasCitas = response.data || response || [];

            // Filtrar solo las pendientes
            this.citasPendientes = todasLasCitas.filter(cita => {
                const estado = (cita.estadoCita || cita.estado || '').toUpperCase();
                return estado === 'PENDIENTE';
            });

            console.log('Citas pendientes cargadas:', this.citasPendientes);

            // Actualizar estadísticas
            document.getElementById('totalPendientes').textContent = this.citasPendientes.length;

            // Renderizar lista
            this.renderCitas();

        } catch (error) {
            console.error('Error al cargar citas pendientes:', error);
            this.showNotification('Error al cargar las citas', 'error');
        } finally {
            this.hideLoader();
        }
    }

    renderCitas() {
        const container = document.getElementById('citasList');

        if (this.citasPendientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph-bold ph-check-circle"></i>
                    <h3>¡Todo al día!</h3>
                    <p>No hay citas pendientes de confirmación</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.citasPendientes.map(cita => this.renderCitaCard(cita)).join('');

        // Agregar event listeners a los botones
        this.citasPendientes.forEach(cita => {
            const citaId = cita.idCita || cita.id;

            document.getElementById(`btn-aprobar-${citaId}`)?.addEventListener('click', () => {
                this.aprobarCita(citaId);
            });

            document.getElementById(`btn-rechazar-${citaId}`)?.addEventListener('click', () => {
                this.rechazarCita(citaId);
            });
        });
    }

    renderCitaCard(cita) {
        const citaId = cita.idCita || cita.id;

        // Extraer información
        const clienteNombre = cita.nombreCliente || cita.cliente?.nombre || 'Cliente';
        const clienteTelefono = cita.telefonoCliente || cita.cliente?.telefono || 'No disponible';
        const clienteInicial = clienteNombre.charAt(0).toUpperCase();

        // Fecha y hora
        let fechaStr = 'No disponible';
        let horaStr = 'No disponible';

        if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
            const [year, month, day, hour, minute] = cita.fechaHoraCita;
            fechaStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            if (hour !== undefined && minute !== undefined) {
                horaStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            }
        }

        // Estilista
        const estilistaNombre = cita.nombreEstilista || cita.estilista?.nombre || 'Sin asignar';

        // Servicios
        let serviciosHTML = '';
        if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
            serviciosHTML = cita.servicios.map(s =>
                `<span class="servicio-tag">${s.nombre || s}</span>`
            ).join('');
        }

        // Precio total
        const precioTotal = parseFloat(cita.precioTotal || 0).toLocaleString('es-CO');

        // Fecha de solicitud
        let fechaSolicitudStr = 'No disponible';
        if (Array.isArray(cita.fechaSolicitud) && cita.fechaSolicitud.length >= 3) {
            const [year, month, day] = cita.fechaSolicitud;
            fechaSolicitudStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }

        // Respuestas del formulario
        let respuestasHTML = '';
        if (Array.isArray(cita.respuestasFormulario) && cita.respuestasFormulario.length > 0) {
            const respuestasItems = cita.respuestasFormulario.map(r => `
                <div class="respuesta-item">
                    <div class="respuesta-pregunta">${r.pregunta || 'Pregunta'}</div>
                    <div class="respuesta-texto">${r.respuesta || '-'}</div>
                </div>
            `).join('');

            respuestasHTML = `
                <div class="respuestas-section">
                    <div class="respuestas-title">
                        <i class="ph-bold ph-clipboard-text"></i>
                        Información adicional del cliente
                    </div>
                    ${respuestasItems}
                </div>
            `;
        }

        return `
            <div class="cita-card">
                <div class="cita-header">
                    <div class="cita-cliente">
                        <div class="cliente-avatar">${clienteInicial}</div>
                        <div class="cliente-info">
                            <h4>${clienteNombre}</h4>
                            <div class="telefono">
                                <i class="ph-bold ph-phone"></i> ${clienteTelefono}
                            </div>
                        </div>
                    </div>
                    <span class="estado-badge">Pendiente</span>
                </div>

                <div class="cita-details">
                    <div class="detail-item">
                        <span class="detail-label">Fecha de la Cita</span>
                        <span class="detail-value">
                            <i class="ph-bold ph-calendar"></i> ${fechaStr}
                        </span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">Hora</span>
                        <span class="detail-value">
                            <i class="ph-bold ph-clock"></i> ${horaStr}
                        </span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">Estilista</span>
                        <span class="detail-value">
                            <i class="ph-bold ph-user"></i> ${estilistaNombre}
                        </span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">Precio Total</span>
                        <span class="detail-value precio">$${precioTotal}</span>
                    </div>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Servicios Solicitados</span>
                    <div class="servicios-list">
                        ${serviciosHTML}
                    </div>
                </div>

                ${respuestasHTML}

                <div class="cita-actions">
                    <button class="btn btn-rechazar" id="btn-rechazar-${citaId}">
                        <i class="ph-bold ph-x"></i> Rechazar
                    </button>
                    <button class="btn btn-aprobar" id="btn-aprobar-${citaId}">
                        <i class="ph-bold ph-check"></i> Aprobar
                    </button>
                </div>
            </div>
        `;
    }

    async aprobarCita(citaId) {
        const confirmed = await customConfirm(
            'Se enviará un email de confirmación al cliente.',
            '¿Confirmar la aprobación de esta cita?',
            { icon: 'ph-check-circle' }
        );

        if (!confirmed) return;

        this.showLoader();

        try {
            // Buscar datos completos de la cita antes de aprobar
            const cita = this.citasPendientes.find(c => (c.idCita || c.id) === citaId);

            if (!cita) {
                throw new Error('No se encontró la cita');
            }

            // Aprobar la cita en el backend
            await CitasService.aprobar(citaId);

            // Enviar email de confirmación
            await this.enviarEmailConfirmacion(cita);

            await customAlert(
                'Cita aprobada correctamente. Se ha enviado un email al cliente.',
                'Éxito',
                { type: 'success' }
            );

            // Recargar lista
            await this.loadCitasPendientes();

        } catch (error) {
            console.error('Error al aprobar cita:', error);
            await customAlert('Error al aprobar la cita', 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
    }

    async enviarEmailConfirmacion(cita) {
        try {
            // Extraer información de la cita
            let fecha = '';
            let hora = '';

            // Manejar formato array [2025, 11, 28, 13, 0]
            if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
                const [year, month, day, hour, minute] = cita.fechaHoraCita;
                fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (hour !== undefined && minute !== undefined) {
                    hora = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                }
            }

            // Extraer servicios
            let servicioNombre = 'Servicio';
            if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
                servicioNombre = cita.servicios.map(s => s.nombre || s).join(', ');
            }

            // Obtener email del cliente usando su teléfono
            let clienteEmail = null;
            try {
                if (cita.telefonoCliente) {
                    const url = API_CONFIG.buildUrl(`/usuarios/telefono/${cita.telefonoCliente}`);
                    const response = await httpService.get(url);
                    const userData = response.data?.data || response.data;
                    clienteEmail = userData?.email;
                    console.log('✅ Email del cliente obtenido:', clienteEmail);
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener el email del cliente:', error);
            }

            // Datos para el email
            const emailData = {
                email: clienteEmail,
                nombreCliente: cita.nombreCliente || cita.cliente?.nombre || 'Cliente',
                fecha: fecha,
                hora: hora,
                servicio: servicioNombre,
                estilista: cita.nombreEstilista || cita.estilista?.nombre || 'Estilista',
                precio: cita.precioTotal || 0
            };

            console.log('📧 Enviando email de confirmación:', emailData);

            // Enviar email usando EmailService
            if (typeof EmailService !== 'undefined' && EmailService.isConfigured()) {
                const result = await EmailService.enviarConfirmacionCita(emailData);
                if (result.success) {
                    console.log('✅ Email enviado exitosamente');
                } else {
                    console.warn('⚠️ No se pudo enviar el email:', result.message);
                }
            } else {
                console.warn('⚠️ EmailService no está disponible o configurado');
            }
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            // No lanzar error para no interrumpir el flujo de aprobación
        }
    }

    async rechazarCita(citaId) {
        const motivo = await customPrompt(
            'Ingresa el motivo del rechazo (opcional):',
            'Rechazar Cita',
            '',
            {
                placeholder: 'Motivo del rechazo...',
                icon: 'ph-x-circle'
            }
        );

        if (motivo === null) {
            return; // Usuario canceló
        }

        this.showLoader();

        try {
            await CitasService.rechazar(citaId, motivo);

            await customAlert(
                'Cita rechazada. Se ha notificado al cliente.',
                'Cita Rechazada',
                { type: 'warning' }
            );

            // Recargar lista
            await this.loadCitasPendientes();

        } catch (error) {
            console.error('Error al rechazar cita:', error);
            await customAlert('Error al rechazar la cita', 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
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
            font-weight: 600;
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

let confirmacionesAdmin;

document.addEventListener('DOMContentLoaded', () => {
    confirmacionesAdmin = new ConfirmacionesAdmin();
});
