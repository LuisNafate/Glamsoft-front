// Estado de la aplicación
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
let selectedTime = null;
let selectedService = null;
let selectedStylist = null;
let todosLosEstilistas = []; // Cache de todos los estilistas

const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

// --- FUNCIONES DEL MODAL DE CANCELACIÓN ---

function openCancelModal() {
    const cancelModal = document.getElementById('cancel-modal');
    if (cancelModal) {
        cancelModal.classList.add('visible');
    }
}

function closeCancelModal() {
    const cancelModal = document.getElementById('cancel-modal');
    if (cancelModal) {
        cancelModal.classList.remove('visible');
    }
}

// --- FUNCIONES DEL MODAL DE ERROR ---

function openErrorModal(message) {
    const errorModal = document.getElementById('error-modal');
    const errorMessageElement = document.getElementById('error-modal-message');
    
    if (errorModal && errorMessageElement) {
        errorMessageElement.textContent = message;
        errorModal.classList.add('visible');
    } else {
        console.error("El modal de error no se encontró en el DOM.");
        alert(message);
    }
}

function closeErrorModal() {
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
        errorModal.classList.remove('visible');
    }
}

// --- FUNCIONES DEL MODAL DE ÉXITO ---

function openSuccessModal(citaData = {}) {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        // Actualizar los datos del resumen en el modal
        if (citaData.fecha) {
            const fechaElement = document.getElementById('cita-fecha');
            if (fechaElement) {
                // Formatear fecha a formato legible (DD/MM/YYYY)
                const [year, month, day] = citaData.fecha.split('-');
                fechaElement.textContent = `${day}/${month}/${year}`;
            }
        }

        if (citaData.hora) {
            const horaElement = document.getElementById('cita-hora');
            if (horaElement) {
                // Convertir de formato 24h a 12h con AM/PM
                const [hours, minutes] = citaData.hora.split(':');
                const horaNum = parseInt(hours);
                const hora12 = horaNum === 0 ? 12 : horaNum > 12 ? horaNum - 12 : horaNum;
                const periodo = horaNum >= 12 ? 'PM' : 'AM';
                horaElement.textContent = `${hora12}:${minutes} ${periodo}`;
            }
        }

        if (citaData.estilista) {
            const estilistaElement = document.getElementById('cita-estilista');
            if (estilistaElement) {
                estilistaElement.textContent = citaData.estilista;
            }
        }

        if (citaData.servicio) {
            const servicioElement = document.getElementById('cita-servicio');
            if (servicioElement) {
                servicioElement.textContent = citaData.servicio;
            }
        }

        if (citaData.precio !== undefined && citaData.precio !== null) {
            const precioElement = document.getElementById('cita-precio');
            if (precioElement) {
                precioElement.textContent = `$${Number(citaData.precio).toLocaleString('es-CO')}`;
            }
        }

        successModal.classList.add('visible');
    }
}

function closeSuccessModal() {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.classList.remove('visible');
    }
}

// --- FUNCIONES DEL MODAL DE RECHAZO ---

function openRejectModal() {
    const rejectModal = document.getElementById('reject-modal');
    if (rejectModal) {
        rejectModal.classList.add('visible');
    }
}

function closeRejectModal() {
    const rejectModal = document.getElementById('reject-modal');
    if (rejectModal) {
        rejectModal.classList.remove('visible');
    }
}

// --- FUNCIONES PRINCIPALES ---

function generateCalendar(month, year) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    
    monthDisplay.textContent = `${months[month]} ${year}`;
    calendarGrid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate < now) {
            dayElement.classList.add('disabled');
            dayElement.style.cursor = 'not-allowed';
            dayElement.style.opacity = '0.3';
        } else {
            if (day === selectedDate && month === currentMonth && year === currentYear) {
                dayElement.classList.add('active');
            }
            
            dayElement.addEventListener('click', function() {
                document.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('active');
                });
                this.classList.add('active');
                selectedDate = day;
                updateTimeSlots();
            });
        }
        calendarGrid.appendChild(dayElement);
    }
}

function updateTimeSlots() {
    if (!selectedDate) return;
    
    const timeSlots = document.querySelectorAll('.time-slot');
    const now = new Date();
    const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    const isToday = selectedDateObj.getTime() === todayObj.getTime();
    
    if (isToday) {
        const currentHour = now.getHours();
        
        timeSlots.forEach(slot => {
            let slotHour = parseInt(slot.textContent.split(':')[0]);
            const isPM = slot.textContent.includes('PM');
            const is12 = slotHour === 12;

            if (isPM && !is12) slotHour += 12;
            if (!isPM && is12) slotHour = 0;
            
            if (slotHour <= currentHour) {
                slot.style.opacity = '0.3';
                slot.style.cursor = 'not-allowed';
                slot.disabled = true;
                slot.classList.remove('selected');
                if (selectedTime === slot.textContent) selectedTime = null;
            } else {
                slot.style.opacity = '1';
                slot.style.cursor = 'pointer';
                slot.disabled = false;
            }
        });
    } else {
        timeSlots.forEach(slot => {
            slot.style.opacity = '1';
            slot.style.cursor = 'pointer';
            slot.disabled = false;
        });
    }
}

function resetSelections() {
    selectedDate = null;
    selectedTime = null;
    selectedService = null;
    selectedStylist = null;

    const now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    generateCalendar(currentMonth, currentYear);

    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));

    const modalForm = document.getElementById('pre-cita-form');
    if (modalForm) {
        modalForm.reset();
    }

    // Recargar todos los estilistas
    renderizarEstilistas(todosLosEstilistas);
}

// ================== CARGAR HORARIOS (TIME SLOTS) DESDE LA API ==================
async function loadTimeSlots() {
    try {
        console.log('🕒 Cargando horarios desde la API...');
        const response = await HorariosService.getAll();
        console.log('🕒 Horarios recibidos:', response);

        // Extraer el array de horarios de la respuesta
        const horarios = response.data || response;

        const timeSlotsContainer = document.querySelector('.time-slots');
        if (!timeSlotsContainer) return;

        // Limpiar time slots actuales
        timeSlotsContainer.innerHTML = '';

        if (horarios && horarios.length > 0) {
            // Tomar el primer horario disponible como referencia
            const horario = horarios[0];
            console.log('📋 Primer horario:', horario);

            // Convertir horaInicio y horaFin a string si son objetos LocalTime
            let horaInicio = horario.horaInicio;
            let horaFin = horario.horaFin;

            // Si horaInicio es un objeto (ej: {hour: 9, minute: 0, second: 0})
            if (typeof horaInicio === 'object' && horaInicio !== null) {
                horaInicio = `${String(horaInicio.hour || 9).padStart(2, '0')}:${String(horaInicio.minute || 0).padStart(2, '0')}:${String(horaInicio.second || 0).padStart(2, '0')}`;
            }
            if (typeof horaFin === 'object' && horaFin !== null) {
                horaFin = `${String(horaFin.hour || 19).padStart(2, '0')}:${String(horaFin.minute || 0).padStart(2, '0')}:${String(horaFin.second || 0).padStart(2, '0')}`;
            }

            // Valores por defecto
            horaInicio = horaInicio || '09:00:00';
            horaFin = horaFin || '19:00:00';

            console.log('⏰ Hora inicio:', horaInicio, '- Hora fin:', horaFin);

            // Parsear horas
            const [inicioHora] = String(horaInicio).split(':').map(Number);
            const [finHora] = String(horaFin).split(':').map(Number);

            // Generar time slots cada hora
            for (let hora = inicioHora; hora < finHora; hora++) {
                const timeSlot = document.createElement('button');
                timeSlot.className = 'time-slot';

                // Formatear hora a formato 12 horas con AM/PM
                const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
                const periodo = hora >= 12 ? 'PM' : 'AM';
                timeSlot.textContent = `${hora12}:00 ${periodo}`;

                // Agregar evento de click
                timeSlot.addEventListener('click', function() {
                    if (this.disabled) return;
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTime = this.textContent;
                });

                timeSlotsContainer.appendChild(timeSlot);
            }
        } else {
            // Si no hay horarios, usar horarios por defecto
            const defaultSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
            defaultSlots.forEach(time => {
                const timeSlot = document.createElement('button');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = time;

                timeSlot.addEventListener('click', function() {
                    if (this.disabled) return;
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTime = this.textContent;
                });

                timeSlotsContainer.appendChild(timeSlot);
            });
        }

        // Actualizar disponibilidad según fecha seleccionada
        updateTimeSlots();

    } catch (error) {
        console.error('Error al cargar horarios:', error);
        // En caso de error, usar horarios por defecto
        const timeSlotsContainer = document.querySelector('.time-slots');
        if (timeSlotsContainer) {
            const defaultSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
            timeSlotsContainer.innerHTML = '';
            defaultSlots.forEach(time => {
                const timeSlot = document.createElement('button');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = time;

                timeSlot.addEventListener('click', function() {
                    if (this.disabled) return;
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTime = this.textContent;
                });

                timeSlotsContainer.appendChild(timeSlot);
            });
        }
    }
}

// ================== CARGAR SERVICIOS DESDE LA API ==================
let todosLosServicios = [];
let serviciosOrdenados = [];
let mostrandoTodosLosServicios = false;

async function loadServicios() {
    try {
        console.log('🛍️ Cargando servicios desde la API...');
        const response = await ServiciosService.getAll();
        console.log('🛍️ Servicios recibidos:', response);

        const servicios = response.data || response;

        // Filtrar solo servicios activos
        const serviciosActivos = servicios.filter(servicio => servicio.activo === true || servicio.activo === 1);
        todosLosServicios = serviciosActivos;

        console.log(`🛍️ Servicios activos: ${serviciosActivos.length} de ${servicios.length} total`);

        if (serviciosActivos && serviciosActivos.length > 0) {
            // Ordenar servicios por popularidad/valoración
            serviciosOrdenados = [...serviciosActivos].sort((a, b) => {
                const ratingA = a.rating || a.valoracion || a.vecesSolicitado || 0;
                const ratingB = b.rating || b.valoracion || b.vecesSolicitado || 0;
                return ratingB - ratingA;
            });

            // Mostrar solo los primeros 3
            renderizarServicios(serviciosOrdenados.slice(0, 3));

            // Mostrar botón "Mostrar más" si hay más de 3 servicios activos
            const btnMostrarMas = document.getElementById('mostrar-mas-servicios');
            if (btnMostrarMas && serviciosActivos.length > 3) {
                btnMostrarMas.style.display = 'block';
                btnMostrarMas.onclick = function() {
                    if (!mostrandoTodosLosServicios) {
                        renderizarServicios(serviciosOrdenados);
                        btnMostrarMas.textContent = 'Mostrar menos';
                        mostrandoTodosLosServicios = true;
                    } else {
                        renderizarServicios(serviciosOrdenados.slice(0, 3));
                        btnMostrarMas.textContent = 'Mostrar más servicios';
                        mostrandoTodosLosServicios = false;
                    }
                };
            }
        } else {
            const servicesGrid = document.querySelector('.services-grid');
            if (servicesGrid) {
                servicesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay servicios disponibles</p>';
            }
        }
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Error al cargar servicios</p>';
        }
    }
}

function renderizarServicios(servicios) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = '';

    servicios.forEach((servicio) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.idServicio = servicio.idServicio || servicio.id;

        const precio = servicio.precio || 0;
        const duracion = servicio.duracion || servicio.tiempoAproximado || '60 min';
        const descripcion = servicio.descripcion || '';

        card.innerHTML = `
            <div class="service-name">${servicio.nombre || servicio.nombreServicio || 'Servicio'}</div>
            ${descripcion ? `<div class="service-description">${descripcion}</div>` : ''}
            <div class="service-price">$${Number(precio).toLocaleString('es-CO')}</div>
            <div class="service-duration">${duracion}</div>
        `;

        // IMPORTANTE: Agregar evento de click para filtrar estilistas
        card.addEventListener('click', async function() {
            // Limpiar selección previa
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Guardar servicio seleccionado
            selectedService = this.dataset.idServicio;
            console.log('🎯 Servicio seleccionado:', selectedService);

            // Filtrar estilistas por servicio
            await filtrarEstilistasPorServicio(selectedService);
        });

        servicesGrid.appendChild(card);
    });
}

// ================== CARGAR ESTILISTAS DESDE LA API ==================
async function loadEstilistas() {
    try {
        console.log('👨‍💼 Cargando estilistas desde la API...');
        const response = await EstilistasService.getAll();
        console.log('👨‍💼 Estilistas recibidos:', response);

        // Extraer el array de estilistas de la respuesta
        const estilistas = response.data || response;

        // Guardar en cache para filtrar después
        todosLosEstilistas = estilistas;

        renderizarEstilistas(estilistas);
    } catch (error) {
        console.error('Error al cargar estilistas:', error);
        const stylistsGrid = document.querySelector('.stylists-grid');
        if (stylistsGrid) {
            stylistsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Error al cargar estilistas</p>';
        }
    }
}

// ================== RENDERIZAR ESTILISTAS ==================
function renderizarEstilistas(estilistas) {
    const stylistsGrid = document.querySelector('.stylists-grid');
    if (!stylistsGrid) return;

    // Limpiar la grid actual
    stylistsGrid.innerHTML = '';

    // Renderizar estilistas
    if (estilistas && estilistas.length > 0) {
        estilistas.forEach((estilista, index) => {
            const card = document.createElement('div');
            card.className = 'stylist-card';
            // IMPORTANTE: Usar idEmpleado para las citas, no idUsuario
            const idEmpleado = estilista.idEmpleado || estilista.idEstilista;
            card.dataset.idEstilista = idEmpleado || index;
            console.log(`👨‍💼 Estilista: ${estilista.nombre}, idEmpleado: ${idEmpleado}, idUsuario: ${estilista.idUsuario}`);

            // Usar imagen del estilista o placeholder
            const imagenUrl = estilista.urlImagen ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(estilista.nombre || 'Estilista')}&size=200&background=B8860B&color=fff`;

            card.innerHTML = `
                <div class="stylist-image">
                    <img src="${imagenUrl}" alt="${estilista.nombre || 'Estilista'}" onerror="this.src='https://ui-avatars.com/api/?name=E&size=200&background=B8860B&color=fff'">
                </div>
                <p class="stylist-name">${estilista.nombre || 'Sin nombre'}</p>
            `;

            // Agregar evento de click
            card.addEventListener('click', function() {
                document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedStylist = this.dataset.idEstilista;
                console.log('✅ Estilista seleccionado - idEmpleado:', selectedStylist);
            });

            stylistsGrid.appendChild(card);
        });
    } else {
        // Si no hay estilistas, mostrar mensaje
        stylistsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay estilistas disponibles para este servicio</p>';
    }
}

// ================== FILTRAR ESTILISTAS POR SERVICIO ==================
async function filtrarEstilistasPorServicio(idServicio) {
    try {
        console.log('🔍 Filtrando estilistas por servicio:', idServicio);

        // Usar el endpoint de estilistas por servicio
        const response = await EstilistasService.getByServicio(idServicio);
        const estilistasFiltrados = response.data || response;

        console.log('✅ Estilistas que ofrecen este servicio:', estilistasFiltrados);

        // Limpiar selección actual de estilista
        selectedStylist = null;

        // Renderizar estilistas filtrados
        renderizarEstilistas(estilistasFiltrados);

    } catch (error) {
        console.error('Error al filtrar estilistas:', error);
        // Si no hay endpoint específico, filtrar localmente (fallback)
        console.warn('Usando todos los estilistas como fallback');
        renderizarEstilistas(todosLosEstilistas);
    }
}

// --- INICIALIZACIÓN DE LA PÁGINA ---

document.addEventListener('DOMContentLoaded', function() {

    // Inicializar EmailJS
    if (typeof EmailService !== 'undefined') {
        EmailService.init();
    }

    // Forzar reinicialización del StateManager para cargar el usuario
    if (typeof StateManager !== 'undefined') {
        StateManager.init();
        console.log('StateManager reinicializado. Usuario:', StateManager.get('user'));
    }

    // Verificar que el usuario esté logeado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('Usuario logeado:', isLoggedIn);

    if (!isLoggedIn) {
        console.warn('Usuario no está logeado, redirigiendo a inicio...');
        window.location.href = 'inicio.html';
        return;
    }

    cargarModalCancelacion();
    cargarYConfigurarModal();
    cargarErrorModal();
    cargarSuccessModal();
    cargarRejectModal();
    cargarFormularioCitaModal();

    loadTimeSlots(); // Cargar horarios desde la API
    loadServicios(); // Cargar servicios disponibles
    loadEstilistas(); // Cargar estilistas desde la API

    generateCalendar(currentMonth, currentYear);

    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    document.getElementById('prevMonth').addEventListener('click', function() {
        const now = new Date();
        const targetMonth = currentMonth - 1;
        const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
        const normalizedMonth = targetMonth < 0 ? 11 : targetMonth;
        
        if (targetYear < now.getFullYear() || (targetYear === now.getFullYear() && normalizedMonth < now.getMonth())) {
            openErrorModal('No puedes navegar a meses anteriores al actual.');
            return;
        }
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });

    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    // Los event listeners de time-slot y stylist-card ahora se agregan dinámicamente
    // cuando se cargan desde la API en loadTimeSlots() y loadEstilistas()

    document.querySelector('.btn-cancel').addEventListener('click', function() {
        openCancelModal();
    });

    // Servicio preseleccionado al venir desde servicios.html
    try {
        const preselected = localStorage.getItem('servicioSeleccionado');
        if (preselected) {
            selectedService = parseInt(preselected);
            localStorage.removeItem('servicioSeleccionado');
            const servicesSection = document.querySelector('.services-section');
            if (servicesSection) servicesSection.style.display = 'none';
            const btnMostrarMas = document.getElementById('mostrar-mas-servicios');
            if (btnMostrarMas) btnMostrarMas.style.display = 'none';
            // Cargar sólo estilistas que dan este servicio
            filtrarEstilistasPorServicio(selectedService).catch(err => console.warn('Error filtrando estilistas:', err));
        }
    } catch (e) {
        console.warn('No se pudo aplicar servicio preseleccionado:', e);
    }
});

async function cargarModalCancelacion() {
    try {
        const response = await fetch('modals/agenda_confirm.html');
        if (!response.ok) {
            throw new Error(`Error al cargar el modal de cancelación: ${response.statusText}`);
        }
        const htmlModal = await response.text();
        
        const placeholder = document.getElementById('modal-placeholder-agendar');
        if (placeholder) {
            placeholder.innerHTML = htmlModal;
            
            document.getElementById('cancel-modal-close').addEventListener('click', closeCancelModal);
            document.getElementById('cancel-no').addEventListener('click', closeCancelModal);
            document.getElementById('cancel-yes').addEventListener('click', function() {
                window.location.href = 'servicios.html';
            });
            
            document.getElementById('cancel-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeCancelModal();
                }
            });
        }
    } catch (error) {
        console.error('No se pudo cargar el modal de cancelación:', error);
    }
}

async function cargarErrorModal() {
    try {
        const response = await fetch('modals/agenda_error.html'); 
        if (!response.ok) {
            throw new Error(`Error al cargar modals/agenda_error.html: ${response.statusText}`);
        }
        const htmlModal = await response.text();

        const placeholder = document.getElementById('modal-placeholder-error');
        if (placeholder) {
            placeholder.innerHTML = htmlModal;

            document.getElementById('error-modal-ok').addEventListener('click', closeErrorModal);
            document.getElementById('error-modal-close-x').addEventListener('click', closeErrorModal);
            
            document.getElementById('error-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeErrorModal();
                }
            });
        }

    } catch (error) {
        console.error('No se pudo cargar el modal de error:', error);
    }
}

// --- NUEVA FUNCIÓN PARA CARGAR EL MODAL DE ÉXITO ---
async function cargarSuccessModal() {
    try {
        const response = await fetch('modals/agenda_sucess.html'); // Nota: el archivo tiene typo "sucess"
        if (!response.ok) {
            throw new Error(`Error al cargar modals/agenda_sucess.html: ${response.statusText}`);
        }
        const htmlModal = await response.text();

        const placeholder = document.getElementById('modal-placeholder-success');
        if (placeholder) {
            placeholder.innerHTML = htmlModal;

            document.getElementById('success-modal-btn').addEventListener('click', function() {
                closeSuccessModal();
                resetSelections();
            });
            
            document.getElementById('success-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeSuccessModal();
                    resetSelections();
                }
            });
        }
    } catch (error) {
        console.error('No se pudo cargar el modal de éxito:', error);
    }
}

// --- NUEVA FUNCIÓN PARA CARGAR EL MODAL DE RECHAZO ---
async function cargarRejectModal() {
    try {
        const response = await fetch('modals/agenda_reject.html');
        if (!response.ok) {
            throw new Error(`Error al cargar modals/agenda_reject.html: ${response.statusText}`);
        }
        const htmlModal = await response.text();

        const placeholder = document.getElementById('modal-placeholder-reject');
        if (placeholder) {
            placeholder.innerHTML = htmlModal;

            document.getElementById('reject-modal-btn').addEventListener('click', function() {
                closeRejectModal();
                resetSelections();
            });

            document.getElementById('reject-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeRejectModal();
                    resetSelections();
                }
            });
        }
    } catch (error) {
        console.error('No se pudo cargar el modal de rechazo:', error);
    }
}

// --- FUNCIÓN PARA CARGAR EL MODAL DE FORMULARIO PERSONALIZADO ---
async function cargarFormularioCitaModal() {
    try {
        const response = await fetch('modals/formulario_cita.html');
        if (!response.ok) {
            throw new Error(`Error al cargar modals/formulario_cita.html: ${response.statusText}`);
        }
        const htmlModal = await response.text();

        const placeholder = document.getElementById('modal-placeholder-formulario');
        if (placeholder) {
            placeholder.innerHTML = htmlModal;
            initFormularioCitaModal();
        }
    } catch (error) {
        console.error('No se pudo cargar el modal de formulario:', error);
    }
}

function initFormularioCitaModal() {
    const modal = document.getElementById('formulario-cita-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-btn-formulario');
    const cancelBtn = modal.querySelector('.btn-cancelar-formulario');
    const formulario = document.getElementById('formularioCitaForm');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejar envío del formulario
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            await enviarCitaConFormulario();
        });
    }
}

/**
 * Cargar preguntas del servicio y mostrar formulario personalizado
 */
async function mostrarFormularioPersonalizado() {
    try {
        console.log('🔍 Cargando preguntas para servicio:', selectedService);
        if (!selectedService) {
            console.warn('No hay servicio seleccionado');
            await enviarCitaConFormulario();
            return;
        }
        // Llamada directa al backend según nueva lógica
        const url = `${API_CONFIG.BASE_URL}/servicios/${selectedService}/preguntas`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const result = await res.json().catch(() => ({}));
        const preguntas = (result && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : []);

        if (preguntas && preguntas.length > 0) {
            console.log('📋 Preguntas recibidas:', preguntas);
            renderizarPreguntasFormulario(preguntas);
            const modal = document.getElementById('formulario-cita-modal');
            if (modal) modal.style.display = 'flex';
        } else {
            console.warn('No hay preguntas configuradas para este servicio, creando cita directamente...');
            await enviarCitaConFormulario();
        }
    } catch (error) {
        console.error('Error al obtener preguntas del servicio:', error);
        await enviarCitaConFormulario();
    }
}

/**
 * Renderizar preguntas dinámicamente en el formulario
 */
function renderizarPreguntasFormulario(preguntas) {
    const container = document.getElementById('preguntasDinamicas');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    if (!preguntas || preguntas.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No hay preguntas adicionales para este servicio.</p>';
        return;
    }

    // Ordenar por campo 'orden'
    const preguntasOrdenadas = [...preguntas].sort((a, b) => (a.orden || 0) - (b.orden || 0));

    preguntasOrdenadas.forEach((pregunta) => {
        const preguntaDiv = document.createElement('div');
        preguntaDiv.className = 'pregunta-item';
        preguntaDiv.dataset.idPregunta = pregunta.idPregunta;

        const label = document.createElement('label');
        label.textContent = pregunta.pregunta;
        if (pregunta.obligatoria) {
            label.innerHTML += ' <span style="color: #dc3545;">*</span>';
        }

        preguntaDiv.appendChild(label);

        let inputElement;

        switch ((pregunta.tipoRespuesta || '').toLowerCase()) {
            case 'texto':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'form-input';
                inputElement.required = pregunta.obligatoria;
                break;

            case 'texto_largo':
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.className = 'form-input';
                inputElement.rows = 4;
                inputElement.required = pregunta.obligatoria;
                break;

            case 'numero':
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.className = 'form-input';
                inputElement.required = pregunta.obligatoria;
                break;

            case 'si_no':
                inputElement = document.createElement('select');
                inputElement.className = 'form-input';
                inputElement.required = pregunta.obligatoria;
                inputElement.innerHTML = `
                    <option value="">Selecciona una opción</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                `;
                break;

            case 'opcion_multiple':
                inputElement = document.createElement('select');
                inputElement.className = 'form-input';
                inputElement.required = pregunta.obligatoria;

                let optionsHTML = '<option value="">Selecciona una opción</option>';
                const opciones = pregunta.opciones || [];

                opciones.forEach(opcion => {
                    optionsHTML += `<option value="${opcion}">${opcion}</option>`;
                });

                inputElement.innerHTML = optionsHTML;
                break;

            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'form-input';
                inputElement.required = pregunta.obligatoria;
        }

        inputElement.name = `pregunta_${pregunta.idPregunta}`;
        preguntaDiv.appendChild(inputElement);
        container.appendChild(preguntaDiv);
    });
}

/**
 * Capturar respuestas del formulario y crear cita
 */
async function enviarCitaConFormulario() {
    try {
        console.log('=== ENVIANDO CITA CON FORMULARIO ===');

        // Capturar respuestas del formulario
        const respuestasFormulario = capturarRespuestasFormulario();
        console.log('📝 Respuestas del formulario:', respuestasFormulario);

        // Cerrar modal del formulario
        const modal = document.getElementById('formulario-cita-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Obtener usuario actual
        let user = StateManager.get('user');
        if (!user) {
            const userDataStr = localStorage.getItem('user_data');
            if (userDataStr) {
                user = JSON.parse(userDataStr);
                StateManager.set('user', user);
            }
        }

        if (!user) {
            openErrorModal('Debes iniciar sesión para agendar una cita.');
            setTimeout(() => window.location.href = 'incio.html', 2000);
            return;
        }

        const idCliente = user.idCliente || user.idUsuario || user.id || user.userId;
        if (!idCliente) {
            openErrorModal('No se pudo obtener tu información de usuario. Por favor, inicia sesión nuevamente.');
            setTimeout(() => window.location.href = 'inicio.html', 2000);
            return;
        }

        // Convertir hora de formato "9:00 AM" a "09:00:00"
        let hora24 = selectedTime;
        if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            hora24 = `${String(hours).padStart(2, '0')}:${minutes}:00`;
        }

        // Formatear fecha en formato YYYY-MM-DD
        const fechaFormateada = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

        const idServicio = selectedService ? parseInt(selectedService) : null;
        if (!idServicio) {
            openErrorModal('Por favor, selecciona un servicio.');
            return;
        }

        // Obtener horario
        let horario = null;
        try {
            horario = await HorariosService.getOrCreateDefault();
        } catch (error) {
            console.warn('⚠️ No se pudo obtener horario:', error);
            openErrorModal('No hay horarios configurados. Por favor, contacta al administrador.');
            return;
        }

        const idHorario = horario.idHorario || horario.id;
        if (!idHorario) {
            openErrorModal('No hay horarios disponibles. Por favor, contacta al administrador.');
            return;
        }

        // IMPORTANTE: Crear cita con respuestas del formulario y estado PENDIENTE
        // selectedStylist contiene el idEmpleado del estilista, no el idUsuario
        const citaData = {
            fecha: fechaFormateada,
            hora: hora24,
            notas: '', // Las notas ahora están en respuestasFormulario
            idCliente: idCliente,
            idEstilista: parseInt(selectedStylist), // ID del EMPLEADO (no usuario)
            idHorario: idHorario,
            servicios: [idServicio],
            estado: 'PENDIENTE', // NUEVO: Estado pendiente por defecto
            respuestasFormulario: respuestasFormulario // NUEVO: Respuestas del formulario
        };

        console.log('📤 Enviando cita con formulario:');
        console.log('👤 ID Cliente:', idCliente);
        console.log('💈 ID Estilista (idEmpleado):', selectedStylist);
        console.log('🛍️  ID Servicio:', idServicio);
        console.log('📝 Respuestas formulario:', respuestasFormulario.length, 'preguntas');
        console.log(JSON.stringify(citaData, null, 2));

        const response = await CitasService.create(citaData);
        console.log('✅ Cita creada exitosamente:', response);

        // Obtener nombres para el resumen
        let nombreServicio = 'Servicio';
        let precioServicio = 0;
        let nombreEstilista = 'Estilista';

        try {
            const servicioResponse = await ServiciosService.getById(idServicio);
            const servicio = servicioResponse.data || servicioResponse;
            nombreServicio = servicio.nombre || servicio.nombreServicio || 'Servicio';
            precioServicio = servicio.precio || 0;
        } catch (error) {
            console.warn('No se pudo obtener el nombre del servicio:', error);
        }

        try {
            const estilistas = await EstilistasService.getAll();
            const estilistasArray = estilistas.data || estilistas;
            const estilista = estilistasArray.find(e =>
                (e.idEstilista || e.idUsuario) == selectedStylist
            );
            nombreEstilista = estilista?.nombre || 'Estilista';
        } catch (error) {
            console.warn('No se pudo obtener el nombre del estilista:', error);
        }

        // MODIFICADO: Mostrar modal de éxito con mensaje de "pendiente de aprobación"
        mostrarModalPendienteAprobacion({
            fecha: fechaFormateada,
            hora: hora24,
            estilista: nombreEstilista,
            servicio: nombreServicio,
            precio: precioServicio
        });

        // IMPORTANTE: NO enviar email aquí - el email se enviará cuando el admin apruebe la cita
        console.log('ℹ️ Email NO enviado - la cita está pendiente de aprobación');

        // Resetear selecciones
        setTimeout(() => {
            selectedDate = null;
            selectedTime = null;
            selectedService = null;
            selectedStylist = null;
            generateCalendar(currentMonth, currentYear);
            document.querySelector('.time-slot.selected')?.classList.remove('selected');
            document.querySelector('.service-card.selected')?.classList.remove('selected');
            document.querySelector('.stylist-card.selected')?.classList.remove('selected');
            renderizarEstilistas(todosLosEstilistas);
        }, 2000);

    } catch (error) {
        console.error('❌ Error al crear cita:', error);

        let mensajeError = 'No se pudo agendar la cita. Por favor intenta de nuevo.';

        if (error.message && error.message.includes('no está disponible')) {
            mensajeError = 'El estilista seleccionado no está disponible en la fecha y hora elegidas. Por favor, selecciona otro horario o estilista.';
        } else if (error.message) {
            mensajeError = error.message;
        }

        openErrorModal(mensajeError);
    }
}

/**
 * Capturar respuestas del formulario dinámico
 */
function capturarRespuestasFormulario() {
    const respuestas = [];
    const preguntasItems = document.querySelectorAll('#preguntasDinamicas .pregunta-item');

    preguntasItems.forEach((item) => {
        const idPregunta = item.dataset.idPregunta;
        const input = item.querySelector('input, textarea, select');

        if (input && input.value) {
            respuestas.push({
                idPregunta: parseInt(idPregunta),
                pregunta: item.querySelector('label').textContent.replace(' *', '').trim(),
                respuesta: input.value
            });
        }
    });

    return respuestas;
}

/**
 * Mostrar modal de éxito con mensaje de "pendiente de aprobación"
 */
function mostrarModalPendienteAprobacion(citaData) {
    const successModal = document.getElementById('success-modal');
    if (!successModal) return;

    // Actualizar mensaje principal
    const tituloModal = successModal.querySelector('h2');
    const mensajeModal = successModal.querySelector('p');

    if (tituloModal) {
        tituloModal.textContent = '¡Solicitud Enviada!';
    }

    if (mensajeModal) {
        mensajeModal.textContent = 'Tu solicitud de cita ha sido enviada y está pendiente de aprobación. Recibirás una notificación cuando sea confirmada.';
    }

    // Actualizar datos del resumen
    if (citaData.fecha) {
        const fechaElement = document.getElementById('cita-fecha');
        if (fechaElement) {
            const [year, month, day] = citaData.fecha.split('-');
            fechaElement.textContent = `${day}/${month}/${year}`;
        }
    }

    if (citaData.hora) {
        const horaElement = document.getElementById('cita-hora');
        if (horaElement) {
            const [hours, minutes] = citaData.hora.split(':');
            const horaNum = parseInt(hours);
            const hora12 = horaNum === 0 ? 12 : horaNum > 12 ? horaNum - 12 : horaNum;
            const periodo = horaNum >= 12 ? 'PM' : 'AM';
            horaElement.textContent = `${hora12}:${minutes} ${periodo}`;
        }
    }

    if (citaData.estilista) {
        const estilistaElement = document.getElementById('cita-estilista');
        if (estilistaElement) {
            estilistaElement.textContent = citaData.estilista;
        }
    }

    if (citaData.servicio) {
        const servicioElement = document.getElementById('cita-servicio');
        if (servicioElement) {
            servicioElement.textContent = citaData.servicio;
        }
    }

    if (citaData.precio !== undefined && citaData.precio !== null) {
        const precioElement = document.getElementById('cita-precio');
        if (precioElement) {
            precioElement.textContent = `$${Number(citaData.precio).toLocaleString('es-CO')}`;
        }
    }

    successModal.classList.add('visible');
}

async function cargarYConfigurarModal() {
    try {
        const response = await fetch('modals/form.html'); 
        
        if (!response.ok) {
            throw new Error(`Error al cargar el modal: ${response.statusText}`);
        }
        
        const htmlModal = await response.text();
        document.getElementById('modal-placeholder-cita').innerHTML = htmlModal;

        const modal = document.getElementById('pre-cita-modal');
        const modalForm = document.getElementById('pre-cita-form');
        const modalCancelBtn = document.getElementById('modal-cancel');

        if (!modal || !modalForm || !modalCancelBtn) {
            console.error('Error: El HTML del modal se cargó, pero los IDs no coinciden.');
            return;
        }

        function openPreCitaModal() {
            modal.classList.add('visible');
        }

        function closePreCitaModal() {
            modal.classList.remove('visible');
        }

        modalCancelBtn.addEventListener('click', function() {
            closePreCitaModal();
            openCancelModal();
        });

        modalForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const formData = {
                alergias: document.getElementById('pregunta-alergias').value,
                condiciones: document.getElementById('pregunta-condiciones').value,
                extra: document.getElementById('pregunta-extra').value,
            };
            
            console.log('Datos del formulario:', formData);
            
            closePreCitaModal();
            
            // Crear la cita en la API
            await crearCitaEnAPI(formData);
        });
        
        // Función para crear cita en la API
        async function crearCitaEnAPI(formData) {
            try {
                console.log('=== INICIANDO CREACIÓN DE CITA ===');
                
                // Obtener usuario actual del StateManager
                let user = StateManager.get('user');
                console.log('Usuario desde StateManager:', user);
                
                // Si no hay usuario en StateManager, intentar cargar desde localStorage
                if (!user) {
                    console.log('No hay usuario en StateManager, buscando en localStorage...');
                    const userDataStr = localStorage.getItem('user_data');
                    console.log('user_data en localStorage:', userDataStr);
                    
                    if (userDataStr) {
                        try {
                            user = JSON.parse(userDataStr);
                            console.log('Usuario recuperado de localStorage:', user);
                            // Guardar en StateManager para futuras referencias
                            StateManager.set('user', user);
                        } catch (e) {
                            console.error('Error al parsear user_data:', e);
                        }
                    }
                }
                
                // Verificar si está logeado
                const isLoggedIn = localStorage.getItem('isLoggedIn');
                console.log('isLoggedIn:', isLoggedIn);
                console.log('Usuario final:', user);
                
                if (!user) {
                    console.error('No se pudo obtener el usuario de ninguna fuente');
                    openErrorModal('Debes iniciar sesión para agendar una cita.');
                    setTimeout(() => window.location.href = 'inicio.html', 2000);
                    return;
                }
                
                // Obtener el ID del cliente (puede estar en diferentes propiedades)
                const idCliente = user.idCliente || user.idUsuario || user.id || user.userId;
                console.log('ID del cliente:', idCliente);
                
                if (!idCliente) {
                    console.error('No se encontró idCliente en el usuario:', user);
                    openErrorModal('No se pudo obtener tu información de usuario. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => window.location.href = 'inicio.html', 2000);
                    return;
                }
                
                // Convertir hora de formato "9:00 AM" a "09:00:00"
                let hora24 = selectedTime;
                if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
                    const [time, period] = selectedTime.split(' ');
                    let [hours, minutes] = time.split(':');
                    hours = parseInt(hours);
                    
                    if (period === 'PM' && hours !== 12) {
                        hours += 12;
                    } else if (period === 'AM' && hours === 12) {
                        hours = 0;
                    }
                    
                    hora24 = `${String(hours).padStart(2, '0')}:${minutes}:00`;
                }
                
                // Formatear fecha en formato YYYY-MM-DD
                const fechaFormateada = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

                // Usar el servicio seleccionado de la página
                const idServicio = selectedService ? parseInt(selectedService) : null;

                if (!idServicio) {
                    openErrorModal('Por favor, selecciona un servicio.');
                    return;
                }

                // TEMPORAL: Obtener un horario válido hasta que el backend se actualice
                console.log('⏰ Obteniendo horario (temporal hasta que backend se actualice)...');
                let horario = null;
                try {
                    horario = await HorariosService.getOrCreateDefault();
                    console.log('✅ Horario obtenido:', horario);
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener horario:', error);
                    openErrorModal('No hay horarios configurados. Por favor, contacta al administrador.');
                    return;
                }

                const idHorario = horario.idHorario || horario.id;
                if (!idHorario) {
                    openErrorModal('No hay horarios disponibles. Por favor, contacta al administrador.');
                    return;
                }

                // Datos de la cita - formato según API
                // NOTA: idHorario es temporal hasta que el backend lo haga opcional
                // IMPORTANTE: selectedStylist ahora contiene el idEmpleado del estilista
                const citaData = {
                    fecha: fechaFormateada, // "2024-07-15"
                    hora: hora24, // "10:30:00"
                    notas: formData.extra || '', // Opcional - campo "extra" del formulario
                    idCliente: idCliente,
                    idEstilista: parseInt(selectedStylist), // ID del EMPLEADO (no usuario)
                    idHorario: idHorario, // TEMPORAL: Se eliminará cuando el backend se actualice
                    servicios: [idServicio]
                };
                
                console.log('=== DATOS DE LA CITA (API FORMAT) ===');
                console.log('📅 Fecha:', fechaFormateada);
                console.log('🕐 Hora:', hora24);
                console.log('👤 ID Cliente:', idCliente);
                console.log('💈 ID Estilista (idEmpleado):', selectedStylist);
                console.log('🛍️  ID Servicio:', idServicio);
                console.log(JSON.stringify(citaData, null, 2));
                console.log('=====================================');
                
                const response = await CitasService.create(citaData);
                console.log('✅ Cita creada exitosamente:', response);

                // Obtener nombres del servicio y estilista para el resumen
                let nombreServicio = 'Servicio';
                let precioServicio = 0;
                let nombreEstilista = 'Estilista';

                try {
                    // Obtener nombre y precio del servicio
                    const servicioResponse = await ServiciosService.getById(idServicio);
                    const servicio = servicioResponse.data || servicioResponse;
                    nombreServicio = servicio.nombre || servicio.nombreServicio || 'Servicio';
                    precioServicio = servicio.precio || 0;
                } catch (error) {
                    console.warn('No se pudo obtener el nombre del servicio:', error);
                }

                try {
                    // Obtener nombre del estilista usando idEmpleado
                    const estilistas = await EstilistasService.getAll();
                    const estilistasArray = estilistas.data || estilistas;
                    const estilista = estilistasArray.find(e =>
                        (e.idEmpleado || e.idEstilista) == selectedStylist
                    );
                    nombreEstilista = estilista?.nombre || 'Estilista';
                } catch (error) {
                    console.warn('No se pudo obtener el nombre del estilista:', error);
                }        // Mostrar modal de éxito con resumen de la cita
                openSuccessModal({
                    fecha: fechaFormateada,
                    hora: hora24,
                    estilista: nombreEstilista,
                    servicio: nombreServicio,
                    precio: precioServicio
                });

                // Enviar email de confirmación
                if (typeof EmailService !== 'undefined' && EmailService.isConfigured()) {
                    EmailService.enviarConfirmacionCita({
                        fecha: fechaFormateada,
                        hora: hora24,
                        estilista: nombreEstilista,
                        servicio: nombreServicio,
                        precio: precioServicio
                    }).then(result => {
                        if (result.success) {
                            console.log('✅ Email de confirmación enviado');
                        } else {
                            console.warn('⚠️ No se pudo enviar el email:', result.message);
                        }
                    });
                } else {
                    console.warn('⚠️ EmailService no configurado - no se enviará correo');
                }

                // Resetear selecciones
                setTimeout(() => {
                    selectedDate = null;
                    selectedTime = null;
                    selectedService = null;
                    selectedStylist = null;
                    generateCalendar(currentMonth, currentYear);
                    document.querySelector('.time-slot.selected')?.classList.remove('selected');
                    document.querySelector('.service-card.selected')?.classList.remove('selected');
                    document.querySelector('.stylist-card.selected')?.classList.remove('selected');
                    renderizarEstilistas(todosLosEstilistas);
                }, 2000);
                
            } catch (error) {
                console.error('❌ Error al crear cita:', error);

                let mensajeError = 'No se pudo agendar la cita. Por favor intenta de nuevo.';

                // Detectar si el estilista no está disponible (error 400 del backend)
                if (error.message && error.message.includes('no está disponible')) {
                    mensajeError = 'El estilista seleccionado no está disponible en la fecha y hora elegidas. Por favor, selecciona otro horario o estilista.';
                } else if (error.message) {
                    // Usar el mensaje de error del backend si está disponible
                    mensajeError = error.message;
                }

                openErrorModal(mensajeError);
            }
        }

        document.querySelector('.btn-confirm').addEventListener('click', async function() {

            if (!selectedDate || !selectedTime || !selectedService || selectedStylist === null) {
                let errorMessage = 'Por favor, completa lo siguiente:';
                if (!selectedDate) errorMessage += '\n- Selecciona una fecha';
                if (!selectedTime) errorMessage += '\n- Selecciona un horario';
                if (!selectedService) errorMessage += '\n- Selecciona un servicio';
                if (selectedStylist === null) errorMessage += '\n- Selecciona un estilista';

                openErrorModal(errorMessage);
                return;
            }

            const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (selectedDateObj < now) {
                openErrorModal('No puedes agendar una cita en una fecha pasada.');
                selectedDate = null;
                generateCalendar(currentMonth, currentYear);
                return;
            }

            const isToday = selectedDateObj.getTime() === now.getTime();
            if (isToday) {
                const currentHour = new Date().getHours();
                let slotHour = parseInt(selectedTime.split(':')[0]);
                const isPM = selectedTime.includes('PM');
                const is12 = slotHour === 12;

                if (isPM && !is12) slotHour += 12;
                if (!isPM && is12) slotHour = 0;

                if (slotHour <= currentHour) {
                    openErrorModal('La hora seleccionada ya pasó. Por favor selecciona otra hora.');
                    selectedTime = null;
                    document.querySelector('.time-slot.selected')?.classList.remove('selected');
                    updateTimeSlots();
                    return;
                }
            }

            // NUEVO: Cargar y mostrar formulario personalizado en lugar de pre-cita-modal
            await mostrarFormularioPersonalizado();
        });

    } catch (error) {
        console.error('No se pudo cargar el modal de cita:', error);
        const btnConfirm = document.querySelector('.btn-confirm');
        btnConfirm.textContent = 'Error al cargar';
        btnConfirm.disabled = true;
    }
}