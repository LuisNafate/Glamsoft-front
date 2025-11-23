// Calendario de Citas Admin
class CalendarioAdmin {
    constructor() {
        this.currentWeekStart = this.getMonday(new Date());
        this.currentDate = new Date();
        this.viewMode = 'week'; // 'day', 'week', 'month'
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
        // Navegación de período (semana/mes según vista)
        document.getElementById('prevPeriod')?.addEventListener('click', () => {
            this.changePeriod(-1);
        });
        
        document.getElementById('nextPeriod')?.addEventListener('click', () => {
            this.changePeriod(1);
        });
        
        // Navegación de día
        document.getElementById('prevDay')?.addEventListener('click', () => {
            this.changeDay(-1);
        });
        
        document.getElementById('nextDay')?.addEventListener('click', () => {
            this.changeDay(1);
        });
        
        // Botón "Hoy"
        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.currentWeekStart = this.getMonday(new Date());
            this.renderCalendar();
        });
        
        // Cambio de vista
        document.getElementById('viewDay')?.addEventListener('click', () => {
            this.changeView('day');
        });
        
        document.getElementById('viewWeek')?.addEventListener('click', () => {
            this.changeView('week');
        });
        
        document.getElementById('viewMonth')?.addEventListener('click', () => {
            this.changeView('month');
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
    
    changeView(mode) {
        this.viewMode = mode;
        
        // Actualizar botones activos
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active');
        
        this.renderCalendar();
    }
    
    changePeriod(direction) {
        if (this.viewMode === 'week') {
            const newDate = new Date(this.currentWeekStart);
            newDate.setDate(newDate.getDate() + (direction * 7));
            this.currentWeekStart = newDate;
        } else if (this.viewMode === 'month') {
            const newDate = new Date(this.currentDate);
            newDate.setMonth(newDate.getMonth() + direction);
            this.currentDate = newDate;
            this.currentWeekStart = this.getMonday(newDate);
        } else if (this.viewMode === 'day') {
            this.changeDay(direction);
            return;
        }
        this.renderCalendar();
    }
    
    changeDay(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentDate = newDate;
        this.currentWeekStart = this.getMonday(newDate);
        this.renderCalendar();
    }

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    renderCalendar() {
        if (this.viewMode === 'day') {
            this.renderDayView();
        } else if (this.viewMode === 'week') {
            this.renderWeekView();
        } else if (this.viewMode === 'month') {
            this.renderMonthView();
        }
    }
    
    renderDayView() {
        // Actualizar título
        const dateStr = this.currentDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        document.getElementById('calendarTitle').textContent = 
            dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        
        // Renderizar grid para un solo día
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        const horas = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        let html = '<div class="calendar-header-cell">Hora</div>';
        html += `<div class="calendar-header-cell">${this.currentDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</div>`;
        
        const dateStr2 = this.formatDateForAPI(this.currentDate);
        
        horas.forEach(hora => {
            html += `<div class="calendar-time-cell">${hora}</div>`;
            
            const citasDelSlot = this.citas.filter(cita => {
                const citaFecha = Array.isArray(cita.fechaCita) 
                    ? `${cita.fechaCita[0]}-${String(cita.fechaCita[1]).padStart(2, '0')}-${String(cita.fechaCita[2]).padStart(2, '0')}`
                    : cita.fechaCita;
                
                const citaHora = Array.isArray(cita.horaCita)
                    ? `${String(cita.horaCita[0]).padStart(2, '0')}:${String(cita.horaCita[1]).padStart(2, '0')}`
                    : cita.horaCita;
                
                return citaFecha === dateStr2 && citaHora.startsWith(hora.substring(0, 2));
            });
            
            html += `<div class="calendar-cell" data-date="${dateStr2}" data-hora="${hora}">`;
            
            citasDelSlot.forEach(cita => {
                const estadoClass = (cita.estadoCita || cita.estado || 'pendiente').toLowerCase();
                const clienteNombre = cita.cliente?.nombre || cita.cliente_nombre || 'Cliente';
                const servicioNombre = cita.servicio?.nombre || cita.servicio_nombre || '';
                const citaId = cita.idCita || cita.id;
                
                html += `
                    <div class="appointment-card ${estadoClass}" onclick="calendarioAdmin.showCitaDetail(${citaId})">
                        <div class="appointment-client">${clienteNombre}</div>
                        <div class="appointment-service">${servicioNombre}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        grid.innerHTML = html;
    }
    
    renderWeekView() {
        // Actualizar título
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
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
                    // Manejar diferentes formatos de fecha: "2025-11-22" o [2025, 11, 22]
                    const citaFecha = Array.isArray(cita.fechaCita) 
                        ? `${cita.fechaCita[0]}-${String(cita.fechaCita[1]).padStart(2, '0')}-${String(cita.fechaCita[2]).padStart(2, '0')}`
                        : cita.fechaCita;
                    
                    // Manejar hora: "10:00:00" o [10, 0, 0]
                    const citaHora = Array.isArray(cita.horaCita)
                        ? `${String(cita.horaCita[0]).padStart(2, '0')}:${String(cita.horaCita[1]).padStart(2, '0')}`
                        : cita.horaCita;
                    
                    return citaFecha === dateStr && citaHora.startsWith(hora.substring(0, 2));
                });
                
                html += `<div class="calendar-cell" data-date="${dateStr}" data-hora="${hora}">`;
                
                citasDelSlot.forEach(cita => {
                    const estadoClass = (cita.estadoCita || cita.estado || 'pendiente').toLowerCase();
                    const clienteNombre = cita.cliente?.nombre || cita.cliente_nombre || 'Cliente';
                    const servicioNombre = cita.servicio?.nombre || cita.servicio_nombre || '';
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
    
    renderMonthView() {
        const monthName = this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        document.getElementById('calendarTitle').textContent = 
            monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        // TODO: Implementar vista mensual (calendario estilo mes)
        // Por ahora mostramos la semana actual del mes seleccionado
        this.renderWeekView();
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
            console.log('loadCitas - Response:', response);
            // Manejar estructura: {data: [...], message: "...", status: "success"}
            this.citas = response.data?.data || response.data || [];
            console.log('Citas cargadas:', this.citas.length);
        } catch (error) {
            console.error('Error al cargar citas:', error);
            this.citas = [];
        }
    }

    renderCalendar() {
        if (this.viewMode === 'day') {
            this.renderDayView();
        } else if (this.viewMode === 'week') {
            this.renderWeekView();
        } else if (this.viewMode === 'month') {
            this.renderMonthView();
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
