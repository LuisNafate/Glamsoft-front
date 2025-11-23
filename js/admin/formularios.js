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
            // await this.checkAuth(); // Deshabilitado temporalmente
            this.setupEventListeners();
            await this.loadFormularios();
        } catch (error) {
            console.error('Error al inicializar:', error);
            // ErrorHandler.handle(error);
            this.showNotification('Error al inicializar: ' + error.message, 'error');
        }
    }

    async checkAuth() {
        // Autenticación deshabilitada temporalmente para pruebas
        // const user = StateManager.getState('user');
        // if (!user || user.rol !== 'admin') {
        //     window.location.href = '../login.html';
        // }
    }

    setupEventListeners() {
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterFormularios();
        });
        
        document.getElementById('filterEstado')?.addEventListener('change', () => {
            this.filterFormularios();
        });
        
        // Botón para crear nuevo formulario
        const btnNuevo = document.getElementById('btnNuevoFormulario');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showFormularioModal());
        }
        
        document.getElementById('btnGuardarFormulario')?.addEventListener('click', () => {
            this.saveFormulario();
        });
        
        document.getElementById('btnEliminar')?.addEventListener('click', () => {
            this.deleteFormulario();
        });
    }

    async loadFormularios() {
        this.showLoader();
        
        try {
            const response = await FormulariosService.getAll();
            console.log('Respuesta API:', response);
            
            // La API devuelve: { status, message, data: [...] }
            this.formularios = response.data || response || [];
            this.filteredFormularios = [...this.formularios];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar formularios:', error);
            this.showNotification('Error al cargar formularios: ' + error.message, 'error');
            this.formularios = [];
            this.filteredFormularios = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    filterFormularios() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const estadoFilter = document.getElementById('filterEstado').value;
        
        this.filteredFormularios = this.formularios.filter(form => {
            const matchesSearch = form.nombreFormulario.toLowerCase().includes(searchTerm) ||
                                (form.descripcion && form.descripcion.toLowerCase().includes(searchTerm));
            
            let matchesEstado = true;
            if (estadoFilter === 'activo') {
                matchesEstado = form.activo === true;
            } else if (estadoFilter === 'inactivo') {
                matchesEstado = form.activo === false;
            }
            
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
            <tr>
                <td><strong>${form.idFormulario}</strong></td>
                <td>${form.nombreFormulario}</td>
                <td>${form.descripcion || 'Sin descripción'}</td>
                <td>
                    <span class="form-status ${form.activo ? 'leido' : 'nuevo'}">
                        ${form.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" style="background: #9b59b6; color: white;" 
                                onclick="formulariosAdmin.showDetalle(${form.idFormulario})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" style="background: #3498db; color: white;" 
                                onclick="formulariosAdmin.editFormulario(${form.idFormulario})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" style="background: #e74c3c; color: white;" 
                                onclick="formulariosAdmin.confirmDelete(${form.idFormulario})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showDetalle(id) {
        const formulario = this.formularios.find(f => f.idFormulario === id);
        if (!formulario) return;
        
        this.currentFormulario = formulario;
        const modal = document.getElementById('modalFormulario');
        const detalle = document.getElementById('formularioDetalle');
        
        detalle.innerHTML = `
            <div style="padding: 20px 0;">
                <div style="display: grid; gap: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <strong style="color: #7f8c8d;">ID:</strong><br>
                            <span style="font-size: 16px;">${formulario.idFormulario}</span>
                        </div>
                        <div>
                            <strong style="color: #7f8c8d;">Estado:</strong><br>
                            <span class="form-status ${formulario.activo ? 'leido' : 'nuevo'}">
                                ${formulario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <strong style="color: #7f8c8d;">Nombre del Formulario:</strong><br>
                        <span style="font-size: 18px; font-weight: 600; color: var(--admin-primary);">
                            ${formulario.nombreFormulario}
                        </span>
                    </div>
                    
                    <div>
                        <strong style="color: #7f8c8d;">Descripción:</strong><br>
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-top: 10px; line-height: 1.6;">
                            ${formulario.descripcion || 'Sin descripción'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ocultar botones de edición en modo detalle
        const btnGuardar = document.getElementById('btnGuardarFormulario');
        if (btnGuardar) btnGuardar.style.display = 'none';
        
        modal.classList.add('active');
    }

    showFormularioModal(formulario = null) {
        const modal = document.getElementById('modalFormulario');
        const detalle = document.getElementById('formularioDetalle');
        const title = modal.querySelector('.modal-title');
        
        this.currentFormulario = formulario;
        
        if (formulario) {
            title.textContent = 'Editar Formulario';
        } else {
            title.textContent = 'Nuevo Formulario';
        }
        
        detalle.innerHTML = `
            <div style="padding: 20px 0;">
                <div style="display: grid; gap: 20px;">
                    <div class="form-group">
                        <label for="nombreFormulario" style="display: block; margin-bottom: 8px; font-weight: 600;">
                            Nombre del Formulario *
                        </label>
                        <input type="text" 
                               id="nombreFormulario" 
                               class="search-input" 
                               style="width: 100%;"
                               value="${formulario ? formulario.nombreFormulario : ''}"
                               placeholder="Ej: Encuesta de Satisfacción"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="descripcionFormulario" style="display: block; margin-bottom: 8px; font-weight: 600;">
                            Descripción
                        </label>
                        <textarea id="descripcionFormulario" 
                                  class="search-input" 
                                  style="width: 100%; min-height: 100px; resize: vertical;"
                                  placeholder="Descripción del formulario...">${formulario && formulario.descripcion ? formulario.descripcion : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" 
                                   id="activoFormulario"
                                   ${!formulario || formulario.activo ? 'checked' : ''}>
                            <span style="font-weight: 600;">Formulario Activo</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar botón de guardar
        const btnGuardar = document.getElementById('btnGuardarFormulario');
        if (btnGuardar) btnGuardar.style.display = 'inline-flex';
        
        // Ocultar botón de eliminar en modo creación
        const btnEliminar = document.getElementById('btnEliminar');
        if (btnEliminar) {
            btnEliminar.style.display = formulario ? 'inline-flex' : 'none';
        }
        
        modal.classList.add('active');
    }

    editFormulario(id) {
        const formulario = this.formularios.find(f => f.idFormulario === id);
        if (formulario) {
            this.showFormularioModal(formulario);
        }
    }

    async saveFormulario() {
        const nombre = document.getElementById('nombreFormulario')?.value.trim();
        const descripcion = document.getElementById('descripcionFormulario')?.value.trim();
        const activo = document.getElementById('activoFormulario')?.checked;
        
        if (!nombre) {
            this.showNotification('El nombre del formulario es requerido', 'error');
            return;
        }
        
        this.showLoader();
        
        try {
            const formularioData = {
                nombreFormulario: nombre,
                descripcion: descripcion || '',
                activo: activo
            };
            
            if (this.currentFormulario) {
                // Actualizar
                await FormulariosService.update(this.currentFormulario.idFormulario, formularioData);
                this.showNotification('Formulario actualizado correctamente', 'success');
            } else {
                // Crear
                await FormulariosService.create(formularioData);
                this.showNotification('Formulario creado correctamente', 'success');
            }
            
            closeModal();
            await this.loadFormularios();
        } catch (error) {
            console.error('Error al guardar formulario:', error);
            this.showNotification('Error al guardar el formulario: ' + error.message, 'error');
        } finally {
            this.hideLoader();
        }
    }

    confirmDelete(id) {
        const formulario = this.formularios.find(f => f.idFormulario === id);
        if (!formulario) return;
        
        this.currentFormulario = formulario;
        
        if (!confirm(`¿Estás seguro de eliminar el formulario "${formulario.nombreFormulario}"?`)) {
            return;
        }
        
        this.deleteFormulario();
    }

    async deleteFormulario() {
        if (!this.currentFormulario) return;
        
        this.showLoader();
        
        try {
            await FormulariosService.delete(this.currentFormulario.idFormulario);
            this.showNotification('Formulario eliminado correctamente', 'success');
            closeModal();
            await this.loadFormularios();
        } catch (error) {
            console.error('Error al eliminar formulario:', error);
            this.showNotification('Error al eliminar el formulario: ' + error.message, 'error');
        } finally {
            this.hideLoader();
        }
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
