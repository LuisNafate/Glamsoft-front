// js/estilista/calendario.js

class CalendarioEstilista {
    constructor() {
        this.currentUser = null;
        this.currentUserId = null;
        this.allAppointments = [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.currentFilter = 'all';
        this.currentView = 'list';
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadAppointments();
        } catch (error) {
            console.error('Error al inicializar calendario:', error);
        }
    }

    async checkAuth() {
        try {
            // Obtener usuario solo de localStorage
            const userStr = localStorage.getItem('user_data');

            console.log("[CALENDARIO] user_data raw:", userStr);

            if (!userStr) {
                console.warn("[CALENDARIO] No hay usuario en localStorage. Redirigiendo...");
                window.location.href = '../inicio.html';
                return;
            }

            const user = JSON.parse(userStr);
            console.log("[CALENDARIO] Usuario parseado:", user);

            const rol = parseInt(user.idRol || user.rol || 0);
            console.log("[CALENDARIO] Rol detectado:", rol);

            if (rol !== 2 && rol !== 1) {
                console.warn("[CALENDARIO] Rol no autorizado:", rol, "- Se requiere 1 o 2");
                window.location.href = '../inicio.html';
                return;
            }

            const nombre = user.nombre || 'Estilista';
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombre;

            this.currentUser = user;
            this.currentUserId = user.idUsuario || user.id;

            console.log("[CALENDARIO] ✅ Auth exitosa. Usuario ID:", this.currentUserId);

        } catch (error) {
            console.error("[CALENDARIO] ❌ Error auth:", error);
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

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.updateCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.updateCalendar();
        });

        // View toggle
        document.getElementById('listViewBtn')?.addEventListener('click', () => {
            this.switchView('list');
        });

        document.getElementById('calendarViewBtn')?.addEventListener('click', () => {
            this.switchView('calendar');
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.applyFilter();
            });
        });
    }

    switchView(view) {
        this.currentView = view;

        const listView = document.getElementById('listView');
        const calendarView = document.getElementById('calendarView');
        const listBtn = document.getElementById('listViewBtn');
        const calendarBtn = document.getElementById('calendarViewBtn');

        if (view === 'list') {
            listView.style.display = 'block';
            calendarView.classList.remove('active');
            listBtn.classList.add('active');
            calendarBtn.classList.remove('active');
        } else {
            listView.style.display = 'none';
            calendarView.classList.add('active');
            listBtn.classList.remove('active');
            calendarBtn.classList.add('active');
            this.renderCalendar();
        }
    }

    async loadAppointments() {
        this.showLoader();
        try {
            const response = await CitasService.getAll();
            const todasCitas = response.data || response || [];

            // Filtrar solo mis citas
            this.allAppointments = todasCitas.filter(cita => {
                const idEstilista = cita.idEstilista || (cita.estilista ? cita.estilista.id : 0);
                return idEstilista == this.currentUserId;
            });

            console.log(`Citas cargadas: ${this.allAppointments.length}`);

            this.updateCalendar();
            this.applyFilter();

        } catch (error) {
            console.error('Error al cargar citas:', error);
            this.showError('Error al cargar las citas');
        } finally {
            this.hideLoader();
        }
    }

    updateCalendar() {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        if (this.currentView === 'calendar') {
            this.renderCalendar();
        }
    }

    renderCalendar() {
        const grid = document.getElementById('daysGrid');
        if (!grid) return;

        // Primer día del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Días del mes anterior
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

        let html = '';

        // Días del mes anterior
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
        }

        // Días del mes actual
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];

            const isToday = date.toDateString() === today.toDateString();
            const hasAppointments = this.allAppointments.some(apt => {
                const aptDate = apt.fecha || (apt.fechaHoraCita ? apt.fechaHoraCita.split('T')[0] : '');
                return aptDate === dateStr;
            });

            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (hasAppointments) classes += ' has-appointments';

            html += `
                <div class="${classes}">
                    <div class="day-number">${day}</div>
                    ${hasAppointments ? '<div class="day-indicator"></div>' : ''}
                </div>
            `;
        }

        // Completar con días del siguiente mes
        const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
        }

        grid.innerHTML = html;
    }

    applyFilter() {
        let filtered = [...this.allAppointments];

        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(apt => {
                const estado = (apt.estado || apt.estadoCita || '').toLowerCase();
                return estado === this.currentFilter;
            });
        }

        // Filtrar por mes actual
        filtered = filtered.filter(apt => {
            const fecha = apt.fecha || (apt.fechaHoraCita ? apt.fechaHoraCita.split('T')[0] : '');
            const date = new Date(fecha);
            return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
        });

        this.renderAppointments(filtered);
    }

    renderAppointments(appointments) {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-calendar-x"></i>
                    <h3>No hay citas para este mes</h3>
                    <p>Las citas agendadas aparecerán aquí</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha
        const sorted = [...appointments].sort((a, b) => {
            const dateA = new Date(a.fecha || a.fechaHoraCita);
            const dateB = new Date(b.fecha || b.fechaHoraCita);
            return dateA - dateB;
        });

        container.innerHTML = sorted.map(apt => {
            let fecha = 'S/F';
            let hora = '--:--';

            if (apt.fechaHoraCita) {
                const partes = apt.fechaHoraCita.split('T');
                fecha = partes[0];
                hora = partes[1].substring(0, 5);
            } else if (apt.fecha) {
                fecha = apt.fecha;
                hora = apt.hora ? apt.hora.substring(0, 5) : '';
            }

            const fechaObj = new Date(fecha);
            const fechaLegible = fechaObj.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });

            const cliente = apt.clienteNombre || (apt.cliente ? apt.cliente.nombre : 'Cliente');

            let servicio = 'Servicio General';
            if (apt.servicios && Array.isArray(apt.servicios) && apt.servicios.length > 0) {
                servicio = apt.servicios[0].nombre || apt.servicios[0];
                if (apt.servicios.length > 1) servicio += ` (+${apt.servicios.length - 1})`;
            } else if (apt.servicioNombre) {
                servicio = apt.servicioNombre;
            }

            const estado = (apt.estado || apt.estadoCita || 'pendiente').toLowerCase();
            const estadoClass = `status-${estado}`;
            const estadoText = estado.charAt(0).toUpperCase() + estado.slice(1);

            return `
                <div class="appointment-card">
                    <div class="appointment-info">
                        <div class="appointment-time">
                            <div class="appointment-hour">${hora}</div>
                            <div class="appointment-date">${fechaLegible}</div>
                        </div>
                        <div class="appointment-details">
                            <h4>${cliente}</h4>
                            <div class="appointment-service">
                                <i class="ph ph-scissors"></i> ${servicio}
                            </div>
                            <div class="appointment-client">
                                <i class="ph ph-calendar"></i> ${fecha}
                            </div>
                        </div>
                    </div>
                    <div class="appointment-status ${estadoClass}">
                        ${estadoText}
                    </div>
                </div>
            `;
        }).join('');
    }

    showError(message) {
        const container = document.getElementById('appointmentsList');
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
    new CalendarioEstilista();
});
