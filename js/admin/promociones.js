// Gestión de Promociones Admin
class PromocionesAdmin {
    constructor() {
        this.promociones = [];
        this.filteredPromociones = [];
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadServicios(); // Cargar servicios para el selector
            await this.loadPromociones();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al inicializar la aplicación', 'error');
        }
    }
async checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user_data') || 'null');
            
            // 🔒 SEGURIDAD: Solo Rol 1 (Admin) puede estar aquí
            if (!user || user.idRol !== 1) {
                console.warn("Acceso denegado: No eres Administrador.");
                window.location.href = '../inicio.html';
                return; // Detener ejecución
            }

            // Actualizar interfaz con datos del usuario
            const nombreReal = user.nombre || 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error de sesión:", error);
            window.location.href = '../login.html';
        }
    }
    setupEventListeners() {
        document.getElementById('btnNuevaPromocion')?.addEventListener('click', () => {
            this.openModal();
        });
        
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterPromociones();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterPromociones();
        });
        
        document.getElementById('formPromocion')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePromocion();
        });
        
        // Cambiar el helper text según el tipo de descuento
        document.getElementById('tipoDescuento')?.addEventListener('change', (e) => {
            const helper = document.getElementById('descuentoHelp');
            const input = document.getElementById('descuentoPromocion');
            if (e.target.value === 'PORCENTAJE') {
                helper.textContent = '(0-100%)';
                input.max = 100;
            } else {
                helper.textContent = '(Monto en $)';
                input.max = 999999;
            }
        });
        
        // Validar fechas
        document.getElementById('fechaInicio')?.addEventListener('change', () => {
            this.validateDates();
        });
        
        document.getElementById('fechaFin')?.addEventListener('change', () => {
            this.validateDates();
        });
    }

    validateDates() {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        if (fechaInicio && fechaFin) {
            if (new Date(fechaFin) < new Date(fechaInicio)) {
                document.getElementById('fechaFin').setCustomValidity('La fecha fin debe ser posterior a la fecha inicio');
            } else {
                document.getElementById('fechaFin').setCustomValidity('');
            }
        }
    }

    async loadServicios() {
        try {
            // Cargar servicios para el selector
            const response = await fetch('http://98.86.212.2:7000/api/servicios');
            const data = await response.json();
            const servicios = data.data || [];
            
            const select = document.getElementById('servicioPromocion');
            if (select) {
                select.innerHTML = '<option value="">Todos los servicios</option>';
                servicios.forEach(servicio => {
                    const option = document.createElement('option');
                    option.value = servicio.idServicio;
                    option.textContent = servicio.nombre || servicio.nombreServicio;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    async loadPromociones() {
        this.showLoader();
        
        try {
            const response = await PromocionesService.getAll();
            console.log('Respuesta completa de promociones:', response);
            
            // La API devuelve {data: [...], message: "...", status: "success"}
            // Probar ambas estructuras posibles
            if (response.data) {
                if (Array.isArray(response.data)) {
                    this.promociones = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    this.promociones = response.data.data;
                } else {
                    this.promociones = [];
                }
            } else {
                this.promociones = [];
            }
            
            console.log('Promociones cargadas:', this.promociones.length);
            this.filteredPromociones = [...this.promociones];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar promociones:', error);
            this.showNotification('Error al cargar promociones: ' + (error.message || 'Error desconocido'), 'error');
            this.promociones = [];
            this.filteredPromociones = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    filterPromociones() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const estadoFilter = document.getElementById('filterEstado').value;
        
        this.filteredPromociones = this.promociones.filter(promo => {
            const matchesSearch = (promo.nombre || '').toLowerCase().includes(searchTerm) ||
                                (promo.descripcion || '').toLowerCase().includes(searchTerm);
            
            const estado = this.getEstadoPromocion(promo);
            const matchesEstado = !estadoFilter || estado === estadoFilter;
            
            return matchesSearch && matchesEstado;
        });
        
        this.renderTable();
    }

    getEstadoPromocion(promo) {
        const hoy = new Date();
        
        // La API devuelve fechas como [año, mes, día]
        let inicio, fin;
        if (Array.isArray(promo.fechaInicio)) {
            const [year, month, day] = promo.fechaInicio;
            inicio = new Date(year, month - 1, day);
        } else {
            inicio = new Date(promo.fechaInicio);
        }
        
        if (Array.isArray(promo.fechaFin)) {
            const [year, month, day] = promo.fechaFin;
            fin = new Date(year, month - 1, day);
        } else {
            fin = new Date(promo.fechaFin);
        }
        
        if (hoy < inicio) return 'proxima';
        if (hoy > fin) return 'expirada';
        return 'activa';
    }

    renderTable() {
        const tbody = document.getElementById('promocionesTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.filteredPromociones.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredPromociones.map(promo => {
            const estado = this.getEstadoPromocion(promo);
            const estadoText = {
                'activa': 'Activa',
                'proxima': 'Próxima',
                'expirada': 'Expirada'
            };
            
            const descuento = promo.porcentajeDescuento || promo.descuento || 0;
            
            return `
                <tr>
                    <td><strong>${promo.nombre || 'Sin título'}</strong></td>
                    <td style="max-width: 300px;">${promo.descripcion || 'Descuento del ' + descuento + '%'}</td>
                    <td><span class="discount-tag">${descuento}%</span></td>
                    <td>${this.formatFecha(promo.fechaInicio)}</td>
                    <td>${this.formatFecha(promo.fechaFin)}</td>
                    <td>
                        <span class="promo-badge ${estado}">
                            ${estadoText[estado]}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="promocionesAdmin.editPromocion(${promo.idPromocion})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="promocionesAdmin.deletePromocion(${promo.idPromocion})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatFecha(fecha) {
        // La API devuelve fechas como [año, mes, día]
        if (Array.isArray(fecha)) {
            const [year, month, day] = fecha;
            return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
        // Si viene como string o Date
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    openModal(promo = null) {
        const modal = document.getElementById('modalPromocion');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formPromocion');
        
        if (promo) {
            modalTitle.textContent = 'Editar Promoción';
            document.getElementById('promocionId').value = promo.idPromocion;
            document.getElementById('tituloPromocion').value = promo.nombre;
            document.getElementById('descripcionPromocion').value = promo.descripcion || '';
            document.getElementById('tipoDescuento').value = 'PORCENTAJE';
            document.getElementById('descuentoPromocion').value = promo.porcentajeDescuento || promo.descuento || '';
            
            // Servicio asociado
            if (promo.servicios && promo.servicios.length > 0) {
                document.getElementById('servicioPromocion').value = promo.servicios[0].idServicio || '';
            } else {
                document.getElementById('servicioPromocion').value = '';
            }
            
            // Convertir fecha de array a string YYYY-MM-DD
            if (Array.isArray(promo.fechaInicio)) {
                const [year, month, day] = promo.fechaInicio;
                document.getElementById('fechaInicio').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else {
                document.getElementById('fechaInicio').value = promo.fechaInicio;
            }
            
            if (Array.isArray(promo.fechaFin)) {
                const [year, month, day] = promo.fechaFin;
                document.getElementById('fechaFin').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else {
                document.getElementById('fechaFin').value = promo.fechaFin;
            }
        } else {
            modalTitle.textContent = 'Nueva Promoción';
            form.reset();
            document.getElementById('promocionId').value = '';
            document.getElementById('tipoDescuento').value = 'PORCENTAJE';
            document.getElementById('servicioPromocion').value = '';
            
            // Establecer fecha mínima como hoy
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('fechaInicio').min = today;
            document.getElementById('fechaFin').min = today;
        }
        
        modal.classList.add('active');
    }

    editPromocion(id) {
        const promo = this.promociones.find(p => p.idPromocion === id);
        if (promo) {
            this.openModal(promo);
        }
    }

    async deletePromocion(id) {
        const confirmed = await customConfirm(
            '¿Estás seguro de eliminar esta promoción?',
            'Eliminar Promoción',
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();

        try {
            const response = await PromocionesService.delete(id);
            console.log('Respuesta delete:', response);
            const message = response?.data?.message || 'Promoción eliminada correctamente';
            await customAlert(message, 'Éxito', { type: 'success' });
            await this.loadPromociones();
        } catch (error) {
            console.error('Error al eliminar promoción:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar promoción';
            await customAlert(errorMsg, 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
    }

    async savePromocion() {
        const promocionId = document.getElementById('promocionId').value;
        const tipoDescuento = document.getElementById('tipoDescuento').value;
        const servicioId = document.getElementById('servicioPromocion').value;
        
        const data = {
            nombrePromocion: document.getElementById('tituloPromocion').value.trim(),
            tipoDescuento: tipoDescuento,
            descuento: parseFloat(document.getElementById('descuentoPromocion').value),
            fechaInicio: document.getElementById('fechaInicio').value,
            fechaFin: document.getElementById('fechaFin').value,
            idServicio: servicioId ? parseInt(servicioId) : null
        };
        
        // Validaciones
        if (!data.nombrePromocion) {
            this.showNotification('El nombre de la promoción es obligatorio', 'error');
            return;
        }
        
        if (data.descuento <= 0) {
            this.showNotification('El descuento debe ser mayor a 0', 'error');
            return;
        }
        
        if (tipoDescuento === 'PORCENTAJE' && data.descuento > 100) {
            this.showNotification('El porcentaje de descuento no puede ser mayor a 100%', 'error');
            return;
        }
        
        if (new Date(data.fechaFin) < new Date(data.fechaInicio)) {
            this.showNotification('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
            return;
        }
        
        this.showLoader();
        
        try {
            let response;
            if (promocionId) {
                response = await PromocionesService.update(promocionId, data);
                console.log('Respuesta update:', response);
                const message = response?.data?.message || 'Promoción actualizada correctamente';
                this.showNotification(message, 'success');
            } else {
                response = await PromocionesService.create(data);
                console.log('Respuesta create:', response);
                const message = response?.data?.message || 'Promoción creada correctamente';
                this.showNotification(message, 'success');
            }
            
            closeModal();
            await this.loadPromociones();
        } catch (error) {
            console.error('Error al guardar promoción:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Error al guardar promoción';
            this.showNotification(errorMsg, 'error');
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
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoader() {
        if (window.LoaderManager) {
            LoaderManager.show();
        } else {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'flex';
        }
    }

    hideLoader() {
        if (window.LoaderManager) {
            LoaderManager.hide();
        } else {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'none';
        }
    }
}

let promocionesAdmin;

document.addEventListener('DOMContentLoaded', () => {
    promocionesAdmin = new PromocionesAdmin();
});
