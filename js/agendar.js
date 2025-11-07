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

// Función para generar el calendario
function generateCalendar(month, year) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    
    monthDisplay.textContent = `${months[month]} ${year}`;
    
    calendarGrid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Obtener fecha actual sin horas para comparación exacta
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Días vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);

        // Deshabilitar días pasados
        if (currentDate < now) {
            dayElement.classList.add('disabled');
            dayElement.style.cursor = 'not-allowed';
            dayElement.style.opacity = '0.3';
        } else {
            // Marcar día seleccionado
            if (day === selectedDate && month === currentMonth && year === currentYear) {
                dayElement.classList.add('active');
            }
            
            // Event listener para días habilitados
            dayElement.addEventListener('click', function() {
                // Remover selección anterior
                document.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('active');
                });
                
                this.classList.add('active');
                selectedDate = day;
                
                // Actualizar horarios disponibles
                updateTimeSlots();
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Navegación del calendario con validación
document.getElementById('prevMonth').addEventListener('click', function() {
    const now = new Date();
    const targetMonth = currentMonth - 1;
    const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
    const normalizedMonth = targetMonth < 0 ? 11 : targetMonth;
    
    // Prevenir navegación a meses pasados
    if (targetYear < now.getFullYear() || 
        (targetYear === now.getFullYear() && normalizedMonth < now.getMonth())) {
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

// Selección de hora
document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
        if (this.disabled) return;

        document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
        });
        this.classList.add('selected');
        selectedTime = this.textContent;
    });
});

// Selección de estilista
document.querySelectorAll('.stylist-card').forEach((card, index) => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.stylist-card').forEach(c => {
            c.classList.remove('selected');
        });
        this.classList.add('selected');
        selectedStylist = index;
    });
});

// Botón de cancelar
document.querySelector('.btn-cancel').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas cancelar?')) {
        selectedDate = null;
        selectedTime = null;
        selectedStylist = null;
        
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        generateCalendar(currentMonth, currentYear);

        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
    }
});

// Botón de confirmar con validación completa
document.querySelector('.btn-confirm').addEventListener('click', function() {
    // Validar que se haya seleccionado una fecha
    if (!selectedDate) {
        alert('Por favor selecciona una fecha para tu cita.');
        return;
    }
    
    // Validar que la fecha no sea pasada
    const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (selectedDateObj < now) {
        alert('No puedes agendar una cita en una fecha pasada. Por favor selecciona otra fecha.');
        selectedDate = null;
        generateCalendar(currentMonth, currentYear);
        return;
    }
    
    // Validar hora
    if (!selectedTime) {
        alert('Por favor selecciona una hora para tu cita.');
        return;
    }
    
    // Si es hoy, validar que la hora no haya pasado
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
    
    // Obtener nombre del estilista
    let stylistName = "Cualquiera disponible";
    if (selectedStylist !== null) {
        stylistName = document.querySelectorAll('.stylist-name')[selectedStylist].textContent;
    }

    const confirmation = `
Resumen de tu cita:
━━━━━━━━━━━━━━━━━
📅 Fecha: ${selectedDate} de ${months[currentMonth]} ${currentYear}
🕐 Hora: ${selectedTime}
💇 Estilista: ${stylistName}

¿Confirmar reserva?
    `;
    
    if (confirm(confirmation)) {
        alert('✅ ¡Cita confirmada exitosamente!\n\nTe esperamos.');
        // Aquí iría la lógica para enviar los datos al backend
    }
});

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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    generateCalendar(currentMonth, currentYear);
    
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});