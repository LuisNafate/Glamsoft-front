// Gestión de Promociones Admin
class PromocionesAdmin {
    constructor() {
        this.promociones = [];
        this.filteredPromociones = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadPromociones();
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
    }

    async loadPromociones() {
        this.showLoader();
        
        try {
            const response = await PromocionesService.getAll();
            this.promociones = response.data || [];
            this.filteredPromociones = [...this.promociones];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar promociones:', error);
            this.showNotification('Error al cargar promociones', 'error');
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
            const matchesSearch = promo.titulo.toLowerCase().includes(searchTerm) ||
                                (promo.descripcion || '').toLowerCase().includes(searchTerm);
            
            const estado = this.getEstadoPromocion(promo);
            const matchesEstado = !estadoFilter || estado === estadoFilter;
            
            return matchesSearch && matchesEstado;
        });
        
        this.renderTable();
    }

    getEstadoPromocion(promo) {
        const hoy = new Date();
        const inicio = new Date(promo.fecha_inicio);
        const fin = new Date(promo.fecha_fin);
        
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
            
            return `
                <tr>
                    <td><strong>${promo.titulo}</strong></td>
                    <td style="max-width: 300px;">${promo.descripcion}</td>
                    <td><span class="discount-tag">${promo.descuento}%</span></td>
                    <td>${this.formatFecha(promo.fecha_inicio)}</td>
                    <td>${this.formatFecha(promo.fecha_fin)}</td>
                    <td>
                        <span class="promo-badge ${estado}">
                            ${estadoText[estado]}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="promocionesAdmin.editPromocion(${promo.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="promocionesAdmin.deletePromocion(${promo.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatFecha(fecha) {
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
            document.getElementById('promocionId').value = promo.id;
            document.getElementById('tituloPromocion').value = promo.titulo;
            document.getElementById('descripcionPromocion').value = promo.descripcion;
            document.getElementById('descuentoPromocion').value = promo.descuento;
            document.getElementById('codigoPromocion').value = promo.codigo || '';
            document.getElementById('fechaInicio').value = promo.fecha_inicio;
            document.getElementById('fechaFin').value = promo.fecha_fin;
            document.getElementById('imagenPromocion').value = promo.imagen || '';
            document.getElementById('activaPromocion').checked = promo.activa !== false;
        } else {
            modalTitle.textContent = 'Nueva Promoción';
            form.reset();
            document.getElementById('promocionId').value = '';
            document.getElementById('activaPromocion').checked = true;
        }
        
        modal.classList.add('active');
    }

    editPromocion(id) {
        const promo = this.promociones.find(p => p.id === id);
        if (promo) {
            this.openModal(promo);
        }
    }

    async deletePromocion(id) {
        if (!confirm('¿Estás seguro de eliminar esta promoción?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await PromocionesService.delete(id);
            this.showNotification('Promoción eliminada correctamente', 'success');
            await this.loadPromociones();
        } catch (error) {
            console.error('Error al eliminar promoción:', error);
            this.showNotification('Error al eliminar promoción', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async savePromocion() {
        const promocionId = document.getElementById('promocionId').value;
        
        const data = {
            titulo: document.getElementById('tituloPromocion').value,
            descripcion: document.getElementById('descripcionPromocion').value,
            descuento: parseInt(document.getElementById('descuentoPromocion').value),
            codigo: document.getElementById('codigoPromocion').value,
            fecha_inicio: document.getElementById('fechaInicio').value,
            fecha_fin: document.getElementById('fechaFin').value,
            imagen: document.getElementById('imagenPromocion').value,
            activa: document.getElementById('activaPromocion').checked
        };
        
        // Validación
        if (new Date(data.fecha_fin) < new Date(data.fecha_inicio)) {
            this.showNotification('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
            return;
        }
        
        this.showLoader();
        
        try {
            if (promocionId) {
                await PromocionesService.update(promocionId, data);
                this.showNotification('Promoción actualizada correctamente', 'success');
            } else {
                await PromocionesService.create(data);
                this.showNotification('Promoción creada correctamente', 'success');
            }
            
            closeModal();
            await this.loadPromociones();
        } catch (error) {
            console.error('Error al guardar promoción:', error);
            this.showNotification('Error al guardar promoción', 'error');
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
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

let promocionesAdmin;

document.addEventListener('DOMContentLoaded', () => {
    promocionesAdmin = new PromocionesAdmin();
});
