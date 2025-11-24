// Gestión de Estilistas Admin
class EstilistasAdmin {
    constructor() {
        this.estilistas = [];
        this.filteredEstilistas = [];
        this.servicios = [];
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadServicios();
            await this.loadEstilistas();
        } catch (error) {
            console.error('Error init:', error);
        }
    }
async checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user_data') || 'null');
            
            // 🔒 SEGURIDAD: Solo Rol 1 (Admin) puede estar aquí
            if (!user || user.idRol !== 1) {
                console.warn("Acceso denegado: No eres Administrador.");
                window.location.href = '../inicio.html';
                return; // Detener ejecución
            }

            // Actualizar interfaz con datos del usuario
            const nombreReal = user.nombre || 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error de sesión:", error);
            window.location.href = '../login.html';
        }
    }
    setupEventListeners() {
        document.getElementById('btnNuevoEstilista')?.addEventListener('click', () => this.openModal());
        
        document.getElementById('searchInput')?.addEventListener('input', () => this.filterEstilistas());
        document.getElementById('activoFilter')?.addEventListener('change', () => this.filterEstilistas());

        document.getElementById('formEstilista')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEstilista();
        });
        
        document.getElementById('btnVerificarUsuario')?.addEventListener('click', () => this.verificarUsuario());
        
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const container = e.target.closest('.day-schedule');
                const inputs = container.querySelector('.time-inputs');
                if (e.target.checked) {
                    container.classList.add('active');
                    inputs.style.display = 'flex';
                } else {
                    container.classList.remove('active');
                    inputs.style.display = 'none';
                }
            });
        });
    }

    async loadServicios() {
        try {
            const response = await ServiciosService.getAll();
            const data = response.data || response || [];
            
            // ✅ FILTRO: Solo mostrar servicios ACTIVOS en el select
            this.servicios = data.filter(s => s.activo === true || s.activo === 1);
            
            const select = document.getElementById('serviciosEstilista');
            if (select) {
                select.innerHTML = this.servicios.map(s => 
                    `<option value="${s.idServicio}">${s.nombre || s.nombreServicio}</option>`
                ).join('');
            }
        } catch (error) {
            console.error("Error cargando servicios:", error);
        }
    }

    async loadEstilistas() {
        this.showLoader();
        try {
            const response = await EstilistasService.getAll();
            const data = response.data || response || [];
            // Cargar todos los estilistas (mantener campo 'activo')
            this.estilistas = data.map(e => ({
                id: e.idEstilista || e.idEmpleado || e.id,
                idUsuario: e.idUsuario || e.id_usuario || (e.usuario ? e.usuario.idUsuario : null),
                nombre: e.nombre,
                email: e.email,
                telefono: e.telefono,
                puesto: e.puesto || 'Estilista',
                avatar: e.imagenPerfil || e.avatar || e.imagen_perfil,
                servicios: e.servicios || [],
                activo: (e.activo === true || e.activo === 1) // normalize to boolean
            }));

            this.filteredEstilistas = [...this.estilistas];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar estilistas:', error);
        } finally {
            this.hideLoader();
        }
    }

    filterEstilistas() {
        const term = document.getElementById('searchInput').value.toLowerCase();
        const estado = document.getElementById('activoFilter')?.value || 'all';

        this.filteredEstilistas = this.estilistas.filter(e => {
            const matchesTerm = (e.nombre || '').toLowerCase().includes(term);
            let matchesEstado = true;
            if (estado === 'activo') matchesEstado = e.activo === true;
            if (estado === 'inactivo') matchesEstado = e.activo === false || e.activo === undefined;
            return matchesTerm && matchesEstado;
        });
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('estilistasTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.filteredEstilistas.length === 0) {
            tbody.innerHTML = '';
            if(emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if(emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredEstilistas.map(e => `
            <tr>
                <td>
                    <div class="estilista-avatar" style="background:#3498db; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; width:45px; height:45px; border-radius:50%;">
                        ${e.avatar ? `<img src="${e.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : (e.nombre ? e.nombre.charAt(0).toUpperCase() : '?')}
                    </div>
                </td>
                <td><strong>${e.nombre}</strong></td>
                <td>${e.puesto}</td>
                <td>${e.telefono}</td>
                <td>${e.email || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" style="background:#f39c12; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; margin-right:5px;" onclick="estilistasAdmin.editEstilista(${e.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" style="background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="estilistasAdmin.deleteEstilista(${e.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async saveEstilista() {
        let usuarioIdVal = document.getElementById('usuarioId').value;
        let estilistaIdVal = document.getElementById('estilistaId').value;

        if (usuarioIdVal === "undefined" || usuarioIdVal === "null") usuarioIdVal = "";
        if (estilistaIdVal === "undefined" || estilistaIdVal === "null") estilistaIdVal = "";

        const usuarioId = parseInt(usuarioIdVal);
        const estilistaId = estilistaIdVal ? parseInt(estilistaIdVal) : null;
        
        if (!usuarioId || isNaN(usuarioId)) {
            await customAlert(
                "No se ha seleccionado un usuario válido. Verifica el teléfono primero.",
                "Error",
                { type: 'error' }
            );
            return;
        }

        const nombre = document.getElementById('nombreEstilista').value;
        const email = document.getElementById('emailEstilista').value;
        const telefono = document.getElementById('telefonoEstilista').value;
        const puesto = document.getElementById('especialidadesEstilista').value;
        const foto = document.getElementById('avatarEstilista').value;

        this.showLoader();

        try {
            // 1. Actualizar Rol del Usuario
            await UsuariosService.update({
                idUsuario: usuarioId,
                nombre: nombre,
                email: email,
                telefono: telefono,
                idRol: 2, 
                activo: true
            });

            // 2. Guardar Empleado (Crear o Editar)
            const empleadoData = {
                idUsuario: usuarioId,
                nombre: nombre,
                email: email,
                telefono: telefono,
                puesto: puesto,
                imagenPerfil: foto
            };

            // Lógica CREAR vs EDITAR
            let finalIdEstilista = estilistaId;

            if (estilistaId) {
                // EDICIÓN: PUT
                const updateUrl = `${API_CONFIG.BASE_URL}/empleados/${estilistaId}`;
                await httpService.put(updateUrl, empleadoData);
            } else {
                // CREACIÓN: POST
                const resp = await EstilistasService.create(empleadoData);
                const resData = resp.data || resp;
                finalIdEstilista = resData.idEmpleado || resData.idEstilista || resData.id;
            }

            // Fallback de seguridad para ID
            if (!finalIdEstilista) finalIdEstilista = usuarioId;

            // 3. Servicios
            // IMPORTANTE: Usar idEmpleado para asociar servicios
            const serviciosSelect = document.getElementById('serviciosEstilista');
            if (serviciosSelect) {
                const selectedServices = Array.from(serviciosSelect.selectedOptions).map(opt => opt.value);
                if (selectedServices.length > 0) {
                    const serviciosPromesas = selectedServices.map(idServicio =>
                        EstilistasService.createServicio({
                            idEmpleado: parseInt(finalIdEstilista), // Usar idEmpleado en lugar de idEstilista
                            idServicio: parseInt(idServicio)
                        })
                    );
                    await Promise.all(serviciosPromesas);
                }
            }

            // 4. Horarios
            // IMPORTANTE: Usar idEmpleado para asociar horarios
            const horariosPromesas = [];
            document.querySelectorAll('.day-schedule.active').forEach(day => {
                const dia = day.getAttribute('data-day');
                const diaFormat = dia.charAt(0).toUpperCase() + dia.slice(1);
                const inicio = day.querySelector('.hora-inicio').value;
                const fin = day.querySelector('.hora-fin').value;

                horariosPromesas.push(EstilistasService.createHorario({
                    idEmpleado: parseInt(finalIdEstilista), // Usar idEmpleado en lugar de idEstilista
                    diaSemana: diaFormat,
                    horaInicio: inicio + ":00",
                    horaFin: fin + ":00"
                }));
            });
            
            if (horariosPromesas.length > 0) await Promise.all(horariosPromesas);

            this.showNotification('¡Estilista guardado correctamente!', 'success');
            this.closeModal();
            this.loadEstilistas();

        } catch (error) {
            console.error("Error al guardar:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
            this.showNotification('Error: ' + errorMsg, 'error');
        } finally {
            this.hideLoader();
        }
    }

    async verificarUsuario() {
        const telefono = document.getElementById('telefonoEstilista').value.trim();
        const msg = document.getElementById('msgUsuarioEncontrado');
        const btnGuardar = document.getElementById('btnGuardarEstilista');
        
        const inputs = {
            nombre: document.getElementById('nombreEstilista'),
            email: document.getElementById('emailEstilista'),
            id: document.getElementById('usuarioId')
        };

        msg.style.display = 'none';
        inputs.nombre.value = '';
        inputs.email.value = '';
        inputs.id.value = '';
        btnGuardar.disabled = true;

        if (!telefono) {
            await customAlert(
                "Por favor ingresa un número de teléfono.",
                "Campo requerido",
                { type: 'warning' }
            );
            return;
        }

        this.showLoader();
        try {
            const response = await UsuariosService.getByTelefono(telefono);
            const usuario = response.data || response;

            if (usuario && (usuario.idUsuario || usuario.id)) {
                inputs.id.value = usuario.idUsuario || usuario.id;
                inputs.nombre.value = usuario.nombre;
                inputs.email.value = usuario.email;
                
                msg.textContent = `✅ Usuario encontrado: ${usuario.nombre}`;
                msg.style.color = "#27ae60";
                msg.style.display = "block";
                btnGuardar.disabled = false;
            } else {
                throw new Error("Datos vacíos");
            }

        } catch (error) {
            msg.textContent = "❌ Usuario no encontrado.";
            msg.style.color = "#e74c3c";
            msg.style.display = "block";
        } finally {
            this.hideLoader();
        }
    }

    openModal(estilista = null) {
        const modal = document.getElementById('modalEstilista');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formEstilista');
        const msg = document.getElementById('msgUsuarioEncontrado');
        const btnGuardar = document.getElementById('btnGuardarEstilista');

        if(msg) msg.style.display = 'none';
        
        // Resetear horarios y form
        form.reset();
        document.querySelectorAll('.day-schedule').forEach(d => {
            d.classList.remove('active');
            d.querySelector('.time-inputs').style.display = 'none';
            d.querySelector('input[type="checkbox"]').checked = false;
        });

        if (estilista) {
            modalTitle.textContent = 'Editar Estilista';
            document.getElementById('estilistaId').value = estilista.id || '';
            document.getElementById('usuarioId').value = estilista.idUsuario || '';
            document.getElementById('nombreEstilista').value = estilista.nombre || '';
            document.getElementById('emailEstilista').value = estilista.email || '';
            document.getElementById('telefonoEstilista').value = estilista.telefono || '';
            document.getElementById('especialidadesEstilista').value = estilista.puesto || '';
            document.getElementById('avatarEstilista').value = estilista.avatar || '';
            
            if(btnGuardar) btnGuardar.disabled = false;
        } else {
            modalTitle.textContent = 'Nuevo Estilista';
            document.getElementById('estilistaId').value = '';
            document.getElementById('usuarioId').value = '';
            if(btnGuardar) btnGuardar.disabled = true;
        }

        modal.classList.add('active');
    }

    editEstilista(id) {
        const estilista = this.estilistas.find(e => e.id === id);
        if (estilista) this.openModal(estilista);
    }

    async deleteEstilista(id) {
        const confirmed = await customConfirm(
            "¿Eliminar estilista?",
            "Confirmar Eliminación",
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();
        try {
            await EstilistasService.delete(id);
            await customAlert('Estilista eliminado', 'Éxito', { type: 'success' });
            this.loadEstilistas();
        } catch(e) {
            console.error('Error al eliminar estilista:', e);
            // Intentar extraer mensaje claro desde la respuesta del servidor
            const serverMsg = e?.response?.data?.message || e?.data?.message || e?.message || 'Error al eliminar el estilista.';
            await customAlert(serverMsg, 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; background: ${type === 'success' ? '#27ae60' : '#e74c3c'}; color: white; z-index: 10000;`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
    closeModal() { document.getElementById('modalEstilista').classList.remove('active'); }
}

let estilistasAdmin;
document.addEventListener('DOMContentLoaded', () => {
    estilistasAdmin = new EstilistasAdmin();
});

function closeModal() { estilistasAdmin.closeModal(); }