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
            console.error('Error al inicializar:', error);
            ErrorHandler.handle(error);
        }
    }

    async loadServicios() {
        try {
            const response = await ServiciosService.getAll();
            this.servicios = response.data || response || [];
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            this.servicios = [];
        }
    }

    setupEventListeners() {
        document.getElementById('btnNuevoEstilista')?.addEventListener('click', () => {
            this.openModal();
        });

        // ✅ LISTENER DEL BUSCADOR
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterEstilistas();
        });

        document.getElementById('formEstilista')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEstilista();
        });
        
        // Listener para verificar usuario en el modal
        document.getElementById('btnVerificarUsuario')?.addEventListener('click', () => this.verificarUsuario());

         // Listener para checkboxes de horario
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

    async loadEstilistas() {
        this.showLoader();

        try {
            const response = await EstilistasService.getAll();
            const estilistasList = response.data || response || [];

            // Mapear los campos del backend al formato esperado por la vista
            this.estilistas = estilistasList.map(e => ({
                id: e.idEstilista,
                idUsuario: e.idUsuario,
                idEstilista: e.idEstilista, // Aseguramos tener ambos IDs
                nombre: e.nombre,
                email: e.email,
                telefono: e.telefono,
                avatar: e.imagenPerfil || e.avatar,
                puesto: e.puesto || 'Estilista',
                servicios: e.servicios || [],
                horario: e.horarios || {} // Asumiendo que el backend devuelve horarios
            }));

            this.filteredEstilistas = [...this.estilistas];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar estilistas:', error);
            this.showNotification('Error al cargar estilistas', 'error');
            this.estilistas = [];
            this.filteredEstilistas = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    // ✅ MÉTODO DE FILTRADO ACTUALIZADO (SOLO NOMBRE)
    filterEstilistas() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

        this.filteredEstilistas = this.estilistas.filter(estilista => {
            const nombre = (estilista.nombre || '').toLowerCase();
            
            // Solo retornamos si el nombre incluye el término de búsqueda
            return nombre.includes(searchTerm);
        });

        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('estilistasTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.filteredEstilistas.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredEstilistas.map(estilista => {
            // Colores para los servicios
            const servicioColors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'
            ];

            const serviciosHtml = estilista.servicios && Array.isArray(estilista.servicios)
                ? estilista.servicios.slice(0, 3).map((servicio, index) => {
                    // Ajuste: el servicio puede ser un objeto o un string
                    const nombreServicio = typeof servicio === 'object' ? (servicio.nombreServicio || servicio.nombre) : servicio;
                    const color = servicioColors[index % servicioColors.length];
                    return `<span class="service-tag" style="background-color: ${color}">${nombreServicio}</span>`;
                }).join('')
                : '<span style="color: #999; font-size: 12px;">Sin servicios</span>';
                
            const masServicios = estilista.servicios && estilista.servicios.length > 3 
                ? `<span class="service-tag" style="background-color: #95a5a6">+${estilista.servicios.length - 3}</span>` 
                : '';

            return `
                <tr>
                    <td>
                        ${estilista.avatar ?
                            `<img src="${estilista.avatar}" alt="${estilista.nombre}" class="estilista-avatar">` :
                            `<div class="estilista-avatar" style="background: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                ${estilista.nombre.charAt(0).toUpperCase()}
                            </div>`
                        }
                    </td>
                    <td><strong>${estilista.nombre}</strong></td>
                    <td>
                        <div class="specialties-list">
                            ${serviciosHtml}
                            ${masServicios}
                        </div>
                    </td>
                    <td>${estilista.telefono || '-'}</td>
                    <td>${estilista.email || '-'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="estilistasAdmin.editEstilista(${estilista.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="estilistasAdmin.deleteEstilista(${estilista.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ... (Métodos openModal, editEstilista, verificarUsuario, saveEstilista, deleteEstilista, etc. se mantienen igual que en la versión anterior) ...
    // Por brevedad, pego aquí los métodos clave para que el archivo sea funcional completo:

    openModal(estilista = null) {
        const modal = document.getElementById('modalEstilista');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formEstilista');
        const msg = document.getElementById('msgUsuarioEncontrado');
        const btnGuardar = document.getElementById('btnGuardarEstilista');

        // Llenar select de servicios
        const serviciosSelect = document.getElementById('serviciosEstilista');
        if(serviciosSelect && this.servicios) {
            serviciosSelect.innerHTML = this.servicios.map(s =>
                `<option value="${s.idServicio}">${s.nombre || s.nombreServicio}</option>`
            ).join('');
        }

        // Resetear checkboxes
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.checked = false;
            const daySchedule = cb.closest('.day-schedule');
            daySchedule.classList.remove('active');
            daySchedule.querySelector('.time-inputs').style.display = 'none';
        });
        
        // Limpiar mensajes y estados
        if(msg) msg.style.display = 'none';
        if(btnGuardar) btnGuardar.disabled = true;

        if (estilista) {
            modalTitle.textContent = 'Editar Estilista';
            document.getElementById('estilistaId').value = estilista.id;
            document.getElementById('usuarioId').value = estilista.idUsuario; // Importante para updates
            document.getElementById('nombreEstilista').value = estilista.nombre;
            document.getElementById('emailEstilista').value = estilista.email || '';
            document.getElementById('telefonoEstilista').value = estilista.telefono || '';
            document.getElementById('especialidadesEstilista').value = estilista.puesto || '';
            document.getElementById('avatarEstilista').value = estilista.avatar || '';
            
            // Habilitar guardado en edición
            if(btnGuardar) btnGuardar.disabled = false;

            // Seleccionar servicios del estilista
            if (estilista.servicios && Array.isArray(estilista.servicios)) {
                Array.from(serviciosSelect.options).forEach(option => {
                    // Verificar si el servicio está en la lista del estilista (por ID o nombre)
                    const isSelected = estilista.servicios.some(s => {
                        const sId = typeof s === 'object' ? (s.idServicio || s.id) : s;
                        const sName = typeof s === 'object' ? (s.nombre || s.nombreServicio) : s;
                        return sId == option.value || sName === option.text;
                    });
                    option.selected = isSelected;
                });
            }
        } else {
            modalTitle.textContent = 'Nuevo Estilista';
            form.reset();
            document.getElementById('estilistaId').value = '';
            document.getElementById('usuarioId').value = '';
        }

        modal.classList.add('active');
    }

    editEstilista(id) {
        const estilista = this.estilistas.find(e => e.id === id);
        if (estilista) {
            this.openModal(estilista);
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
            alert("Por favor ingresa un número de teléfono.");
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
            console.warn("Error en búsqueda:", error);
            msg.textContent = "❌ Usuario no encontrado.";
            if (error.response && error.response.status === 404) {
                msg.textContent = "❌ El usuario no está registrado.";
            }
            msg.style.color = "#e74c3c";
            msg.style.display = "block";
        } finally {
            this.hideLoader();
        }
    }

    async saveEstilista() {
        const usuarioId = document.getElementById('usuarioId').value;
        
        if (!usuarioId) {
            alert("Error: No se ha seleccionado un usuario válido.");
            return;
        }

        const nombre = document.getElementById('nombreEstilista').value;
        const email = document.getElementById('emailEstilista').value;
        const telefono = document.getElementById('telefonoEstilista').value;
        const puesto = document.getElementById('especialidadesEstilista').value;
        const foto = document.getElementById('avatarEstilista').value;

        this.showLoader();

        try {
            // 1. Actualizar Rol
            await UsuariosService.update({
                idUsuario: usuarioId,
                nombre: nombre,
                email: email,
                telefono: telefono,
                idRol: 2, 
                activo: true
            });

            // 2. Crear/Actualizar Empleado
            const empleadoData = {
                idUsuario: parseInt(usuarioId),
                nombre: nombre,
                email: email,
                telefono: telefono,
                puesto: puesto,
                imagenPerfil: foto
            };

            const empleadoResponse = await EstilistasService.create(empleadoData);
            const dataRes = empleadoResponse.data || empleadoResponse;
            const idEstilista = dataRes.idEmpleado || dataRes.idEstilista || usuarioId; 

            // 3. Servicios
            const serviciosSelect = document.getElementById('serviciosEstilista');
            const selectedServices = Array.from(serviciosSelect.selectedOptions).map(opt => opt.value);
            
            if (selectedServices.length > 0) {
                const serviciosPromesas = selectedServices.map(idServicio => 
                    EstilistasService.createServicio({
                        idEstilista: parseInt(idEstilista),
                        idServicio: parseInt(idServicio)
                    })
                );
                await Promise.all(serviciosPromesas);
            }

            // 4. Horarios
            const horariosPromesas = [];
            document.querySelectorAll('.day-schedule.active').forEach(day => {
                const dia = day.getAttribute('data-day');
                const diaFormat = dia.charAt(0).toUpperCase() + dia.slice(1);
                
                const inicio = day.querySelector('.hora-inicio').value;
                const fin = day.querySelector('.hora-fin').value;
                
                horariosPromesas.push(EstilistasService.createHorario({
                    idEstilista: parseInt(idEstilista),
                    diaSemana: diaFormat,
                    horaInicio: inicio + ":00",
                    horaFin: fin + ":00"
                }));
            });
            await Promise.all(horariosPromesas);

            this.showNotification('¡Estilista guardado exitosamente!', 'success');
            this.closeModal();
            this.loadEstilistas();

        } catch (error) {
            console.error("Error al guardar:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Revisa la consola';
            this.showNotification('Error al guardar: ' + errorMsg, 'error');
        } finally {
            this.hideLoader();
        }
    }

    async deleteEstilista(id) {
        if(!confirm("¿Eliminar estilista?")) return;
        this.showLoader();
        try {
            await EstilistasService.delete(id);
            this.showNotification('Estilista eliminado', 'success');
            this.loadEstilistas();
        } catch(e) {
            this.showNotification('Error al eliminar', 'error');
        } finally {
            this.hideLoader();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 8px; background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white; z-index: 10000;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
    
    closeModal() {
        document.getElementById('modalEstilista').classList.remove('active');
    }
}

let estilistasAdmin;
document.addEventListener('DOMContentLoaded', () => {
    estilistasAdmin = new EstilistasAdmin();
});

function closeModal() {
    estilistasAdmin.closeModal();
}