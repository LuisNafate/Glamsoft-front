class ServiciosAdmin {
    constructor() {
        this.servicios = [];
        this.filteredServicios = [];
        this.currentServicio = null;
        // Mapa manual para traducir Nombres de API -> IDs de Formulario
        this.mapaCategorias = {
            'Cabello': 1,
            'Uñas': 2,
            'Maquillaje': 3,
            'Spa': 4,
            'Depilación': 5
        };
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
        
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    async loadServicios() {
        this.showLoader();
        try {
            const response = await ServiciosService.getAll();
            // Filtrar solo servicios activos
            this.servicios = (response.data || []).filter(s => s.activo === true);
            this.filteredServicios = [...this.servicios];
            this.renderTable();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchInput = document.getElementById('searchInput');
        const categoriaSelect = document.getElementById('filterCategoria');

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const categoriaFilter = categoriaSelect ? categoriaSelect.value : '';

        this.filteredServicios = this.servicios.filter(servicio => {
            // Búsqueda por nombre y descripción
            const nombre = (servicio.nombre || '').toLowerCase();
            const descripcion = (servicio.descripcion || '').toLowerCase();
            const matchesSearch = !searchTerm ||
                                nombre.includes(searchTerm) ||
                                descripcion.includes(searchTerm);

            // Filtro por categoría (por nombre de categoría)
            const catNombre = servicio.categoria || '';
            const matchesCategoria = !categoriaFilter || catNombre === categoriaFilter;

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
                <td><span class="badge active">Activo</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" type="button" onclick="serviciosAdmin.editServicio(${servicio.idServicio})">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon delete" type="button" onclick="serviciosAdmin.deleteServicio(${servicio.idServicio})">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openModal(servicio = null) {
        const modal = document.getElementById('modalServicio');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');

        if (servicio) {
            // --- MODO EDICIÓN ---
            title.textContent = 'Editar Servicio';
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombreServicio').value = servicio.nombre;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            document.getElementById('activoServicio').checked = servicio.activo;

            // TRUCO: Usar el mapa para seleccionar la categoría correcta
            // Si la API dice "Cabello", buscamos el ID 1
            const catId = this.mapaCategorias[servicio.categoria] || "";
            document.getElementById('categoriaServicio').value = catId;

        } else {
            // --- MODO CREACIÓN ---
            title.textContent = 'Nuevo Servicio';
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
        if (!confirm('¿Eliminar servicio?')) return;
        this.showLoader();
        try {
            await ServiciosService.delete(id);
            await this.loadServicios();
            this.showNotification('Servicio eliminado', 'success');
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            this.showNotification('Error al eliminar', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;

        // Objeto JAVA (Modelo)
        const data = {
            nombreServicio: document.getElementById('nombreServicio').value,
            duracionMinutos: parseInt(document.getElementById('duracionServicio').value),
            idCategoria: parseInt(document.getElementById('categoriaServicio').value) || 1,
            precio: parseFloat(document.getElementById('precioServicio').value),
            descripcion: document.getElementById('descripcionServicio').value,
            imagenURL: document.getElementById('imagenServicio').value || "",
            idFormulario: null,
            activo: document.getElementById('activoServicio').checked
        };

        this.showLoader();
        try {
            if (servicioId) {
                // UPDATE: Enviamos ID y DATA
                await ServiciosService.update(parseInt(servicioId), data);
                this.showNotification('Servicio actualizado', 'success');
            } else {
                // CREATE: Enviamos solo DATA
                await ServiciosService.create(data);
                this.showNotification('Servicio creado', 'success');
            }
            document.getElementById('modalServicio').classList.remove('active');
            await this.loadServicios();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al guardar', 'error');
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
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
}

let serviciosAdmin;
document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});