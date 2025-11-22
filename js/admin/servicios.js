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
            // Verificar autenticación
            await this.checkAuth();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar servicios
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
        // Botón nuevo servicio
        document.getElementById('btnNuevoServicio')?.addEventListener('click', () => {
            this.openModal();
        });
        
        // Búsqueda
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterServicios();
        });
        
        // Filtros
        document.getElementById('filterCategoria')?.addEventListener('change', () => {
            this.filterServicios();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterServicios();
        });
        
        // Formulario
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    async loadServicios() {
        this.showLoader();
        
        try {
            const response = await ServiciosService.getAll();
            this.servicios = response.data || [];
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
            // Filtro de búsqueda
            const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm) ||
                                (servicio.descripcion || '').toLowerCase().includes(searchTerm);
            
            // Filtro de categoría
            const matchesCategoria = !categoriaFilter || servicio.categoria === categoriaFilter;
            
            // Filtro de estado
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
                        `<img src="${servicio.imagen}" alt="${servicio.nombre}" class="service-image">` :
                        `<div class="service-image" style="background: #ecf0f1; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="color: #95a5a6;"></i>
                        </div>`
                    }
                </td>
                <td><strong>${servicio.nombre}</strong></td>
                <td>${this.formatCategoria(servicio.categoria)}</td>
                <td><strong>$${servicio.precio.toFixed(2)}</strong></td>
                <td>${servicio.duracion} min</td>
                <td>
                    <span class="badge ${servicio.activo !== false ? 'active' : 'inactive'}">
                        ${servicio.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="serviciosAdmin.editServicio(${servicio.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="serviciosAdmin.deleteServicio(${servicio.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatCategoria(categoria) {
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
            // Modo edición
            modalTitle.textContent = 'Editar Servicio';
            document.getElementById('servicioId').value = servicio.id;
            document.getElementById('nombreServicio').value = servicio.nombre;
            document.getElementById('categoriaServicio').value = servicio.categoria;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            document.getElementById('imagenServicio').value = servicio.imagen || '';
            document.getElementById('activoServicio').checked = servicio.activo !== false;
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
        const servicio = this.servicios.find(s => s.id === id);
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
        
        const data = {
            nombre: document.getElementById('nombreServicio').value,
            categoria: document.getElementById('categoriaServicio').value,
            descripcion: document.getElementById('descripcionServicio').value,
            precio: parseFloat(document.getElementById('precioServicio').value),
            duracion: parseInt(document.getElementById('duracionServicio').value),
            imagen: document.getElementById('imagenServicio').value,
            activo: document.getElementById('activoServicio').checked
        };
        
        // Validación básica
        if (!data.nombre || !data.categoria || !data.precio || !data.duracion) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        this.showLoader();
        
        try {
            if (servicioId) {
                // Actualizar
                await ServiciosService.update(servicioId, data);
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                // Crear
                await ServiciosService.create(data);
                this.showNotification('Servicio creado correctamente', 'success');
            }
            
            // Cerrar modal y recargar
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
        // Crear notificación temporal
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});
