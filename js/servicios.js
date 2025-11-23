// Gestión de Servicios Admin - VERSIÓN FINAL CONECTADA
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
        
        // IMPORTANTE: Prevenir recarga del formulario
        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });
    }

    // --- LECTURA (GET) ---
    async loadServicios() {
        this.showLoader();
        try {
            const response = await ServiciosService.getAll();
            // Tu API devuelve un DTO: { idServicio, nombre, descripcion, precio, duracion, categoria... }
            this.servicios = response.data || [];
            this.filteredServicios = [...this.servicios];
            this.renderTable();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al cargar servicios', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoriaFilter = document.getElementById('filterCategoria').value;
        
        this.filteredServicios = this.servicios.filter(servicio => {
            // DTO usa 'nombre'
            const nombre = servicio.nombre || '';
            const descripcion = servicio.descripcion || '';
            // DTO usa 'categoria' (el nombre, ej: "Corte")
            const categoria = servicio.categoria || '';
            
            const matchesSearch = nombre.toLowerCase().includes(searchTerm) ||
                                descripcion.toLowerCase().includes(searchTerm);
            
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

    // --- EDICIÓN (Mapeo DTO -> Formulario) ---
    openModal(servicio = null) {
        const modal = document.getElementById('modalServicio');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');
        
        if (servicio) {
            modalTitle.textContent = 'Editar Servicio';
            document.getElementById('servicioId').value = servicio.idServicio;
            
            // Mapeamos DTO (Lectura) a Inputs
            document.getElementById('nombreServicio').value = servicio.nombre; // DTO: nombre
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion; // DTO: duracion
            
            // NOTA: El select de categoría quedará vacío si no coincide el valor (ID vs Nombre)
            // El usuario debe volver a seleccionar la categoría al editar.
            
            document.getElementById('activoServicio').checked = servicio.activo;
        } else {
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

    // --- GUARDADO (POST/PUT - Aquí ocurre la TRADUCCIÓN CLAVE) ---
    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;
        
        // 1. Recoger datos del HTML
        const nombreInput = document.getElementById('nombreServicio').value;
        const categoriaInput = document.getElementById('categoriaServicio').value;
        const precioInput = document.getElementById('precioServicio').value;
        const duracionInput = document.getElementById('duracionServicio').value;
        const descripcionInput = document.getElementById('descripcionServicio').value;
        const imagenInput = document.getElementById('imagenServicio').value;
        const activoInput = document.getElementById('activoServicio').checked;

        // Validación simple
        if (!nombreInput || !precioInput || !duracionInput) {
            this.showNotification('Completa los campos obligatorios', 'error');
            return;
        }

        // 2. TRADUCCIÓN: Convertir al formato EXACTO que exige Java (Servicio.java)
        const data = {
            nombreServicio: nombreInput,                  // Java: nombreServicio
            duracionMinutos: parseInt(duracionInput),     // Java: duracionMinutos (int)
            idCategoria: parseInt(categoriaInput) || 1,   // Java: idCategoria (int)
            precio: parseFloat(precioInput),              // Java: precio (double)
            descripcion: descripcionInput,
            imagenURL: imagenInput || "",                 // Java: imagenURL
            idFormulario: null,                           // Java: idFormulario
            activo: activoInput                           // Java: activo
        };
        
        this.showLoader();
        
        try {
            if (servicioId) {
                // EDITAR
                await ServiciosService.update(parseInt(servicioId), data);
                this.showNotification('Servicio actualizado', 'success');
            } else {
                // CREAR
                await ServiciosService.create(data);
                this.showNotification('Servicio creado', 'success');
            }
            
            document.getElementById('modalServicio').classList.remove('active');
            await this.loadServicios();
            
        } catch (error) {
            console.error('Error:', error);
            const msg = error.response?.data?.message || 'Error al guardar. Verifica los datos.';
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