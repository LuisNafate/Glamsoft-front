// Confirmaciones Estilista - Vista de Mis Confirmaciones
class ConfirmacionesEstilista {
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

            this.setupEventListeners();
            await this.loadConfirmaciones();
        } catch (error) {
            console.error('Error al inicializar:', error);
        }
    }

    setupEventListeners() {
        const btnRefresh = document.getElementById('btnRefresh');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                this.loadConfirmaciones();
            });
        }
    }

    async loadConfirmaciones() {
        this.showLoader();
        try {
            const user = StateManager.get('user');
            if (!user) {
                this.citasPendientes = [];
                this.renderCitas();
                return;
            }

            // Resolver ID de estilista: puede estar en user.idEstilista o debemos buscarlo por idUsuario
            let estilistaId = user.idEstilista || user.id_estilista || user.idEmpleado || user.id_empleado || user.id || user.idUsuario || user.id_usuario;

            // Si el valor parece ser el idUsuario (login) en lugar de idEstilista, intentar mapear mediante EmpleadosService (rol 2 -> estilistas)
            if ((user.idUsuario || user.id_usuario) && (!estilistaId || String(estilistaId) === String(user.idUsuario || user.id_usuario))) {
                const userIdToMatch = user.idUsuario || user.id || user.id_usuario;
                try {
                    const respEmp = await EmpleadosService.getByRol(2);
                    const empleados = respEmp?.data || respEmp || [];
                    const matchEmp = empleados.find(emp => {
                        const usuarioCandidates = [emp.usuario?.idUsuario, emp.usuario?.id, emp.idUsuario, emp.id_usuario];
                        return usuarioCandidates.some(c => c !== undefined && c !== null && String(c) === String(userIdToMatch));
                    });

                    if (matchEmp) {
                        estilistaId = matchEmp.idEstilista || matchEmp.idEmpleado || matchEmp.id || null;
                        console.log('Confirmaciones: resolved estilistaId via EmpleadosService.getByRol:', estilistaId);
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
                                estilistaId = perfil.idEstilista || perfil.id_estilista || perfil.idEmpleado || perfil.id || perfil.idEmpleado;
                                console.log('Confirmaciones: resolved estilistaId via EstilistasService (fallback):', estilistaId);
                            }
                        } catch (e) {
                            console.warn('Confirmaciones: getAll estilistas falló en fallback', e);
                        }
                    }
                } catch (e) {
                    console.warn('Confirmaciones: EmpleadosService.getByRol(2) falló', e);
                }
            }

            if (!estilistaId) {
                console.warn('Confirmaciones: no se pudo determinar idEstilista');
                this.citasPendientes = [];
                this.renderCitas();
                return;
            }

            // Cargar citas del estilista
            const response = await CitasService.getByEstilista(estilistaId);
            console.log('loadConfirmaciones - Response completo:', response);

            const todasLasCitas = response.data?.data || response.data || [];

            // Filtrar solo citas PENDIENTES
            this.citasPendientes = todasLasCitas.filter(c =>
                (c.estadoCita || c.estado || '').toUpperCase() === 'PENDIENTE'
            );

            console.log('Citas pendientes cargadas:', this.citasPendientes.length);

            // Actualizar estadísticas
            document.getElementById('totalPendientes').textContent = this.citasPendientes.length;

            // Renderizar lista
            this.renderCitas();
        } catch (error) {
            console.error('Error al cargar confirmaciones:', error);
            this.citasPendientes = [];
            this.renderCitas();
        } finally {
            this.hideLoader();
        }
    }

    renderCitas() {
        const container = document.getElementById('citasList');
        if (!container) return;

        if (this.citasPendientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph-bold ph-check-circle"></i>
                    <h3>¡Todo al día!</h3>
                    <p>No tienes confirmaciones pendientes en este momento.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.citasPendientes.map(cita => this.renderCitaCard(cita)).join('');

        // Agregar event listeners a los botones
        this.citasPendientes.forEach(cita => {
            const citaId = cita.idCita || cita.id;

            document.getElementById(`btn-aprobar-${citaId}`)?.addEventListener('click', () => {
                this.confirmarCita(citaId);
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

        // Servicios
        let serviciosHTML = '';
        if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
            serviciosHTML = cita.servicios.map(s =>
                `<span class="servicio-tag">${s.nombre || s}</span>`
            ).join('');
        }

        // Precio total
        const precioTotal = parseFloat(cita.precioTotal || 0).toLocaleString('es-CO');

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
                        <i class="ph-bold ph-check"></i> Confirmar
                    </button>
                </div>
            </div>
        `;
    }

    async confirmarCita(citaId) {
        const confirmed = await customConfirm(
            'Se enviará un email de confirmación al cliente.',
            '¿Confirmar esta cita?',
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
                'Cita confirmada exitosamente. Email enviado al cliente.',
                'Éxito',
                { type: 'success' }
            );

            // Recargar lista
            await this.loadConfirmaciones();
        } catch (error) {
            console.error('Error al confirmar cita:', error);
            await customAlert(
                'Error al confirmar la cita',
                'Error',
                { type: 'error' }
            );
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

            // Obtener nombre del estilista
            const user = StateManager.get('user');
            const estilista = user?.nombre || 'Tu estilista';

            // Datos para el email
            const emailData = {
                email: clienteEmail,
                nombreCliente: cita.nombreCliente || cita.cliente?.nombre || 'Cliente',
                fecha: fecha,
                hora: hora,
                servicio: servicioNombre,
                estilista: estilista,
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
                'Cita rechazada correctamente',
                'Cita Rechazada',
                { type: 'warning' }
            );
            await this.loadConfirmaciones();
        } catch (error) {
            console.error('Error al rechazar cita:', error);
            await customAlert(
                'Error al rechazar la cita',
                'Error',
                { type: 'error' }
            );
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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

let confirmacionesEstilista;

document.addEventListener('DOMContentLoaded', () => {
    confirmacionesEstilista = new ConfirmacionesEstilista();
});
