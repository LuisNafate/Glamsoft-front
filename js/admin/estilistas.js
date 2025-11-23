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
            // await this.checkAuth(); // Temporalmente desactivado para desarrollo
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
            console.log('Servicios cargados:', this.servicios);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            this.servicios = [];
        }
    }

    async checkAuth() {
        const user = StateManager.get('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }

    setupEventListeners() {
        document.getElementById('btnNuevoEstilista')?.addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterEstilistas();
        });

        document.getElementById('formEstilista')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEstilista();
        });
    }

    async loadEstilistas() {
        this.showLoader();

        try {
            const response = await EstilistasService.getAll();

            console.log('Respuesta completa del backend:', response);

            // El backend devuelve un objeto con propiedad 'data' que contiene el array
            const estilistasList = response.data || [];

            console.log('Estilistas recibidos del backend:', estilistasList);

            // Mapear los campos del backend al formato esperado por la vista
            this.estilistas = estilistasList.map(e => ({
                id: e.idEstilista,
                idUsuario: e.idUsuario,
                idEstilista: e.idEstilista,
                nombre: e.nombre,
                email: e.email,
                telefono: e.telefono,
                avatar: e.imagenPerfil || e.avatar,
                disponibilidad: e.activo ? 'disponible' : 'no_disponible',
                especialidades: e.especialidad ? [e.especialidad] : [],
                puesto: e.puesto || e.especialidad || 'Estilista',
                activo: e.activo,
                valoracionPromedio: e.valoracionPromedio,
                totalValoraciones: e.totalValoraciones,
                servicios: e.servicios || []
            }));

            console.log('Estilistas mapeados:', this.estilistas);

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

    filterEstilistas() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredEstilistas = this.estilistas.filter(estilista => {
            const matchesSearch = estilista.nombre.toLowerCase().includes(searchTerm) ||
                                (estilista.email || '').toLowerCase().includes(searchTerm);

            return matchesSearch;
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
                    const color = servicioColors[index % servicioColors.length];
                    return `<span class="service-tag" style="background-color: ${color}">${servicio.nombreServicio || servicio}</span>`;
                }).join('')
                : '<span style="color: #999; font-size: 12px;">Sin servicios</span>';

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
                            ${estilista.servicios && estilista.servicios.length > 3 ? `<span class="service-tag" style="background-color: #95a5a6">+${estilista.servicios.length - 3}</span>` : ''}
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

    openModal(estilista = null) {
        const modal = document.getElementById('modalEstilista');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formEstilista');

        // Llenar select de servicios
        const serviciosSelect = document.getElementById('serviciosEstilista');
        serviciosSelect.innerHTML = this.servicios.map(s =>
            `<option value="${s.idServicio}">${s.nombreServicio}</option>`
        ).join('');

        // Resetear checkboxes
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.checked = false;
            const daySchedule = cb.closest('.day-schedule');
            daySchedule.classList.remove('active');
            daySchedule.querySelector('.time-inputs').style.display = 'none';
        });

        if (estilista) {
            modalTitle.textContent = 'Editar Estilista';
            document.getElementById('estilistaId').value = estilista.id;
            document.getElementById('nombreEstilista').value = estilista.nombre;
            document.getElementById('emailEstilista').value = estilista.email || '';
            document.getElementById('telefonoEstilista').value = estilista.telefono || '';
            document.getElementById('especialidadesEstilista').value = estilista.puesto || '';
            document.getElementById('avatarEstilista').value = estilista.avatar || '';
            document.getElementById('biografiaEstilista').value = estilista.biografia || '';

            // Seleccionar servicios del estilista
            if (estilista.servicios && Array.isArray(estilista.servicios)) {
                Array.from(serviciosSelect.options).forEach(option => {
                    option.selected = estilista.servicios.some(s => s.idServicio == option.value);
                });
            }

            // Cargar horario
            if (estilista.horario) {
                Object.keys(estilista.horario).forEach(dia => {
                    const daySchedule = document.querySelector(`.day-schedule[data-day="${dia}"]`);
                    if (daySchedule && estilista.horario[dia]) {
                        const checkbox = daySchedule.querySelector('.day-checkbox');
                        checkbox.checked = true;
                        daySchedule.classList.add('active');

                        const timeInputs = daySchedule.querySelector('.time-inputs');
                        timeInputs.style.display = 'flex';
                        timeInputs.querySelector('.hora-inicio').value = estilista.horario[dia].inicio;
                        timeInputs.querySelector('.hora-fin').value = estilista.horario[dia].fin;
                    }
                });
            }
        } else {
            modalTitle.textContent = 'Nuevo Estilista';
            form.reset();
            document.getElementById('estilistaId').value = '';
        }

        modal.classList.add('active');
    }

    editEstilista(id) {
        const estilista = this.estilistas.find(e => e.id === id);
        if (estilista) {
            this.openModal(estilista);
        }
    }

    async deleteEstilista(id) {
        if (!confirm('¿Estás seguro de eliminar este estilista?')) {
            return;
        }

        // Buscar el estilista para obtener su información
        const estilista = this.estilistas.find(e => e.id === id);
        if (!estilista) {
            this.showNotification('Estilista no encontrado', 'error');
            return;
        }

        console.log('Estilista a eliminar:', estilista);
        console.log('idEstilista:', estilista.idEstilista);

        this.showLoader();

        try {
            // Usar idEstilista para eliminar (id ya es idEstilista)
            await EstilistasService.delete(id);
            this.showNotification('Estilista eliminado correctamente', 'success');

            // Recargar inmediatamente la lista de estilistas
            await this.loadEstilistas();
        } catch (error) {
            console.error('Error al eliminar estilista:', error);
            this.showNotification('Error al eliminar estilista', 'error');
            this.hideLoader();
        }
    }

    async saveEstilista() {
        const estilistaId = document.getElementById('estilistaId').value;

        // Obtener especialidad del formulario
        const especialidadInput = document.getElementById('especialidadesEstilista').value.trim();
        const puesto = especialidadInput || 'Estilista';

        // Preparar datos según el formato esperado por el backend
        const data = {
            nombre: document.getElementById('nombreEstilista').value.trim(),
            email: document.getElementById('emailEstilista').value.trim(),
            telefono: document.getElementById('telefonoEstilista').value.trim(),
            idRol: 2, // Rol de estilista
            activo: true,
            puesto: puesto, // La primera especialidad como puesto
            imagenPerfil: document.getElementById('avatarEstilista').value.trim() || null
        };

        // Solo agregar password si es un nuevo estilista
        if (!estilistaId) {
            data.password = 'glamsoft123'; // Password por defecto
        }

        console.log('Datos a enviar:', data);

        this.showLoader();

        try {
            let createdEstilista;

            if (estilistaId) {
                await EstilistasService.update(estilistaId, data);
                this.showNotification('Estilista actualizado correctamente', 'success');
            } else {
                const response = await EstilistasService.create(data);
                console.log('Respuesta del servidor:', response);
                createdEstilista = response;
                this.showNotification('Estilista creado correctamente', 'success');
            }

            // Guardar servicios y horarios si se creó un nuevo estilista
            const idEstilistaFinal = createdEstilista ? (createdEstilista.idEstilista || createdEstilista.idUsuario) : estilistaId;

            if (idEstilistaFinal) {
                // Guardar servicios
                await this.saveServicios(idEstilistaFinal);

                // Guardar horarios
                await this.saveHorarios(idEstilistaFinal);
            }

            closeModal();

            // Recargar inmediatamente la lista de estilistas
            await this.loadEstilistas();
        } catch (error) {
            console.error('Error al guardar estilista:', error);
            const errorMessage = error.message || 'Error al guardar estilista';
            this.showNotification(errorMessage, 'error');
            this.hideLoader();
        }
    }

    async saveServicios(idEstilista) {
        const serviciosSelect = document.getElementById('serviciosEstilista');
        const selectedOptions = Array.from(serviciosSelect.selectedOptions);

        if (selectedOptions.length === 0) {
            console.log('No hay servicios seleccionados');
            return;
        }

        const serviciosPromises = selectedOptions.map(option => {
            const data = {
                idEstilista: idEstilista,
                idServicio: parseInt(option.value)
            };
            return EstilistasService.createServicio(data);
        });

        try {
            await Promise.all(serviciosPromises);
            console.log('Servicios guardados correctamente');
        } catch (error) {
            console.error('Error al guardar servicios:', error);
            // No mostramos error al usuario porque el estilista ya fue creado
        }
    }

    async saveHorarios(idEstilista) {
        const horariosPromises = [];

        document.querySelectorAll('.day-schedule').forEach(daySchedule => {
            const checkbox = daySchedule.querySelector('.day-checkbox');
            if (checkbox.checked) {
                const dia = daySchedule.getAttribute('data-day').toUpperCase();
                const timeInputs = daySchedule.querySelector('.time-inputs');
                const horaInicio = timeInputs.querySelector('.hora-inicio').value;
                const horaFin = timeInputs.querySelector('.hora-fin').value;

                const horarioData = {
                    idEstilista: idEstilista,
                    diaSemana: dia,
                    horaInicio: horaInicio + ':00',
                    horaFin: horaFin + ':00'
                };

                horariosPromises.push(
                    EstilistasService.createHorario(horarioData)
                );
            }
        });

        try {
            await Promise.all(horariosPromises);
        } catch (error) {
            console.error('Error al guardar horarios:', error);
            // No mostramos error al usuario porque el estilista ya fue creado
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            z-index: 10000;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

let estilistasAdmin;

document.addEventListener('DOMContentLoaded', () => {
    estilistasAdmin = new EstilistasAdmin();
});
