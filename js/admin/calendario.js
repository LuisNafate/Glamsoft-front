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
            const user = StateManager.get('user');
            if (!user || user.rol !== 'admin') {
                console.warn('Usuario no autenticado o no es admin');
                // window.location.href = '../login.html';
            }
        } catch (error) {
            console.warn('StateManager no disponible:', error);
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
                    // La API devuelve 'fecha' y 'hora', no 'fechaCita' y 'horaCita'
                    const citaFecha = cita.fecha || cita.fechaCita;
                    const citaHora = cita.hora || cita.horaCita;
                    
                    console.log('Comparando cita:', {
                        citaFecha,
                        citaHora,
                        buscandoFecha: dateStr,
                        buscandoHora: hora
                    });
                    
                    // Comparar fechas
                    const fechaMatch = citaFecha === dateStr;
                    
                    // Comparar horas (solo las primeras 2 cifras: "16:00" con "16")
                    const horaMatch = citaHora?.startsWith(hora.substring(0, 2));
                    
                    const match = fechaMatch && horaMatch;
                    
                    if (match) {
                        console.log('✓ Cita encontrada para mostrar:', {
                            fecha: citaFecha,
                            hora: citaHora,
                            cliente: cita.cliente?.nombre,
                            estado: cita.estado
                        });
                    }
                    
                    return match;
                });
                
                html += `<div class="calendar-cell" data-date="${dateStr}" data-hora="${hora}">`;
                
                citasDelSlot.forEach(cita => {
                    const estadoClass = (cita.estado || cita.estadoCita || 'pendiente').toLowerCase();
                    const clienteNombre = cita.cliente?.nombre || 'Cliente';
                    const servicioNombre = cita.servicios?.[0]?.nombre || 'Servicio';
                    const citaId = cita.idCita;
                    
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
            
            const estadoCita = this.currentCita.estadoCita || this.currentCita.estado || 'pendiente';
            const estadoColor = estadoColors[estadoCita] || '#7f8c8d';
            
            const clienteNombre = this.currentCita.cliente?.nombre || this.currentCita.cliente_nombre || 'N/A';
            const servicioNombre = this.currentCita.servicio?.nombre || this.currentCita.servicio_nombre || 'N/A';
            const estilistaNombre = this.currentCita.estilista?.nombre || this.currentCita.estilista_nombre || '';
            const fechaCita = this.currentCita.fechaCita || this.currentCita.fecha;
            const horaCita = this.currentCita.horaCita || this.currentCita.hora;
            const notas = this.currentCita.notas || this.currentCita.observaciones || '';
            
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
        
        if (!confirm(`¿Confirmar ${nuevoEstado === 'confirmada' ? 'confirmación' : 'cancelación'} de la cita?`)) {
            return;
        }
        
        this.showLoader();
        
        try {
            const citaId = this.currentCita.idCita || this.currentCita.id;
            await CitasService.updateEstado({
                idCita: citaId,
                estadoCita: nuevoEstado.toUpperCase()
            });
            
            this.showNotification(`Cita ${nuevoEstado} correctamente`, 'success');
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
});
