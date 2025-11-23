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
            // Petición GET: Devuelve DTOs (nombre, duracion, etc.)
            const response = await ServiciosService.getAll();
            
            // Tu API devuelve { status: "success", data: [...] }
            this.servicios = response.data || [];
            this.filteredServicios = [...this.servicios];
            this.renderTable();
            
        } catch (error) {
            console.error('Error al cargar:', error);
            // this.showNotification('Error al cargar servicios', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;
        
        this.filteredServicios = this.servicios.filter(servicio => {
            // LEER: Usamos nombres del DTO (que viene del GET)
            const nombre = servicio.nombre || ''; 
            const descripcion = servicio.descripcion || '';
            const categoria = servicio.categoria || ''; 
            
            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                descripcion.toLowerCase().includes(searchTerm);
            
            // Filtro de categoría (por texto porque el DTO trae el nombre)
            const matchesCategoria = !categoriaFilter || categoria.includes(categoriaFilter);
            
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
            
            // Llenar inputs (HTML) con datos del DTO
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombreServicio').value = servicio.nombre;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            document.getElementById('activoServicio').checked = servicio.activo;
            
            // Nota: El select de categoría podría no seleccionarse automáticamente 
            // si el DTO solo trae el nombre ("Corte") y el select espera ID ("1").
            // El usuario tendrá que volver a seleccionarla al editar.
            
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

    // --- ESTA ES LA PARTE CLAVE QUE PEDISTE ---
    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;
        
        // 1. Obtener valores del formulario
        const nombreInput = document.getElementById('nombreServicio').value;
        const categoriaInput = document.getElementById('categoriaServicio').value;
        const precioInput = document.getElementById('precioServicio').value;
        const duracionInput = document.getElementById('duracionServicio').value;
        const descripcionInput = document.getElementById('descripcionServicio').value;
        const imagenInput = document.getElementById('imagenServicio').value;
        const activoInput = document.getElementById('activoServicio').checked;

        // 2. Construir el objeto JSON EXACTO como lo mostraste
        const data = {
            imagenURL: imagenInput || "", // Cadena vacía si no hay imagen
            nombreServicio: nombreInput,
            duracionMinutos: parseInt(duracionInput), // Entero
            precio: parseFloat(precioInput),          // Decimal
            descripcion: descripcionInput,
            idCategoria: parseInt(categoriaInput) || 1, // Entero (Default 1 si falla)
            idFormulario: null,                       // Nulo explícito
            activo: activoInput                       // Booleano
        };
        
        this.showLoader();
        
        try {
            if (servicioId) {
                // UPDATE (PUT)
                await ServiciosService.update(parseInt(servicioId), data);
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                // CREATE (POST)
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
        notification.className = admin-notification ;{type};
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

// Inicializar
let serviciosAdmin;
document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});