document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== HISTORIAL CITAS INICIADO ===');

    // 1. Verificar sesión
    const userStr = localStorage.getItem('user_data');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    const userId = currentUser.idUsuario || currentUser.id;
    
    // Referencias al DOM
    const tableBody = document.getElementById('citas-table-body');
    const filtroInput = document.getElementById('filtro-fecha'); // El input del buscador

    // Variable global para guardar las citas y poder filtrar
    let todasLasCitas = [];

    if (!userId) {
        alert("Error de sesión. Por favor inicia sesión nuevamente.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Iniciar Carga
    await loadCitas();

    // 3. CONFIGURAR EL BUSCADOR (Filtro)
    if (filtroInput) {
        filtroInput.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase().trim();

            // Filtramos las citas que coincidan con la fecha o estado
            const citasFiltradas = todasLasCitas.filter(cita => {
                // Formatear fecha para buscar (DD/MM/YYYY)
                let fechaVisual = '';
                if (Array.isArray(cita.fechaHoraCita) && cita.fechaHoraCita.length >= 3) {
                    const [year, month, day] = cita.fechaHoraCita;
                    fechaVisual = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                } else if (cita.fecha) {
                    fechaVisual = cita.fecha.split('-').reverse().join('/');
                }

                const estado = (cita.estadoCita || cita.estado || '').toLowerCase();

                return fechaVisual.includes(texto) || estado.includes(texto);
            });

            renderTable(citasFiltradas);
        });
    }

    async function loadCitas() {
        try {
            // Llamada al servicio (Endpoint: /citas/cliente/:id)
            const response = await CitasService.getByClient(userId);
            console.log("Respuesta Citas:", response);

            // Extracción de datos robusta
            if (response.data && Array.isArray(response.data)) {
                todasLasCitas = response.data;
            } else if (Array.isArray(response)) {
                todasLasCitas = response;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                todasLasCitas = response.data.data;
            }

            // Renderizar tabla inicial con todo
            renderTable(todasLasCitas);

        } catch (error) {
            console.error("Error al cargar historial:", error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #e74c3c;">Error al cargar las citas. Intente más tarde.</td></tr>`;
        }
    }

    // 4. Renderizar Tabla (Tu función corregida)
    function renderTable(citas) {
        tableBody.innerHTML = '';

        if (citas.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #aaa;">
                        No se encontraron citas.
                    </td>
                </tr>`;
            return;
        }

        citas.forEach(cita => {
            // 1. Formatear Fechas
            const formatDate = (dateArray) => {
                if (!dateArray) return '-';

                // Si es un array [2025, 11, 28, 13, 0]
                if (Array.isArray(dateArray) && dateArray.length >= 3) {
                    const [year, month, day] = dateArray;
                    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                }

                // Si es string YYYY-MM-DD
                if (typeof dateArray === 'string') {
                    const parts = dateArray.split('-');
                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    return dateArray;
                }

                return '-';
            };

            const formatTime = (dateArray) => {
                if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) return '';
                const [, , , hour, minute] = dateArray;
                return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            };

            const fechaCita = formatDate(cita.fechaHoraCita);
            const fechaSolicitud = formatDate(cita.fechaSolicitud);
            const hora = formatTime(cita.fechaHoraCita) || (cita.hora ? cita.hora.substring(0, 5) : '');

            // 2. Formatear Servicios
            let serviciosTexto = 'Servicio General';
            if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
                serviciosTexto = cita.servicios.map(s => s.nombre || s).join(', ');
            } else if (typeof cita.servicios === 'string') {
                serviciosTexto = cita.servicios;
            }

            // 3. Formatear Precio
            const precio = parseFloat(cita.precioTotal || 0).toFixed(2);

            // 4. Estilo de Estatus (Badge) - Usar estadoCita del backend
            const estadoRaw = (cita.estadoCita || cita.estado || 'PENDIENTE').toUpperCase();
            let estadoClass = 'status-pendiente';
            let estadoTexto = estadoRaw;

            if (estadoRaw.includes('CONFIRMADA') || estadoRaw.includes('APROBADA')) {
                estadoClass = 'status-confirmada';
                estadoTexto = 'Confirmada';
            } else if (estadoRaw.includes('CANCELADA') || estadoRaw.includes('RECHAZADA')) {
                estadoClass = 'status-cancelada';
                estadoTexto = 'Cancelada';
            } else if (estadoRaw.includes('COMPLETADA') || estadoRaw.includes('FINALIZADA')) {
                estadoClass = 'status-completada';
                estadoTexto = 'Completada';
            } else if (estadoRaw.includes('PENDIENTE')) {
                estadoClass = 'status-pendiente';
                estadoTexto = 'Pendiente';
            }

            // Obtener nombre del estilista
            const nombreEstilista = cita.nombreEstilista || cita.estilista || 'Sin asignar';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="status-badge ${estadoClass}">
                        ${estadoTexto}
                    </span>
                </td>
                <td>
                    <div style="font-weight: 500;">${fechaCita}</div>
                    <div style="font-size: 0.85em; color: #888;">${hora} hrs</div>
                </td>
                <td style="color: #666;">${fechaSolicitud}</td>
                <td>
                    <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${serviciosTexto}">
                        ${serviciosTexto}
                    </div>
                    <small style="color:#888; display:block; margin-top:4px;">
                        <i class="fas fa-user-tag" style="font-size:0.8em"></i> ${nombreEstilista}
                    </small>
                </td>
                <td style="font-weight: bold; font-family: monospace; font-size: 1.1em;">$${precio}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});