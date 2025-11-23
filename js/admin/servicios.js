// Gestión de Servicios Admin - CONEXIÓN DEFINITIVA
class ServiciosAdmin {
    constructor() {
        this.servicios = [];
        this.filteredServicios = [];
        this.currentServicio = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadServicios();
        } catch (error) {
            console.error('Error al inicializar:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('btnNuevoServicio')?.addEventListener('click', () => this.openModal());
        document.getElementById('searchInput')?.addEventListener('input', () => this.filterServicios());
        document.getElementById('filterCategoria')?.addEventListener('change', () => this.filterServicios());

        // PREVENIR RECARGA AL ENVIAR EL FORMULARIO
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    async loadServicios() {
        this.showLoader();
        try {
            const response = await ServiciosService.getAll();
            console.log('📦 Respuesta completa de la API:', response);
            console.log('📊 Datos extraídos:', response.data);

            // La API devuelve { success: true, data: [...] }
            // Pero httpService ya envuelve en { status, data, ok }
            // Entonces response.data puede ser { success: true, data: [...] } o directamente [...]

            // Intentar extraer los datos correctamente
            if (Array.isArray(response.data)) {
                this.servicios = response.data;
            } else if (response.data && response.data.data) {
                this.servicios = response.data.data;
            } else if (response.data && Array.isArray(response.data.servicios)) {
                this.servicios = response.data.servicios;
            } else {
                console.warn('⚠️ Estructura de respuesta no reconocida:', response.data);
                this.servicios = [];
            }

            console.log('✅ Servicios cargados:', this.servicios);

            // DEBUG: Mostrar primer servicio para ver su estructura
            if (this.servicios.length > 0) {
                console.log('🔍 Primer servicio (estructura):', this.servicios[0]);
                console.log('🔍 Propiedades del primer servicio:', Object.keys(this.servicios[0]));
            }

            this.filteredServicios = [...this.servicios];
            this.renderTable();

        } catch (error) {
            console.error('❌ Error al cargar servicios:', error);
            this.showNotification('Error al cargar servicios', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;

        this.filteredServicios = this.servicios.filter(servicio => {
            // Usar 'nombre' (no 'nombreServicio')
            const nombre = servicio.nombre || '';
            const descripcion = servicio.descripcion || '';

            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                descripcion.toLowerCase().includes(searchTerm);

            // Filtrar por categoría (texto, no ID)
            const matchesCategoria = !categoriaFilter ||
                                    servicio.categoria?.toLowerCase().includes(categoriaFilter.toLowerCase());

            return matchesSearch && matchesCategoria;
        });

        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('serviciosTableBody');
        const emptyState = document.getElementById('emptyState');

        if (!tbody) return;

        if (this.filteredServicios.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = this.filteredServicios.map(servicio => `
            <tr>
                <td>
                    <div class="service-image" style="background: #ecf0f1; display: flex; align-items: center; justify-content: center;">
                        <i class="ph ph-scissors" style="font-size: 24px; color: #bdc3c7;"></i>
                    </div>
                </td>
                <td><strong>${servicio.nombre}</strong></td>
                <td>${servicio.categoria || 'General'}</td>
                <td><strong>$${parseFloat(servicio.precio).toFixed(2)}</strong></td>
                <td>${servicio.duracion} min</td>
                <td>
                    <span class="badge ${servicio.activo ? 'active' : 'inactive'}">
                        ${servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="serviciosAdmin.editServicio(${servicio.idServicio})" type="button">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon delete" onclick="serviciosAdmin.deleteServicio(${servicio.idServicio})" type="button">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openModal(servicio = null) {
        const modal = document.getElementById('modalServicio');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');

        if (servicio) {
            // MODO EDICIÓN
            modalTitle.textContent = 'Editar Servicio';
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombre').value = servicio.nombre;

            // Mapear nombre de categoría a ID para el select
            const categoriaMap = {
                'Cabello': '1',
                'Uñas': '2',
                'Maquillaje': '3',
                'Cejas': '1', // Asumiendo que Cejas es parte de Cabello
            };
            document.getElementById('categoriaServicio').value = categoriaMap[servicio.categoria] || '';

            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            document.getElementById('imagenServicio').value = '';
            document.getElementById('activoServicio').checked = servicio.activo;
        } else {
            // MODO CREACIÓN
            modalTitle.textContent = 'Nuevo Servicio';
            form.reset();
            document.getElementById('servicioId').value = '';
            document.getElementById('activoServicio').checked = true;
        }

        modal.classList.add('active');
    }

    editServicio(id) {
        const servicio = this.servicios.find(s => s.idServicio === id);
        if (servicio) this.openModal(servicio);
    }

    async deleteServicio(id) {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

        this.showLoader();
        try {
            await ServiciosService.delete(id);
            this.showNotification('Servicio eliminado correctamente', 'success');
            await this.loadServicios();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al eliminar servicio', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;

        // Crear el objeto con los nombres que espera la API Java
        const data = {
            nombreServicio: document.getElementById('nombre').value,
            idCategoria: parseInt(document.getElementById('categoriaServicio').value) || 1,
            descripcion: document.getElementById('descripcionServicio').value,
            precio: parseFloat(document.getElementById('precioServicio').value),
            duracionMinutos: parseInt(document.getElementById('duracionServicio').value),
            imagenURL: document.getElementById('imagenServicio').value || "",
            idFormulario: null,
            activo: document.getElementById('activoServicio').checked
        };

        console.log('💾 Guardando servicio:', data);

        this.showLoader();

        try {
            if (servicioId) {
                await ServiciosService.update(parseInt(servicioId), data);
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                await ServiciosService.create(data);
                this.showNotification('Servicio creado exitosamente', 'success');
            }

            document.getElementById('modalServicio').classList.remove('active');
            await this.loadServicios();

        } catch (error) {
            console.error('Error:', error);
            const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
            this.showNotification(msg, 'error');
        } finally {
            this.hideLoader();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 8px; background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white; z-index: 10000; animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
}

// Variable global para acceder desde los onclick de los botones
let serviciosAdmin;

document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});
