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
    const tableBody = document.getElementById('citas-table-body');

    if (!userId) {
        alert("Error de sesión. Por favor inicia sesión nuevamente.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Cargar Citas
    await loadCitas();

    async function loadCitas() {
        try {
            // Llamada al servicio (Endpoint: /citas/cliente/:id)
            const response = await CitasService.getByClient(userId);
            console.log("Respuesta Citas:", response);

            // Extracción de datos robusta
            let citas = [];
            if (response.data && Array.isArray(response.data)) {
                citas = response.data;
            } else if (Array.isArray(response)) {
                citas = response;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                citas = response.data.data;
            }

            renderTable(citas);

        } catch (error) {
            console.error("Error al cargar historial:", error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #e74c3c;">Error al cargar las citas. Intente más tarde.</td></tr>`;
        }
    }

    // 3. Renderizar Tabla
   // Reemplaza TU función renderTable actual con esta:
    function renderTable(citas) {
        tableBody.innerHTML = '';

        if (citas.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #aaa;">
                        No tienes citas registradas aún.
                    </td>
                </tr>`;
            return;
        }

        citas.forEach(cita => {
            // 1. Formatear Fechas (YYYY-MM-DD -> DD/MM/YYYY)
            const formatDate = (dateStr) => {
                if (!dateStr) return '-';
                const parts = dateStr.split('-');
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            };

            const fechaCita = formatDate(cita.fecha);
            const fechaSolicitud = formatDate(cita.fechaSolicitud); // Ahora viene del backend
            const hora = cita.hora ? cita.hora.substring(0, 5) : '';

            // 2. Formatear Servicios
            const serviciosTexto = Array.isArray(cita.servicios) 
                ? cita.servicios.join(', ') 
                : cita.servicios || 'Servicio General';

            // 3. Formatear Precio
            const precio = parseFloat(cita.precioTotal || 0).toFixed(2);

            // 4. Estilo de Estatus (Badge)
            // Normalizamos a minúsculas para que coincida con CSS
            const estadoRaw = (cita.estado || 'pendiente').toLowerCase();
            let estadoClass = 'status-pendiente'; // Default
            
            if (estadoRaw.includes('confirmada') || estadoRaw.includes('aprobada')) estadoClass = 'status-confirmada';
            else if (estadoRaw.includes('cancelada') || estadoRaw.includes('rechazada')) estadoClass = 'status-cancelada';
            else if (estadoRaw.includes('completada') || estadoRaw.includes('finalizada')) estadoClass = 'status-completada';
            else if (estadoRaw.includes('pendiente')) estadoClass = 'status-pendiente';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="status-badge ${estadoClass}">
                        ${cita.estado}
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
                        <i class="fas fa-user-tag" style="font-size:0.8em"></i> ${cita.estilista || 'Sin asignar'}
                    </small>
                </td>
                <td style="font-weight: bold; font-family: monospace; font-size: 1.1em;">$${precio}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});