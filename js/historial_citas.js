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

            const citaId = cita.idCita || cita.id || cita._id;

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
                <td style="text-align:center;">
                    <button title="Agregar comentario" class="btn-comment" data-cita-id="${citaId}" style="background:transparent; border:none; cursor:pointer; color:#B8860B; font-size:18px;">
                        <i class="fas fa-comment-dots"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ----------------------
    // Comentarios: modal y envío
    // ----------------------
    const commentModal = document.getElementById('comment-modal');
    const commentText = document.getElementById('comment-modal-text');
    const commentServiceLabel = document.getElementById('comment-modal-service');
    let commentTargetCitaId = null;

    // Delegación para botones de comentario
    document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.btn-comment');
        if (btn) {
            const id = btn.getAttribute('data-cita-id');
            openCommentModal(id, btn.closest('tr'));
        }
    });

    document.getElementById('comment-modal-cancel').addEventListener('click', closeCommentModal);
    document.getElementById('comment-modal-submit').addEventListener('click', submitComment);

    async function openCommentModal(idCita, rowEl) {
        commentTargetCitaId = idCita;
        commentText.value = '';
        commentServiceLabel.textContent = 'Cargando servicio...';
        commentModal.style.display = 'flex';

        // Intentar obtener la cita desde la API para extraer el servicio de forma fiable
        try {
            const citaResp = await CitasService.getById(idCita);
            const citaObj = citaResp?.data?.data || citaResp?.data || citaResp || null;

            let servicioName = 'Servicio';
            if (citaObj) {
                // Buscar en diferentes estructuras
                if (Array.isArray(citaObj.servicios) && citaObj.servicios.length > 0) {
                    servicioName = citaObj.servicios.map(s => s.nombre || s.nombreServicio || s).join(', ');
                } else if (citaObj.servicio && (citaObj.servicio.nombre || citaObj.servicio.nombreServicio)) {
                    servicioName = citaObj.servicio.nombre || citaObj.servicio.nombreServicio;
                } else if (citaObj.nombreServicio) {
                    servicioName = citaObj.nombreServicio;
                } else if (rowEl) {
                    // Fallback: leer lo que ya estaba en la tabla
                    servicioName = rowEl.querySelector('td:nth-child(4) div')?.getAttribute('title') || rowEl.querySelector('td:nth-child(4) div')?.textContent || servicioName;
                }

                // Guardar la cita obtenida por si queremos usarla luego
                commentModal.citaObj = citaObj;
            } else if (rowEl) {
                servicioName = rowEl.querySelector('td:nth-child(4) div')?.getAttribute('title') || rowEl.querySelector('td:nth-child(4) div')?.textContent || servicioName;
            }

            commentServiceLabel.textContent = `Cita: ${idCita} — ${servicioName}`;
        } catch (err) {
            console.warn('Error al obtener la cita para mostrar servicio en modal:', err);
            // Fallback a contenido de fila si existe
            const fallback = rowEl?.querySelector('td:nth-child(4) div')?.getAttribute('title') || rowEl?.querySelector('td:nth-child(4) div')?.textContent || 'Servicio';
            commentServiceLabel.textContent = `Cita: ${idCita} — ${fallback}`;
        }
    }

    function closeCommentModal() {
        commentModal.style.display = 'none';
        commentTargetCitaId = null;
    }

    async function submitComment() {
        const texto = commentText.value.trim();
        if (!texto) return alert('Escribe un comentario antes de enviar.');

        try {
            // ID del cliente (usuario actual)
            const userStr = localStorage.getItem('user_data');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const userIdLocal = currentUser?.idUsuario || currentUser?.id;

            if (!userIdLocal) {
                alert('No se encontró usuario. Inicia sesión de nuevo.');
                return;
            }

            const payload = {
                idCliente: userIdLocal,
                comentario: texto,
                idCita: commentTargetCitaId
            };

            console.log('Enviando comentario, payload:', payload);
            document.getElementById('comment-modal-submit').disabled = true;

            const resp = await ComentariosService.create(payload);
            console.log('Respuesta create comentario:', resp);

            // Normalizar respuesta de éxito
            const created = resp?.data?.data || resp?.data || resp;
            if (created) {
                console.log('Comentario creado (raw):', created);

                // Si el backend no devuelve las relaciones 'cliente' o 'cita', intentamos enriquecer localmente
                try {
                    // Asegurar que cliente esté presente
                    if (!created.cliente) {
                        const userStr2 = localStorage.getItem('user_data');
                        const currentUser2 = userStr2 ? JSON.parse(userStr2) : null;
                        if (currentUser2) {
                            created.cliente = {
                                idUsuario: currentUser2.idUsuario || currentUser2.id,
                                nombre: currentUser2.nombre || currentUser2.nombreCompleto || ''
                            };
                        }
                    }

                    // Asegurar que cita esté presente: intentar obtenerla desde API si tenemos idCita
                    if (!created.cita && commentTargetCitaId) {
                        try {
                            const citaResp = await CitasService.getById(commentTargetCitaId);
                            const citaObj = citaResp?.data?.data || citaResp?.data || citaResp || null;
                            if (citaObj) created.cita = citaObj;
                        } catch (e) {
                            console.warn('No se pudo obtener la cita para enriquecer comentario:', e);
                        }
                    }
                } catch (e) {
                    console.warn('Error enriqueciendo comentario creado:', e);
                }

                // Marcar visualmente la fila como comentada (si existe botón)
                try {
                    const btn = document.querySelector(`.btn-comment[data-cita-id="${commentTargetCitaId}"]`);
                    if (btn) {
                        btn.innerHTML = '<i class="fas fa-check-circle" style="color:#27ae60;"></i>';
                        btn.disabled = true;
                        btn.title = 'Comentado';
                    }
                } catch (e) {
                    console.warn('No se pudo actualizar el botón de comentario en la UI:', e);
                }

                alert('Comentario enviado correctamente.');
                closeCommentModal();
            } else {
                // Si la API no devuelve body, informar genérico
                alert('Comentario enviado (sin confirmación del servidor).');
                closeCommentModal();
            }
        } catch (err) {
            console.error('Error al enviar comentario:', err);

            // Intentar mostrar mensaje del servidor si existe
            let serverMessage = 'Error al enviar comentario. Intenta nuevamente.';
            try {
                if (err && err.response) {
                    const r = err.response;
                    serverMessage = r.data?.message || r.data?.error || r.data || r.statusText || err.message;
                    console.error('Error detalle servidor:', r);
                } else if (err && err.message) {
                    serverMessage = err.message;
                }
            } catch (e) {
                console.error('No se pudo parsear error del servidor:', e);
            }

            alert(serverMessage);
        } finally {
            document.getElementById('comment-modal-submit').disabled = false;
        }
    }
});