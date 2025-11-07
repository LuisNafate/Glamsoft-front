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

// --- FUNCIONES PRINCIPALES (No dependen del modal) ---

// Función para generar el calendario
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

// Actualizar disponibilidad de horarios
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

// Función para resetear toda la selección
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
    
    // Añadimos una comprobación por si el modal aún no existe
    const modalForm = document.getElementById('pre-cita-form');
    if (modalForm) {
        modalForm.reset();
    }
}


// --- INICIALIZACIÓN DE LA PÁGINA ---

// 1. Evento principal que se dispara cuando el HTML básico está listo
document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA INMEDIATA (No depende del modal) ---
    
    // Generar calendario inicial
    generateCalendar(currentMonth, currentYear);
    
    // Animación de entrada
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Listeners del calendario y estilistas
    document.getElementById('prevMonth').addEventListener('click', function() {
        const now = new Date();
        const targetMonth = currentMonth - 1;
        const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
        const normalizedMonth = targetMonth < 0 ? 11 : targetMonth;
        
        if (targetYear < now.getFullYear() || (targetYear === now.getFullYear() && normalizedMonth < now.getMonth())) {
            alert('No puedes navegar a meses anteriores al actual.');
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

    // Botón de cancelar (el principal)
    document.querySelector('.btn-cancel').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cancelar?')) {
            resetSelections();
        }
    });

    // --- LÓGICA ASÍNCRONA (Cargar y configurar el modal) ---
    // Llamamos a la función que cargará el modal y configurará
    // los botones que dependen de él.
    cargarYConfigurarModal();
});


// 2. Función ASÍNCRONA para cargar el modal y configurar sus listeners
async function cargarYConfigurarModal() {
    
    try {
        // --- Carga del Modal ---
        // Asegúrate de que esta ruta sea correcta
        const response = await fetch('modals/form.html'); 
        
        if (!response.ok) {
            throw new Error(`Error al cargar el modal: ${response.statusText}`);
        }
        
        const htmlModal = await response.text();
        
        // Insertar el HTML en el placeholder
        document.getElementById('modal-placeholder-cita').innerHTML = htmlModal;

        // --- Configuración (Ahora el HTML SÍ existe) ---
        
        // Buscamos los elementos del modal
        const modal = document.getElementById('pre-cita-modal');
        const modalForm = document.getElementById('pre-cita-form');
        const modalCancelBtn = document.getElementById('modal-cancel');

        // Si algo falla aquí, es un error en los IDs de tu archivo form.html
        if (!modal || !modalForm || !modalCancelBtn) {
            console.error('Error: El HTML del modal se cargó, pero los IDs no coinciden.');
            return;
        }

        // Funciones para abrir/cerrar
        function openPreCitaModal() {
            modal.classList.add('visible');
        }

        function closePreCitaModal() {
            modal.classList.remove('visible');
        }

        // --- Listeners que DEPENDEN del modal ---
        
        // 1. Botón "Cancelar" DENTRO del modal
        modalCancelBtn.addEventListener('click', closePreCitaModal);

        // 2. Formulario (Submit) DENTRO del modal
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const formData = {
                alergias: document.getElementById('pregunta-alergias').value,
                condiciones: document.getElementById('pregunta-condiciones').value,
                extra: document.getElementById('pregunta-extra').value,
            };
            
            console.log('Datos del formulario:', formData);
            
            closePreCitaModal();
            alert('✅ ¡Cita confirmada exitosamente!\n\nTe esperamos.');
            resetSelections(); 
        });

        // 3. Botón "Confirmar" PRINCIPAL (el verde)
        // Solo ahora le añadimos el listener, porque ya existe la función openPreCitaModal
        document.querySelector('.btn-confirm').addEventListener('click', function() {
            
            // --- Validaciones ---
            if (!selectedDate) {
                alert('Por favor selecciona una fecha para tu cita.');
                return;
            }
            
            const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            if (selectedDateObj < now) {
                alert('No puedes agendar una cita en una fecha pasada.');
                selectedDate = null;
                generateCalendar(currentMonth, currentYear);
                return;
            }
            
            if (!selectedTime) {
                alert('Por favor selecciona una hora para tu cita.');
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
                    alert('La hora seleccionada ya pasó. Por favor selecciona otra hora.');
                    selectedTime = null;
                    updateTimeSlots();
                    return;
                }
            }
            
            let stylistName = "Cualquiera disponible";
            if (selectedStylist !== null) {
                stylistName = document.querySelectorAll('.stylist-name')[selectedStylist].textContent;
            }

            // --- Confirmación y apertura del modal ---
            const confirmation = `
Resumen de tu cita:
━━━━━━━━━━━━━━━━━
📅 Fecha: ${selectedDate} de ${months[currentMonth]} ${currentYear}
🕐 Hora: ${selectedTime}
💇 Estilista: ${stylistName}

¿Confirmar reserva?
            `;
            
            if (confirm(confirmation)) {
                // ¡Esto ahora funciona!
                openPreCitaModal();
            }
        });

    } catch (error) {
        // Manejo de error si el fetch falla
        console.error('No se pudo cargar el modal de cita:', error);
        // Opcional: Informar al usuario
        const btnConfirm = document.querySelector('.btn-confirm');
        btnConfirm.textContent = 'Error al cargar';
        btnConfirm.disabled = true;
    }
}