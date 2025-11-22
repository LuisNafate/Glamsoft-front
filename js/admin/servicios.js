// Gestión de Servicios Admin
// Gestión de Servicios Admin
class ServiciosAdmin {
    constructor() {
        this.servicios = [];
        this.filteredServicios = [];
        this.currentServicio = null;
        this.init();
    }

    async init() {
        try {
            // Verificar autenticación (descomenta si ya tienes el login listo)
            // await this.checkAuth();
            
            this.setupEventListeners();
            await this.loadServicios();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            ErrorHandler.handle(error);
        }
    }

    async checkAuth() {
        const user = StateManager.getState('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }

    setupEventListeners() {
        document.getElementById('btnNuevoServicio')?.addEventListener('click', () => {
            this.openModal();
        });
        
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterServicios();
        });
        
        document.getElementById('filterCategoria')?.addEventListener('change', () => {
            this.filterServicios();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterServicios();
        });
        
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    async loadServicios() {
        this.showLoader();
        
        try {
            const response = await ServiciosService.getAll();
            // CAMBIO: Aseguramos que sea un array, tu API parece devolver la lista directa
            this.servicios = Array.isArray(response) ? response : (response.data || []);
            this.filteredServicios = [...this.servicios];
            this.renderTable();
            
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            this.showNotification('Error al cargar servicios', 'error');
            this.servicios = [];
            this.filteredServicios = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;
        const estadoFilter = document.getElementById('filterEstado').value;
        
        this.filteredServicios = this.servicios.filter(servicio => {
            // CAMBIO: Usamos 'nombre_servicio' en lugar de 'nombre'
            const nombre = servicio.nombre_servicio || '';
            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                (servicio.descripcion || '').toLowerCase().includes(searchTerm);
            
            const matchesCategoria = !categoriaFilter || servicio.categoria === categoriaFilter;
            
            const matchesEstado = !estadoFilter || 
                                (estadoFilter === 'activo' && servicio.activo !== false) ||
                                (estadoFilter === 'inactivo' && servicio.activo === false);
            
            return matchesSearch && matchesCategoria && matchesEstado;
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
                    ${servicio.imagen ? 
                        `<img src="${servicio.imagen}" alt="${servicio.nombre_servicio}" class="service-image">` :
                        `<div class="service-image" style="background: #ecf0f1; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="color: #95a5a6;"></i>
                        </div>`
                    }
                </td>
                <td><strong>${servicio.nombre_servicio}</strong></td>
                <td>${this.formatCategoria(servicio.categoria)}</td>
                <td><strong>$${parseFloat(servicio.precio).toFixed(2)}</strong></td>
                <td>${servicio.duracion}</td>
                <td>
                    <span class="badge ${servicio.activo ? 'active' : 'inactive'}">
                        ${servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="serviciosAdmin.editServicio(${servicio.id_servicio})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="serviciosAdmin.deleteServicio(${servicio.id_servicio})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatCategoria(categoria) {
        if (!categoria) return 'Sin categoría'; // Manejo de null
        const categorias = {
            'cabello': 'Cabello',
            'uñas': 'Uñas',
            'maquillaje': 'Maquillaje',
            'spa': 'Spa',
            'depilacion': 'Depilación'
        };
        return categorias[categoria] || categoria;
    }

    openModal(servicio = null) {
        this.currentServicio = servicio;
        const modal = document.getElementById('modalServicio');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');
        
        if (servicio) {
            // Modo edición - Llenar con datos de la API
            modalTitle.textContent = 'Editar Servicio';
            // CAMBIO: Mapeo correcto de propiedades
            document.getElementById('servicioId').value = servicio.id_servicio; 
            document.getElementById('nombreServicio').value = servicio.nombre_servicio; 
            document.getElementById('categoriaServicio').value = servicio.categoria || '';
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            
            // Duracion viene como "00:00:00". Si tu input es type="number", esto fallará. 
            // Sugerencia: Cambia tu input a type="text" o extrae los minutos.
            // Por ahora lo intentamos pasar tal cual o convertimos a int si es simple
            document.getElementById('duracionServicio').value = servicio.duracion; 
            
            document.getElementById('imagenServicio').value = servicio.imagen || '';
            document.getElementById('activoServicio').checked = servicio.activo;
        } else {
            // Modo creación
            modalTitle.textContent = 'Nuevo Servicio';
            form.reset();
            document.getElementById('servicioId').value = '';
            document.getElementById('activoServicio').checked = true;
        }
        
        modal.classList.add('active');
    }

    editServicio(id) {
        // CAMBIO: Buscamos por 'id_servicio'
        const servicio = this.servicios.find(s => s.id_servicio === id);
        if (servicio) {
            this.openModal(servicio);
        }
    }

    async deleteServicio(id) {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await ServiciosService.delete(id);
            this.showNotification('Servicio eliminado correctamente', 'success');
            await this.loadServicios();
            
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            this.showNotification('Error al eliminar servicio', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;
        
        // CAMBIO: Creamos el objeto con las llaves que espera tu API Java (Snake Case probablemente)
        // Si tu API usa DTOs, asegúrate de que estos nombres coincidan con la clase Java.
        // Basado en tu respuesta JSON, parece que la API usa snake_case (nombre_servicio).
        const data = {
            nombre_servicio: document.getElementById('nombreServicio').value,
            categoria: document.getElementById('categoriaServicio').value,
            descripcion: document.getElementById('descripcionServicio').value,
            precio: parseFloat(document.getElementById('precioServicio').value),
            duracion: document.getElementById('duracionServicio').value, // Ojo con el formato de tiempo
            imagen: document.getElementById('imagenServicio').value,
            activo: document.getElementById('activoServicio').checked
        };
        
        // Si es actualización, incluimos el ID
        if (servicioId) {
            data.id_servicio = parseInt(servicioId);
        }
        
        this.showLoader();
        
        try {
            if (servicioId) {
                await ServiciosService.update(servicioId, data);
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                await ServiciosService.create(data);
                this.showNotification('Servicio creado correctamente', 'success');
            }
            
            closeModal();
            await this.loadServicios();
            
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            this.showNotification('Error al guardar servicio', 'error');
        } finally {
            this.hideLoader();
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
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
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

// Instancia global
let serviciosAdmin;

document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});