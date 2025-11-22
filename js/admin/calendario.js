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
        const user = StateManager.getState('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }

    setupEventListeners() {
        document.getElementById('prevWeek')?.addEventListener('click', () => {
            this.changeWeek(-1);
        });
        
        document.getElementById('nextWeek')?.addEventListener('click', () => {
            this.changeWeek(1);
        });
        
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

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
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
            this.citas = response.data || [];
        } catch (error) {
            console.error('Error al cargar citas:', error);
            this.citas = [];
        }
    }

    renderCalendar() {
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
                    return cita.fecha === dateStr && cita.hora.startsWith(hora.substring(0, 2));
                });
                
                html += `<div class="calendar-cell" data-date="${dateStr}" data-hora="${hora}">`;
                
                citasDelSlot.forEach(cita => {
                    html += `
                        <div class="appointment-card ${cita.estado}" onclick="calendarioAdmin.showCitaDetail(${cita.id})">
                            <div class="appointment-client">${cita.cliente_nombre || 'Cliente'}</div>
                            <div class="appointment-service">${cita.servicio_nombre || ''}</div>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
        });
        
        grid.innerHTML = html;
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
            this.currentCita = response.data;
            
            if (!this.currentCita) {
                throw new Error('Cita no encontrada');
            }
            
            const modal = document.getElementById('modalCita');
            const detalle = document.getElementById('citaDetalle');
            
            const estadoColors = {
                'pendiente': '#f39c12',
                'confirmada': '#27ae60',
                'cancelada': '#e74c3c'
            };
            
            detalle.innerHTML = `
                <div style="padding: 20px 0;">
                    <div style="margin-bottom: 20px; padding: 15px; background: ${estadoColors[this.currentCita.estado]}; color: white; border-radius: 8px; text-align: center;">
                        <strong style="font-size: 18px; text-transform: uppercase;">${this.currentCita.estado}</strong>
                    </div>
                    
                    <div style="display: grid; gap: 15px;">
                        <div>
                            <strong style="color: #7f8c8d;">Cliente:</strong><br>
                            <span style="font-size: 18px; color: var(--admin-primary);">${this.currentCita.cliente_nombre || 'N/A'}</span>
                        </div>
                        
                        <div>
                            <strong style="color: #7f8c8d;">Servicio:</strong><br>
                            <span style="font-size: 16px;">${this.currentCita.servicio_nombre || 'N/A'}</span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #7f8c8d;">Fecha:</strong><br>
                                <span>${this.formatFecha(this.currentCita.fecha)}</span>
                            </div>
                            <div>
                                <strong style="color: #7f8c8d;">Hora:</strong><br>
                                <span>${this.currentCita.hora}</span>
                            </div>
                        </div>
                        
                        ${this.currentCita.estilista_nombre ? `
                            <div>
                                <strong style="color: #7f8c8d;">Estilista:</strong><br>
                                <span>${this.currentCita.estilista_nombre}</span>
                            </div>
                        ` : ''}
                        
                        ${this.currentCita.notas ? `
                            <div>
                                <strong style="color: #7f8c8d;">Notas:</strong><br>
                                <span>${this.currentCita.notas}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Mostrar/ocultar botones según estado
            const btnConfirmar = document.getElementById('btnConfirmar');
            const btnCancelar = document.getElementById('btnCancelar');
            
            if (this.currentCita.estado === 'confirmada') {
                btnConfirmar.style.display = 'none';
            } else {
                btnConfirmar.style.display = 'inline-flex';
            }
            
            if (this.currentCita.estado === 'cancelada') {
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
            await CitasService.update(this.currentCita.id, {
                ...this.currentCita,
                estado: nuevoEstado
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
        const date = new Date(fecha);
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
