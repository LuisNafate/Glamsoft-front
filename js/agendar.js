// Estado de la aplicación
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
let selectedTime = null;
let selectedStylist = null;

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

function openSuccessModal() {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
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
    selectedStylist = null;
    
    const now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    generateCalendar(currentMonth, currentYear);

    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
    
    const modalForm = document.getElementById('pre-cita-form');
    if (modalForm) {
        modalForm.reset();
    }
}

// --- INICIALIZACIÓN DE LA PÁGINA ---

document.addEventListener('DOMContentLoaded', function() {
    
    cargarModalCancelacion();
    cargarYConfigurarModal();
    cargarErrorModal();
    cargarSuccessModal();  // NUEVO
    cargarRejectModal();   // NUEVO
    
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

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.disabled) return;
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            selectedTime = this.textContent;
        });
    });

    document.querySelectorAll('.stylist-card').forEach((card, index) => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedStylist = index; 
        });
    });

    document.querySelector('.btn-cancel').addEventListener('click', function() {
        openCancelModal();
    });
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
        const response = await fetch('modals/agenda_success.html');
        if (!response.ok) {
            throw new Error(`Error al cargar modals/agenda_success.html: ${response.statusText}`);
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
                // Obtener usuario actual
                const user = StateManager.get('user');
                if (!user || !user.idCliente) {
                    openErrorModal('Debes iniciar sesión para agendar una cita.');
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
                
                // Formatear fecha
                const fechaFormateada = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
                
                // Datos de la cita
                const citaData = {
                    idCliente: user.idCliente,
                    idServicio: 1, // TODO: Obtener servicio seleccionado
                    idEstilista: selectedStylist + 1, // selectedStylist es index 0-based
                    fechaCita: fechaFormateada,
                    horaCita: hora24,
                    estadoCita: 'PENDIENTE'
                };
                
                console.log('Creando cita:', citaData);
                
                const response = await CitasService.create(citaData);
                console.log('Cita creada:', response);
                
                openSuccessModal();
                
                // Resetear selecciones
                setTimeout(() => {
                    selectedDate = null;
                    selectedTime = null;
                    selectedStylist = null;
                    generateCalendar(currentMonth, currentYear);
                    document.querySelector('.time-slot.selected')?.classList.remove('selected');
                    document.querySelector('.stylist-card.selected')?.classList.remove('selected');
                }, 2000);
                
            } catch (error) {
                console.error('Error al crear cita:', error);
                openErrorModal('No se pudo agendar la cita. Por favor intenta de nuevo.');
            }
        }

        document.querySelector('.btn-confirm').addEventListener('click', function() {
            
            if (!selectedDate || !selectedTime || selectedStylist === null) {
                let errorMessage = 'Por favor, completa lo siguiente:';
                if (!selectedDate) errorMessage += '\n- Selecciona una fecha';
                if (!selectedTime) errorMessage += '\n- Selecciona un horario';
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

            openPreCitaModal();
        });

    } catch (error) {
        console.error('No se pudo cargar el modal de cita:', error);
        const btnConfirm = document.querySelector('.btn-confirm');
        btnConfirm.textContent = 'Error al cargar';
        btnConfirm.disabled = true;
    }
}