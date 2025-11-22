// Gestión de Servicios Admin - CORREGIDO PARA API JAVA
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
            ErrorHandler.handle(error);
        }
    }

    // Comentamos la auth temporalmente para probar
    /* async checkAuth() { ... } */

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
            // La API devuelve { success: true, data: [...] }
            this.servicios = response.data || [];
            this.filteredServicios = [...this.servicios];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            // this.showNotification('Error al cargar servicios', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;
        
        this.filteredServicios = this.servicios.filter(servicio => {
            // CORRECCIÓN 1: Usar nombreServicio (camelCase)
            const nombre = servicio.nombreServicio || '';
            const descripcion = servicio.descripcion || '';
            
            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                descripcion.toLowerCase().includes(searchTerm);
            
            // CORRECCIÓN 2: idCategoria
            const matchesCategoria = !categoriaFilter || servicio.idCategoria == categoriaFilter;
            
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
                    ${servicio.imagenURL ? 
                        `<img src="${servicio.imagenURL}" alt="${servicio.nombreServicio}" class="service-image">` :
                        `<div class="service-image" style="background: #ecf0f1; display: flex; align-items: center; justify-content: center;">
                            <i class="ph ph-image" style="font-size: 24px; color: #bdc3c7;"></i>
                        </div>`
                    }
                </td>
                <td><strong>${servicio.nombreServicio}</strong></td>
                <td>${this.formatCategoria(servicio.idCategoria)}</td>
                <td><strong>$${parseFloat(servicio.precio).toFixed(2)}</strong></td>
                <td>${servicio.duracionMinutos} min</td>
                <td>
                    <span class="badge active">Activo</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="serviciosAdmin.editServicio(${servicio.idServicio})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="serviciosAdmin.deleteServicio(${servicio.idServicio})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatCategoria(idCategoria) {
        // Mapa temporal de IDs a Nombres (ajusta según tu BD)
        const categorias = {
            1: 'Cabello',
            2: 'Uñas',
            3: 'Maquillaje',
            4: 'Spa',
            5: 'Depilación'
        };
        return categorias[idCategoria] || 'General';
    }

    openModal(servicio = null) {
        const modal = document.getElementById('modalServicio');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');
        
        if (servicio) {
            modalTitle.textContent = 'Editar Servicio';
            // CORRECCIÓN 7: Llenar el formulario con los datos correctos
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombreServicio').value = servicio.nombreServicio;
            document.getElementById('categoriaServicio').value = servicio.idCategoria;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracionMinutos;
            document.getElementById('imagenServicio').value = servicio.imagenURL || '';
        } else {
            modalTitle.textContent = 'Nuevo Servicio';
            form.reset();
            document.getElementById('servicioId').value = '';
        }
        
        modal.classList.add('active');
    }

    editServicio(id) {
        // Buscar por idServicio
        const servicio = this.servicios.find(s => s.idServicio === id);
        if (servicio) {
            this.openModal(servicio);
        }
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
        
        // CORRECCIÓN 8: Crear el objeto tal cual lo espera Java
        const data = {
            nombreServicio: document.getElementById('nombreServicio').value,
            idCategoria: parseInt(document.getElementById('categoriaServicio').value) || 1,
            descripcion: document.getElementById('descripcionServicio').value,
            precio: parseFloat(document.getElementById('precioServicio').value),
            duracionMinutos: parseInt(document.getElementById('duracionServicio').value),
            imagenURL: document.getElementById('imagenServicio').value
        };
        
        this.showLoader();
        
        try {
            if (servicioId) {
                await ServiciosService.update(servicioId, data);
                this.showNotification('Servicio actualizado', 'success');
            } else {
                await ServiciosService.create(data);
                this.showNotification('Servicio creado', 'success');
            }
            
            document.getElementById('modalServicio').classList.remove('active'); // Cerrar modal directo
            await this.loadServicios();
            
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al guardar servicio', 'error');
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

document.addEventListener('DOMContentLoaded', () => {
    new ServiciosAdmin();
});