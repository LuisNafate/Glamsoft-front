// Calendario de Citas Admin
class CalendarioAdmin {
    constructor() {
        this.currentWeekStart = this.getMonday(new Date());
        this.citas = [];
        this.currentCita = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadCitas();
            this.renderCalendar();
        } catch (error) {
            console.error('Error al inicializar:', error);
            ErrorHandler.handle(error);
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
        // Navegación de semana
        document.getElementById('prevWeek')?.addEventListener('click', () => {
            this.changeWeek(-1);
        });
        
        document.getElementById('nextWeek')?.addEventListener('click', () => {
            this.changeWeek(1);
        });
        
        // Botón "Hoy"
        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.currentWeekStart = this.getMonday(new Date());
            this.renderCalendar();
        });
        
        document.getElementById('btnNuevaCita')?.addEventListener('click', () => {
            window.location.href = '../agendar.html';
        });
        
        // Botones del modal
        document.getElementById('btnConfirmar')?.addEventListener('click', () => {
            this.updateEstadoCita('confirmada');
        });

        document.getElementById('btnCancelar')?.addEventListener('click', () => {
            this.updateEstadoCita('cancelada');
        });

        document.getElementById('btnReagendar')?.addEventListener('click', () => {
            this.reagendarCita();
        });
    }

    changeWeek(direction) {
        const newDate = new Date(this.currentWeekStart);
        newDate.setDate(newDate.getDate() + (direction * 7));
        this.currentWeekStart = newDate;
        this.renderCalendar();
    }

    getMonday(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    renderCalendar() {
        this.renderWeekView();
    }
    
    
    renderWeekView() {
        // Actualizar título
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        console.log('Renderizando semana:', this.currentWeekStart.toISOString(), 'hasta', weekEnd.toISOString());
        console.log('Total de citas cargadas:', this.citas.length);
        
        document.getElementById('calendarTitle').textContent = 
            `Semana del ${this.formatShortDate(this.currentWeekStart)} - ${this.formatShortDate(weekEnd)}`;
        
        // Renderizar grid
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const horas = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        let html = '<div class="calendar-header-cell">Hora</div>';
        
        // Headers de días
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + i);
            html += `
                <div class="calendar-header-cell">
                    ${dias[i]}<br>
                    <small>${date.getDate()}</small>
                </div>
            `;
        }
        
        // Filas de horarios
        horas.forEach(hora => {
            html += `<div class="calendar-time-cell">${hora}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(this.currentWeekStart);
                date.setDate(date.getDate() + i);
                const dateStr = this.formatDateForAPI(date);
                
                // Buscar citas para este día y hora
                const citasDelSlot = this.citas.filter(cita => {
                    // Extraer fecha y hora del formato del backend
                    let citaFecha = '';
                    let citaHora = '';

                    // Manejar formato array [2025, 11, 28, 13, 0]
                    if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
                        const [year, month, day, hour, minute] = cita.fechaHoraCita;
                        citaFecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        if (hour !== undefined && minute !== undefined) {
                            citaHora = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                        }
                    } else {
                        // Formato string separado
                        citaFecha = cita.fecha || cita.fechaCita || '';
                        citaHora = cita.hora || cita.horaCita || '';
                    }

                    // Comparar fechas
                    const fechaMatch = citaFecha === dateStr;

                    // Comparar horas (solo las primeras 2 cifras: "16:00" con "16")
                    const horaMatch = citaHora?.startsWith(hora.substring(0, 2));

                    const match = fechaMatch && horaMatch;

                    if (match) {
                        console.log('✓ Cita encontrada para mostrar:', {
                            fecha: citaFecha,
                            hora: citaHora,
                            cliente: cita.nombreCliente || cita.cliente?.nombre,
                            estado: cita.estadoCita || cita.estado
                        });
                    }

                    return match;
                });
                
                html += `<div class="calendar-cell" data-date="${dateStr}" data-hora="${hora}">`;
                
                citasDelSlot.forEach(cita => {
                    const estadoRaw = (cita.estadoCita || cita.estado || 'PENDIENTE').toUpperCase();
                    let estadoClass = 'pendiente';

                    if (estadoRaw.includes('CONFIRMADA') || estadoRaw.includes('APROBADA')) {
                        estadoClass = 'confirmada';
                    } else if (estadoRaw.includes('CANCELADA') || estadoRaw.includes('RECHAZADA')) {
                        estadoClass = 'cancelada';
                    } else if (estadoRaw.includes('COMPLETADA') || estadoRaw.includes('FINALIZADA')) {
                        estadoClass = 'completada';
                    } else if (estadoRaw.includes('PENDIENTE')) {
                        estadoClass = 'pendiente';
                    }

                    const clienteNombre = cita.nombreCliente || cita.cliente?.nombre || 'Cliente';

                    // Extraer nombre del servicio
                    let servicioNombre = 'Servicio';
                    if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
                        servicioNombre = cita.servicios[0].nombre || cita.servicios[0].nombreServicio || 'Servicio';
                    } else if (cita.nombreServicio) {
                        servicioNombre = cita.nombreServicio;
                    }

                    const citaId = cita.idCita || cita.id;

                    html += `
                        <div class="appointment-card ${estadoClass}" onclick="calendarioAdmin.showCitaDetail(${citaId})">
                            <div class="appointment-client">${clienteNombre}</div>
                            <div class="appointment-service">${servicioNombre}</div>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
        });
        
        grid.innerHTML = html;
    }

    changeWeek(direction) {
        const newDate = new Date(this.currentWeekStart);
        newDate.setDate(newDate.getDate() + (direction * 7));
        this.currentWeekStart = newDate;
        this.renderCalendar();
    }

    async loadCitas() {
        try {
            const response = await CitasService.getAll();
            console.log('loadCitas - Response completo:', response);
            // Manejar estructura: {data: [...], message: "...", status: "success"}
            this.citas = response.data?.data || response.data || [];
            console.log('Citas cargadas:', this.citas.length);
            console.log('Detalle de todas las citas:', this.citas);
            
            // Mostrar cada cita individualmente
            this.citas.forEach((cita, index) => {
                console.log(`Cita ${index + 1}:`, {
                    id: cita.idCita || cita.id,
                    fecha: cita.fechaCita,
                    hora: cita.horaCita,
                    cliente: cita.cliente?.nombre || cita.cliente_nombre,
                    estado: cita.estadoCita || cita.estado
                });
            });
        } catch (error) {
            console.error('Error al cargar citas:', error);
            this.citas = [];
        }
    }

    formatShortDate(date) {
        return `${date.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()]}`;
    }

    formatDateForAPI(date) {
        return date.toISOString().split('T')[0];
    }

    async showCitaDetail(citaId) {
        this.showLoader();
        
        try {
            const response = await CitasService.getById(citaId);
            console.log('showCitaDetail - Response:', response);
            this.currentCita = response.data?.data || response.data;
            
            if (!this.currentCita) {
                throw new Error('Cita no encontrada');
            }
            
            const modal = document.getElementById('modalCita');
            const detalle = document.getElementById('citaDetalle');
            
            const estadoColors = {
                'pendiente': '#f39c12',
                'confirmada': '#27ae60',
                'cancelada': '#e74c3c',
                'PENDIENTE': '#f39c12',
                'CONFIRMADA': '#27ae60',
                'CANCELADA': '#e74c3c'
            };
            
            const estadoCita = this.currentCita.estadoCita || this.currentCita.estado || 'PENDIENTE';
            const estadoColor = estadoColors[estadoCita] || '#7f8c8d';

            const clienteNombre = this.currentCita.nombreCliente || this.currentCita.cliente?.nombre || this.currentCita.cliente_nombre || 'N/A';

            // Extraer nombres de servicios
            let servicioNombre = 'N/A';
            if (Array.isArray(this.currentCita.servicios) && this.currentCita.servicios.length > 0) {
                servicioNombre = this.currentCita.servicios.map(s => s.nombre).join(', ');
            } else if (this.currentCita.servicio?.nombre) {
                servicioNombre = this.currentCita.servicio.nombre;
            } else if (this.currentCita.servicio_nombre) {
                servicioNombre = this.currentCita.servicio_nombre;
            }

            const estilistaNombre = this.currentCita.nombreEstilista || this.currentCita.estilista?.nombre || this.currentCita.estilista_nombre || '';
            const fechaCita = this.currentCita.fechaHoraCita || this.currentCita.fechaCita || this.currentCita.fecha;
            const horaCita = this.currentCita.fechaHoraCita || this.currentCita.horaCita || this.currentCita.hora;
            const notas = this.currentCita.notas || this.currentCita.observaciones || '';
            const precioTotal = this.currentCita.precioTotal || 0;
            
            detalle.innerHTML = `
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px; padding: 15px; background: ${estadoColor}; color: white; border-radius: 8px; text-align: center;">
                        <strong style="font-size: 18px; text-transform: uppercase;">${estadoCita}</strong>
                    </div>
                    
                    <div style="display: grid; gap: 15px;">
                        <div>
                            <strong style="color: #7f8c8d;">Cliente:</strong><br>
                            <span style="font-size: 18px; color: var(--admin-primary);">${clienteNombre}</span>
                        </div>
                        
                        <div>
                            <strong style="color: #7f8c8d;">Servicio:</strong><br>
                            <span style="font-size: 16px;">${servicioNombre}</span>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #7f8c8d;">Fecha:</strong><br>
                                <span>${this.formatFecha(fechaCita)}</span>
                            </div>
                            <div>
                                <strong style="color: #7f8c8d;">Hora:</strong><br>
                                <span>${this.formatHora(horaCita)}</span>
                            </div>
                        </div>

                        <div>
                            <strong style="color: #7f8c8d;">Precio Total:</strong><br>
                            <span style="font-size: 18px; color: #27ae60; font-weight: bold;">$${Number(precioTotal).toLocaleString('es-CO')}</span>
                        </div>
                        
                        ${estilistaNombre ? `
                            <div>
                                <strong style="color: #7f8c8d;">Estilista:</strong><br>
                                <span>${estilistaNombre}</span>
                            </div>
                        ` : ''}
                        
                        ${notas ? `
                            <div>
                                <strong style="color: #7f8c8d;">Notas:</strong><br>
                                <span>${notas}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Mostrar/ocultar botones según estado
            const btnConfirmar = document.getElementById('btnConfirmar');
            const btnCancelar = document.getElementById('btnCancelar');
            
            if (estadoCita.toLowerCase() === 'confirmada') {
                btnConfirmar.style.display = 'none';
            } else {
                btnConfirmar.style.display = 'inline-flex';
            }
            
            if (estadoCita.toLowerCase() === 'cancelada') {
                btnCancelar.style.display = 'none';
            } else {
                btnCancelar.style.display = 'inline-flex';
            }
            
            modal.classList.add('active');
            
        } catch (error) {
            console.error('Error al cargar detalle de cita:', error);
            this.showNotification('Error al cargar detalle de cita', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async updateEstadoCita(nuevoEstado) {
        if (!this.currentCita) return;

        const esConfirmacion = nuevoEstado === 'confirmada';
        const mensaje = esConfirmacion
            ? 'Se enviará un email al cliente.'
            : '¿Confirmar cancelación de la cita?';
        const titulo = esConfirmacion
            ? '¿Confirmar aprobación de la cita?'
            : 'Cancelar Cita';

        const confirmed = await customConfirm(
            mensaje,
            titulo,
            { icon: esConfirmacion ? 'ph-check-circle' : 'ph-x-circle' }
        );

        if (!confirmed) return;

        this.showLoader();

        try {
            const citaId = this.currentCita.idCita || this.currentCita.id;

            if (esConfirmacion) {
                await CitasService.aprobar(citaId);
                await customAlert('Cita aprobada. Email enviado al cliente.', 'Éxito', { type: 'success' });
            } else {
                const motivo = await customPrompt(
                    'Ingresa el motivo de cancelación (opcional):',
                    'Motivo de Cancelación',
                    '',
                    { placeholder: 'Motivo...', icon: 'ph-chat-circle-text' }
                );
                if (motivo === null) {
                    this.hideLoader();
                    return; // Usuario canceló
                }
                await CitasService.cancelar(citaId, motivo);
                await customAlert('Cita cancelada correctamente', 'Cita Cancelada', { type: 'warning' });
            }

            closeModal();
            await this.loadCitas();
            this.renderCalendar();

        } catch (error) {
            console.error('Error al actualizar cita:', error);
            this.showNotification('Error al actualizar cita', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async reagendarCita() {
        if (!this.currentCita) return;

        // Cerrar modal de detalles y abrir modal de reagendar
        closeModal();
        document.getElementById('modalReagendar').classList.add('active');

        // Configurar fecha mínima (hoy)
        const inputFecha = document.getElementById('nuevaFechaReagendar');
        const today = new Date().toISOString().split('T')[0];
        inputFecha.min = today;
        inputFecha.value = today;

        // Cargar horarios para hoy
        await this.cargarHorariosDisponibles(today);

        // Event listener para cambio de fecha
        inputFecha.addEventListener('change', async (e) => {
            await this.cargarHorariosDisponibles(e.target.value);
        });

        // Event listener para confirmar
        document.getElementById('btnConfirmarReagendar').onclick = () => {
            this.confirmarReagendado();
        };
    }

    async cargarHorariosDisponibles(fecha) {
        const container = document.getElementById('horariosDisponibles');
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Cargando horarios...</p>';

        try {
            // Obtener el estilista de la cita actual
            const estilistaId = this.currentCita.idEstilista || this.currentCita.estilista?.idEstilista;

            if (!estilistaId) {
                container.innerHTML = '<p style="color: red; text-align: center;">No se pudo obtener el estilista</p>';
                return;
            }

            // Cargar horarios configurados desde el backend (igual que agendar.js)
            let horaInicio = '09:00:00';
            let horaFin = '19:00:00';

            try {
                console.log('🕒 Cargando horarios desde la API...');
                const response = await HorariosService.getAll();
                const horariosData = response.data || response;

                if (horariosData && horariosData.length > 0) {
                    const horario = horariosData[0];
                    console.log('📋 Horario configurado:', horario);

                    // Convertir horaInicio y horaFin si son objetos LocalTime
                    if (typeof horario.horaInicio === 'object' && horario.horaInicio !== null) {
                        horaInicio = `${String(horario.horaInicio.hour || 9).padStart(2, '0')}:${String(horario.horaInicio.minute || 0).padStart(2, '0')}:${String(horario.horaInicio.second || 0).padStart(2, '0')}`;
                    } else if (horario.horaInicio) {
                        horaInicio = horario.horaInicio;
                    }

                    if (typeof horario.horaFin === 'object' && horario.horaFin !== null) {
                        horaFin = `${String(horario.horaFin.hour || 19).padStart(2, '0')}:${String(horario.horaFin.minute || 0).padStart(2, '0')}:${String(horario.horaFin.second || 0).padStart(2, '0')}`;
                    } else if (horario.horaFin) {
                        horaFin = horario.horaFin;
                    }

                    console.log('⏰ Usando horario - Inicio:', horaInicio, '- Fin:', horaFin);
                }
            } catch (error) {
                console.warn('⚠️ No se pudieron cargar horarios configurados, usando horarios por defecto', error);
            }

            // Parsear horas de inicio y fin
            const [inicioHora] = String(horaInicio).split(':').map(Number);
            const [finHora] = String(horaFin).split(':').map(Number);

            // Generar horarios cada hora entre horaInicio y horaFin (igual que agendar.js)
            const horarios = [];
            for (let hour = inicioHora; hour < finHora; hour++) {
                horarios.push(`${String(hour).padStart(2, '0')}:00`);
            }

            // Verificar si la fecha seleccionada es hoy para deshabilitar horarios pasados
            const fechaSeleccionada = new Date(fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaSeleccionada.setHours(0, 0, 0, 0);
            const esHoy = fechaSeleccionada.getTime() === hoy.getTime();
            const horaActual = esHoy ? new Date().getHours() : -1;

            // Renderizar horarios en formato 12 horas (igual que agendar.js)
            container.innerHTML = horarios.map(hora => {
                const [h] = hora.split(':').map(Number);
                const esPasado = esHoy && h <= horaActual;
                const opacity = esPasado ? '0.3' : '1';
                const cursor = esPasado ? 'not-allowed' : 'pointer';
                const disabled = esPasado ? 'disabled' : '';

                // Formatear a formato 12 horas con AM/PM
                const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                const periodo = h >= 12 ? 'PM' : 'AM';
                const horaDisplay = `${hora12}:00 ${periodo}`;

                return `
                    <div class="horario-item ${disabled}" data-hora="${hora}" style="
                        padding: 12px 16px;
                        margin-bottom: 8px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: ${cursor};
                        opacity: ${opacity};
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    " ${esPasado ? '' : `onmouseover="this.style.borderColor='#B8860B'; this.style.background='#faf8f0';"
                       onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#e0e0e0'; this.style.background='white';}"
                       onclick="window.calendarioAdmin.seleccionarHorario(this, '${hora}')"`}>
                        <i class="fas fa-clock" style="color: #B8860B;"></i>
                        <span style="font-weight: 500;">${horaDisplay}</span>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error al cargar horarios:', error);
            container.innerHTML = '<p style="color: red; text-align: center;">Error al cargar horarios</p>';
        }
    }

    seleccionarHorario(elemento, hora) {
        // Remover selección anterior
        document.querySelectorAll('.horario-item').forEach(item => {
            item.classList.remove('selected');
            item.style.borderColor = '#e0e0e0';
            item.style.background = 'white';
        });

        // Seleccionar nuevo
        elemento.classList.add('selected');
        elemento.style.borderColor = '#B8860B';
        elemento.style.background = '#faf8f0';
    }

    async confirmarReagendado() {
        const nuevaFecha = document.getElementById('nuevaFechaReagendar').value;
        const horarioSeleccionado = document.querySelector('.horario-item.selected');

        if (!nuevaFecha) {
            this.showNotification('Por favor seleccione una fecha', 'error');
            return;
        }

        if (!horarioSeleccionado) {
            this.showNotification('Por favor seleccione un horario', 'error');
            return;
        }

        const nuevaHora = horarioSeleccionado.getAttribute('data-hora');

        if (!confirm(`¿Confirmar reagendado para ${nuevaFecha} a las ${nuevaHora}?`)) {
            return;
        }

        this.showLoader();

        try {
            const citaId = this.currentCita.idCita || this.currentCita.id;

            const data = {
                idCita: citaId,
                nuevaFecha: nuevaFecha,
                nuevaHora: nuevaHora
            };

            await CitasService.updateFecha(data);
            this.showNotification('Cita reagendada exitosamente', 'success');

            closeModalReagendar();
            await this.loadCitas();
            this.renderCalendar();

        } catch (error) {
            console.error('Error al reagendar cita:', error);
            this.showNotification('Error al reagendar la cita', 'error');
        } finally {
            this.hideLoader();
        }
    }

    formatFecha(fecha) {
        // Manejar formato array [year, month, day]
        if (Array.isArray(fecha)) {
            const [year, month, day] = fecha;
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    formatHora(hora) {
        // Manejar formato array [hour, minute, second]
        if (Array.isArray(hora)) {
            const [hour, minute] = hora;
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        }
        
        // Formato string "10:00:00"
        return hora.substring(0, 5);
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

let calendarioAdmin;

document.addEventListener('DOMContentLoaded', () => {
    calendarioAdmin = new CalendarioAdmin();
    window.calendarioAdmin = calendarioAdmin; // Exponer globalmente
});
