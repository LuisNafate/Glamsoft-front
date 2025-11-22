// Gestión de Estilistas Admin
class EstilistasAdmin {
    constructor() {
        this.estilistas = [];
        this.filteredEstilistas = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadEstilistas();
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
        document.getElementById('btnNuevoEstilista')?.addEventListener('click', () => {
            this.openModal();
        });
        
        document.getElementById('searchInput')?.addEventListener('input', () => {
            this.filterEstilistas();
        });
        
        document.getElementById('filterDisponibilidad')?.addEventListener('change', () => {
            this.filterEstilistas();
        });
        
        document.getElementById('formEstilista')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEstilista();
        });
    }

    async loadEstilistas() {
        this.showLoader();
        
        try {
            const response = await EstilistasService.getAll();
            this.estilistas = response.data || [];
            this.filteredEstilistas = [...this.estilistas];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar estilistas:', error);
            this.showNotification('Error al cargar estilistas', 'error');
            this.estilistas = [];
            this.filteredEstilistas = [];
            this.renderTable();
        } finally {
            this.hideLoader();
        }
    }

    filterEstilistas() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const disponibilidadFilter = document.getElementById('filterDisponibilidad').value;
        
        this.filteredEstilistas = this.estilistas.filter(estilista => {
            const matchesSearch = estilista.nombre.toLowerCase().includes(searchTerm) ||
                                (estilista.email || '').toLowerCase().includes(searchTerm);
            
            const matchesDisponibilidad = !disponibilidadFilter || 
                                        estilista.disponibilidad === disponibilidadFilter;
            
            return matchesSearch && matchesDisponibilidad;
        });
        
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('estilistasTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.filteredEstilistas.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredEstilistas.map(estilista => {
            const disponibilidadMap = {
                'disponible': 'available',
                'ocupado': 'busy',
                'no_disponible': 'unavailable'
            };
            
            const disponibilidadText = {
                'disponible': 'Disponible',
                'ocupado': 'Ocupado',
                'no_disponible': 'No disponible'
            };
            
            const especialidades = estilista.especialidades || [];
            const especialidadesHtml = Array.isArray(especialidades) 
                ? especialidades.slice(0, 3).map(esp => `<span class="specialty-tag">${esp}</span>`).join('')
                : '';
            
            return `
                <tr>
                    <td>
                        ${estilista.avatar ? 
                            `<img src="${estilista.avatar}" alt="${estilista.nombre}" class="estilista-avatar">` :
                            `<div class="estilista-avatar" style="background: #3498db; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                ${estilista.nombre.charAt(0).toUpperCase()}
                            </div>`
                        }
                    </td>
                    <td><strong>${estilista.nombre}</strong></td>
                    <td>
                        <div class="specialties-list">
                            ${especialidadesHtml}
                            ${especialidades.length > 3 ? `<span class="specialty-tag">+${especialidades.length - 3}</span>` : ''}
                        </div>
                    </td>
                    <td>${estilista.telefono || '-'}</td>
                    <td>${estilista.email || '-'}</td>
                    <td>
                        <span class="availability-badge ${disponibilidadMap[estilista.disponibilidad] || 'available'}">
                            ${disponibilidadText[estilista.disponibilidad] || 'Disponible'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="estilistasAdmin.editEstilista(${estilista.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="estilistasAdmin.deleteEstilista(${estilista.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(estilista = null) {
        const modal = document.getElementById('modalEstilista');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('formEstilista');
        
        // Resetear checkboxes
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.checked = false;
            const daySchedule = cb.closest('.day-schedule');
            daySchedule.classList.remove('active');
            daySchedule.querySelector('.time-inputs').style.display = 'none';
        });
        
        if (estilista) {
            modalTitle.textContent = 'Editar Estilista';
            document.getElementById('estilistaId').value = estilista.id;
            document.getElementById('nombreEstilista').value = estilista.nombre;
            document.getElementById('emailEstilista').value = estilista.email || '';
            document.getElementById('telefonoEstilista').value = estilista.telefono || '';
            document.getElementById('disponibilidadEstilista').value = estilista.disponibilidad || 'disponible';
            document.getElementById('especialidadesEstilista').value = Array.isArray(estilista.especialidades) 
                ? estilista.especialidades.join(', ') 
                : '';
            document.getElementById('avatarEstilista').value = estilista.avatar || '';
            document.getElementById('biografiaEstilista').value = estilista.biografia || '';
            
            // Cargar horario
            if (estilista.horario) {
                Object.keys(estilista.horario).forEach(dia => {
                    const daySchedule = document.querySelector(`.day-schedule[data-day="${dia}"]`);
                    if (daySchedule && estilista.horario[dia]) {
                        const checkbox = daySchedule.querySelector('.day-checkbox');
                        checkbox.checked = true;
                        daySchedule.classList.add('active');
                        
                        const timeInputs = daySchedule.querySelector('.time-inputs');
                        timeInputs.style.display = 'flex';
                        timeInputs.querySelector('.hora-inicio').value = estilista.horario[dia].inicio;
                        timeInputs.querySelector('.hora-fin').value = estilista.horario[dia].fin;
                    }
                });
            }
        } else {
            modalTitle.textContent = 'Nuevo Estilista';
            form.reset();
            document.getElementById('estilistaId').value = '';
            document.getElementById('disponibilidadEstilista').value = 'disponible';
        }
        
        modal.classList.add('active');
    }

    editEstilista(id) {
        const estilista = this.estilistas.find(e => e.id === id);
        if (estilista) {
            this.openModal(estilista);
        }
    }

    async deleteEstilista(id) {
        if (!confirm('¿Estás seguro de eliminar este estilista?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await EstilistasService.delete(id);
            this.showNotification('Estilista eliminado correctamente', 'success');
            await this.loadEstilistas();
        } catch (error) {
            console.error('Error al eliminar estilista:', error);
            this.showNotification('Error al eliminar estilista', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async saveEstilista() {
        const estilistaId = document.getElementById('estilistaId').value;
        
        // Obtener horario
        const horario = {};
        document.querySelectorAll('.day-schedule').forEach(daySchedule => {
            const checkbox = daySchedule.querySelector('.day-checkbox');
            if (checkbox.checked) {
                const dia = daySchedule.getAttribute('data-day');
                const timeInputs = daySchedule.querySelector('.time-inputs');
                horario[dia] = {
                    inicio: timeInputs.querySelector('.hora-inicio').value,
                    fin: timeInputs.querySelector('.hora-fin').value
                };
            }
        });
        
        // Obtener especialidades
        const especialidadesInput = document.getElementById('especialidadesEstilista').value;
        const especialidades = especialidadesInput 
            ? especialidadesInput.split(',').map(e => e.trim()).filter(e => e)
            : [];
        
        const data = {
            nombre: document.getElementById('nombreEstilista').value,
            email: document.getElementById('emailEstilista').value,
            telefono: document.getElementById('telefonoEstilista').value,
            disponibilidad: document.getElementById('disponibilidadEstilista').value,
            especialidades: especialidades,
            avatar: document.getElementById('avatarEstilista').value,
            biografia: document.getElementById('biografiaEstilista').value,
            horario: horario
        };
        
        this.showLoader();
        
        try {
            if (estilistaId) {
                await EstilistasService.update(estilistaId, data);
                this.showNotification('Estilista actualizado correctamente', 'success');
            } else {
                await EstilistasService.create(data);
                this.showNotification('Estilista creado correctamente', 'success');
            }
            
            closeModal();
            await this.loadEstilistas();
        } catch (error) {
            console.error('Error al guardar estilista:', error);
            this.showNotification('Error al guardar estilista', 'error');
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

let estilistasAdmin;

document.addEventListener('DOMContentLoaded', () => {
    estilistasAdmin = new EstilistasAdmin();
});
