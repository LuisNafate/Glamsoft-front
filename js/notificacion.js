// --- Función para inicializar los eventos del modal ---
function initNotificacionesModal() {
    const modal = document.getElementById('notificaciones-modal');
    const bellIcon = document.querySelector('.fa-bell');

    if (!modal || !bellIcon) return; // seguridad

    const closeBtn = modal.querySelector('.close-btn');

    // Mostrar modal al hacer clic en la campana
    bellIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // evita que se cierre inmediatamente
        // Alternar visibilidad
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
            loadNotificaciones();
        }
    });

    // Cerrar con el botón "X"
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.style.display = 'none';
    });

    // Cerrar al hacer clic fuera del contenido del modal
    document.addEventListener('click', (e) => {
        // Si hace clic fuera del modal y fuera del icono de la campana
        if (
            modal.style.display === 'block' &&
            !modal.contains(e.target) &&
            !bellIcon.contains(e.target)
        ) {
            modal.style.display = 'none';
        }
    });

    // Cerrar al hacer scroll o deslizar en cualquier parte
    window.addEventListener('scroll', () => {
        if (modal.style.display === 'block') modal.style.display = 'none';
    });

    // Cerrar al deslizar en pantallas táctiles (swipe)
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    window.addEventListener('touchmove', (e) => {
        const touchEndY = e.touches[0].clientY;
        const diff = Math.abs(touchEndY - touchStartY);
        if (diff > 30 && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// --- Función para cargar el HTML del modal y luego inicializarlo ---
function loadModalNotificaciones() {
    fetch('modals/notificaciones.html') // ajusta la ruta si es necesario
        .then((res) => res.text())
        .then((html) => {
            const placeholder = document.getElementById('modal-placeholder');
            placeholder.innerHTML = html;
            initNotificacionesModal();
        })
        .catch((err) =>
            console.error('Error cargando notificaciones:', err)
        );
}

// --- Cargar contenido del modal al inicio ---
document.addEventListener('DOMContentLoaded', loadModalNotificaciones);

// --- Función para llenar la lista de notificaciones ---
function loadNotificaciones() {
    const lista = document.getElementById('notificaciones-list');
    if (!lista) return; // evita errores si aún no existe

    lista.innerHTML = '';
    const notis = [
        'Tienes un nuevo mensaje.',
        'Tu cita ha sido confirmada.',
        'Promoción disponible esta semana.',
    ];

    notis.forEach((noti) => {
        const li = document.createElement('li');
        li.textContent = noti;
        lista.appendChild(li);
    });
}
