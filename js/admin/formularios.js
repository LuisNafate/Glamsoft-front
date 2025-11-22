// Gestión de Formularios Admin
class FormulariosAdmin {
    constructor() {
        this.formularios = [];
        this.filteredFormularios = [];
        this.currentFormulario = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadFormularios();
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
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterFormularios();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterFormularios();
        });
        
        document.getElementById('btnMarcarLeido')?.addEventListener('click', () => {
            this.updateEstado('leido');
        });
        
        document.getElementById('btnResponder')?.addEventListener('click', () => {
            this.responderFormulario();
        });
        
        document.getElementById('btnEliminar')?.addEventListener('click', () => {
            this.deleteFormulario();
        });
    }

    async loadFormularios() {
        this.showLoader();
        
        try {
            // Simulación de datos - reemplazar con API real
            this.formularios = this.generateMockData();
            this.filteredFormularios = [...this.formularios];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar formularios:', error);
            this.showNotification('Error al cargar formularios', 'error');
            this.formularios = [];
            this.filteredFormularios = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    generateMockData() {
        const nombres = ['María García', 'Juan Pérez', 'Ana Martínez', 'Carlos López', 'Laura Sánchez'];
        const asuntos = ['Consulta de precios', 'Solicitud de cita', 'Información de servicios', 'Queja', 'Sugerencia'];
        const estados = ['nuevo', 'leido', 'respondido'];
        
        return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            fecha: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
            nombre: nombres[Math.floor(Math.random() * nombres.length)],
            email: `usuario${i + 1}@email.com`,
            telefono: `+1 555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            asunto: asuntos[Math.floor(Math.random() * asuntos.length)],
            mensaje: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            estado: estados[Math.floor(Math.random() * estados.length)]
        }));
    }

    filterFormularios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const estadoFilter = document.getElementById('filterEstado').value;
        
        this.filteredFormularios = this.formularios.filter(form => {
            const matchesSearch = form.nombre.toLowerCase().includes(searchTerm) ||
                                form.email.toLowerCase().includes(searchTerm) ||
                                form.asunto.toLowerCase().includes(searchTerm);
            
            const matchesEstado = !estadoFilter || form.estado === estadoFilter;
            
            return matchesSearch && matchesEstado;
        });
        
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('formulariosTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.filteredFormularios.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredFormularios.map(form => `
            <tr style="${form.estado === 'nuevo' ? 'background: #fff9e6;' : ''}">
                <td>${this.formatFecha(form.fecha)}</td>
                <td><strong>${form.nombre}</strong></td>
                <td>${form.email}</td>
                <td>${form.telefono}</td>
                <td>${form.asunto}</td>
                <td>
                    <span class="form-status ${form.estado}">
                        ${this.getEstadoText(form.estado)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" style="background: var(--admin-accent); color: white;" 
                                onclick="formulariosAdmin.showDetalle(${form.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getEstadoText(estado) {
        const estados = {
            'nuevo': 'Nuevo',
            'leido': 'Leído',
            'respondido': 'Respondido'
        };
        return estados[estado] || 'Nuevo';
    }

    showDetalle(id) {
        const formulario = this.formularios.find(f => f.id === id);
        if (!formulario) return;
        
        this.currentFormulario = formulario;
        const modal = document.getElementById('modalFormulario');
        const detalle = document.getElementById('formularioDetalle');
        
        detalle.innerHTML = `
            <div style="padding: 20px 0;">
                <div style="display: grid; gap: 20px;">
                    <div>
                        <strong style="color: #7f8c8d;">Fecha de Envío:</strong><br>
                        <span>${this.formatFechaCompleta(formulario.fecha)}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <strong style="color: #7f8c8d;">Nombre:</strong><br>
                            <span style="font-size: 16px;">${formulario.nombre}</span>
                        </div>
                        <div>
                            <strong style="color: #7f8c8d;">Estado:</strong><br>
                            <span class="form-status ${formulario.estado}">
                                ${this.getEstadoText(formulario.estado)}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <strong style="color: #7f8c8d;">Email:</strong><br>
                            <a href="mailto:${formulario.email}" style="color: var(--admin-accent);">${formulario.email}</a>
                        </div>
                        <div>
                            <strong style="color: #7f8c8d;">Teléfono:</strong><br>
                            <a href="tel:${formulario.telefono}" style="color: var(--admin-accent);">${formulario.telefono}</a>
                        </div>
                    </div>
                    
                    <div>
                        <strong style="color: #7f8c8d;">Asunto:</strong><br>
                        <span style="font-size: 16px; font-weight: 600; color: var(--admin-primary);">
                            ${formulario.asunto}
                        </span>
                    </div>
                    
                    <div>
                        <strong style="color: #7f8c8d;">Mensaje:</strong><br>
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-top: 10px; line-height: 1.6;">
                            ${formulario.mensaje}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Actualizar visibilidad de botones
        const btnMarcarLeido = document.getElementById('btnMarcarLeido');
        if (btnMarcarLeido) {
            btnMarcarLeido.style.display = formulario.estado === 'nuevo' ? 'inline-flex' : 'none';
        }
        
        modal.classList.add('active');
        
        // Marcar como leído automáticamente si es nuevo
        if (formulario.estado === 'nuevo') {
            setTimeout(() => this.updateEstado('leido', false), 1000);
        }
    }

    updateEstado(nuevoEstado, showNotif = true) {
        if (!this.currentFormulario) return;
        
        this.currentFormulario.estado = nuevoEstado;
        
        // Actualizar en el array
        const index = this.formularios.findIndex(f => f.id === this.currentFormulario.id);
        if (index !== -1) {
            this.formularios[index] = this.currentFormulario;
        }
        
        if (showNotif) {
            this.showNotification('Estado actualizado correctamente', 'success');
        }
        
        this.filterFormularios();
    }

    responderFormulario() {
        if (!this.currentFormulario) return;
        
        const email = this.currentFormulario.email;
        const asunto = `Re: ${this.currentFormulario.asunto}`;
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(asunto)}`;
        
        this.updateEstado('respondido');
    }

    deleteFormulario() {
        if (!this.currentFormulario) return;
        
        if (!confirm('¿Estás seguro de eliminar este formulario?')) {
            return;
        }
        
        this.formularios = this.formularios.filter(f => f.id !== this.currentFormulario.id);
        this.showNotification('Formulario eliminado correctamente', 'success');
        closeModal();
        this.filterFormularios();
    }

    formatFecha(fecha) {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    formatFechaCompleta(fecha) {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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
        setTimeout(() => notification.remove(), 3000);
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

let formulariosAdmin;

document.addEventListener('DOMContentLoaded', () => {
    formulariosAdmin = new FormulariosAdmin();
});
