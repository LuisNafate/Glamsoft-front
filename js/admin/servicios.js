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
            // Descomenta esto cuando el login esté 100% listo
            // await this.checkAuth();
            
            this.setupEventListeners();
            await this.loadServicios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            // ErrorHandler.handle(error); // Opcional: activar si tienes el handler listo
        }
    }

    /* async checkAuth() {
        const user = StateManager.getState('user');
        if (!user || user.rol !== 'admin') {
            window.location.href = '../login.html';
        }
    }
    */

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
        
        // Guardar Formulario
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    async loadServicios() {
        this.showLoader();
        
        try {
            // Petición al backend
            const response = await ServiciosService.getAll();
            
            // La API devuelve { success: true, data: [...] } o directamente el array
            this.servicios = response.data || (Array.isArray(response) ? response : []);
            
            this.filteredServicios = [...this.servicios];
            this.renderTable();
            
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            this.showNotification('Error al cargar servicios', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;
        
        this.filteredServicios = this.servicios.filter(servicio => {
            // 1. Filtro de búsqueda (Nombre o Descripción)
            const nombre = servicio.nombre || ''; // Usamos el campo 'nombre'
            const descripcion = servicio.descripcion || '';
            
            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                descripcion.toLowerCase().includes(searchTerm);
            
            // 2. Filtro de categoría
            // Convertimos a string para comparar, por si viene como número
            const matchesCategoria = !categoriaFilter || String(servicio.categoria) === String(categoriaFilter);
            
            return matchesSearch && matchesCategoria;
        });
        
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('serviciosTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        // Mostrar estado vacío si no hay datos
        if (this.filteredServicios.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Generar filas de la tabla
        tbody.innerHTML = this.filteredServicios.map(servicio => `
            <tr>
                <td>
                    <div class="service-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                        <i class="ph ph-scissors" style="font-size: 24px; color: #999;"></i>
                    </div>
                </td>
                <td><strong>${servicio.nombre}</strong></td>
                <td>${this.formatCategoria(servicio.categoria)}</td>
                <td><strong>$${parseFloat(servicio.precio).toFixed(2)}</strong></td>
                <td>${servicio.duracion} min</td>
                <td>
                    <span class="badge ${servicio.activo ? 'active' : 'inactive'}">
                        ${servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="serviciosAdmin.editServicio(${servicio.idServicio})" title="Editar">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon delete" onclick="serviciosAdmin.deleteServicio(${servicio.idServicio})" title="Eliminar">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatCategoria(idCategoria) {
        // Mapeo simple para mostrar nombres en lugar de números
        // Asegúrate que estos IDs coincidan con tu base de datos
        const categorias = {
            1: 'Cabello',
            2: 'Uñas',
            3: 'Maquillaje',
            4: 'Spa',
            5: 'Depilación'
        };
        return categorias[idCategoria] || idCategoria || 'General';
    }

    openModal(servicio = null) {
        this.currentServicio = servicio;
        const modal = document.getElementById('modalServicio');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');
        
        if (servicio) {
            // --- MODO EDICIÓN ---
            modalTitle.textContent = 'Editar Servicio';
            
            // Llenamos los campos con los nombres EXACTOS de tu API
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombreServicio').value = servicio.nombre;
            document.getElementById('categoriaServicio').value = servicio.categoria;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            
            // Si tienes campo de imagen en el form HTML, úsalo aquí, si no, omítelo
            if(document.getElementById('imagenServicio')) {
                document.getElementById('imagenServicio').value = ''; 
            }
            
            // Checkbox activo
            document.getElementById('activoServicio').checked = servicio.activo;
            
        } else {
            // --- MODO CREACIÓN ---
            modalTitle.textContent = 'Nuevo Servicio';
            form.reset();
            document.getElementById('servicioId').value = '';
            document.getElementById('activoServicio').checked = true;
        }
        
        modal.classList.add('active');
    }

    editServicio(id) {
        // Buscamos el servicio por su ID en la lista local
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
        
        // Construimos el objeto con los nombres que la API espera para guardar
        // (Asumiendo que el backend espera los mismos nombres que envía)
        const data = {
            nombre: document.getElementById('nombreServicio').value,
            categoria: parseInt(document.getElementById('categoriaServicio').value),
            descripcion: document.getElementById('descripcionServicio').value,
            precio: parseFloat(document.getElementById('precioServicio').value),
            duracion: parseInt(document.getElementById('duracionServicio').value),
            // Si el backend espera 'imagenURL', agrégalo aquí si tienes el input
            activo: document.getElementById('activoServicio').checked
        };
        
        // Si estamos editando, añadimos el ID
        if(servicioId) {
            data.idServicio = parseInt(servicioId);
        }
        
        this.showLoader();
        
        try {
            if (servicioId) {
                await ServiciosService.update(servicioId, data);
                this.showNotification('Servicio actualizado', 'success');
            } else {
                await ServiciosService.create(data);
                this.showNotification('Servicio creado', 'success');
            }
            
            document.getElementById('modalServicio').classList.remove('active');
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoader() {
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'flex';
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'none';
    }
}

// Inicializar
let serviciosAdmin;
document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});