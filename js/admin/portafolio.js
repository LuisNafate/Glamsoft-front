// Gestión de Portafolio Admin
class PortafolioAdmin {
    constructor() {
        this.imagenes = [];
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadImagenes();
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
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        
        // Clic en zona de upload
        uploadZone?.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Botón nueva imagen
        document.getElementById('btnNuevaImagen')?.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Selección de archivos
        fileInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag & Drop
        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // Formulario
        document.getElementById('formImagen')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveImagen();
        });
    }

    async loadImagenes() {
        this.showLoader();
        
        try {
            const response = await PortafolioService.getAll();
            this.imagenes = response.data || [];
            this.renderGallery();
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            this.showNotification('Error al cargar imágenes', 'error');
            this.imagenes = [];
            this.renderGallery();
        } finally {
            this.hideLoader();
        }
    }

    handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.uploadImagen(file);
            }
        });
    }

    async uploadImagen(file) {
        this.showLoader();
        
        try {
            // Convertir a base64 o usar FormData según la API
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const imageData = {
                    imagen: e.target.result,
                    titulo: file.name.split('.')[0],
                    descripcion: '',
                    categoria: 'otros',
                    destacada: false
                };
                
                await PortafolioService.create(imageData);
                this.showNotification('Imagen subida correctamente', 'success');
                await this.loadImagenes();
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Error al subir imagen:', error);
            this.showNotification('Error al subir imagen', 'error');
        } finally {
            this.hideLoader();
        }
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;
        
        if (this.imagenes.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        grid.innerHTML = this.imagenes.map(img => `
            <div class="gallery-item">
                <img src="${img.imagen}" alt="${img.titulo}" class="gallery-image" />
                <div class="gallery-content">
                    <div class="gallery-title">${img.titulo}</div>
                    <div class="gallery-description">
                        ${img.descripcion || 'Sin descripción'}
                    </div>
                    ${img.destacada ? '<span class="badge active" style="margin-bottom: 10px;">Destacada</span>' : ''}
                    <div class="gallery-actions">
                        <button class="btn-icon edit" onclick="portafolioAdmin.editImagen(${img.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="portafolioAdmin.deleteImagen(${img.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    editImagen(id) {
        const imagen = this.imagenes.find(img => img.id === id);
        if (!imagen) return;
        
        const modal = document.getElementById('modalImagen');
        
        document.getElementById('imagenId').value = imagen.id;
        document.getElementById('previewImagen').src = imagen.imagen;
        document.getElementById('tituloImagen').value = imagen.titulo;
        document.getElementById('descripcionImagen').value = imagen.descripcion || '';
        document.getElementById('categoriaImagen').value = imagen.categoria || 'otros';
        document.getElementById('destacadaImagen').checked = imagen.destacada || false;
        
        modal.classList.add('active');
    }

    async deleteImagen(id) {
        if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
            return;
        }
        
        this.showLoader();
        
        try {
            await PortafolioService.delete(id);
            this.showNotification('Imagen eliminada correctamente', 'success');
            await this.loadImagenes();
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            this.showNotification('Error al eliminar imagen', 'error');
        } finally {
            this.hideLoader();
        }
    }

    async saveImagen() {
        const id = document.getElementById('imagenId').value;
        
        const data = {
            titulo: document.getElementById('tituloImagen').value,
            descripcion: document.getElementById('descripcionImagen').value,
            categoria: document.getElementById('categoriaImagen').value,
            destacada: document.getElementById('destacadaImagen').checked
        };
        
        this.showLoader();
        
        try {
            await PortafolioService.update(id, data);
            this.showNotification('Imagen actualizada correctamente', 'success');
            closeModal();
            await this.loadImagenes();
        } catch (error) {
            console.error('Error al guardar imagen:', error);
            this.showNotification('Error al guardar imagen', 'error');
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

let portafolioAdmin;

document.addEventListener('DOMContentLoaded', () => {
    portafolioAdmin = new PortafolioAdmin();
});
