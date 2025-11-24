// js/estilista/portafolio.js

class PortafolioEstilista {
    constructor() {
        this.currentUser = null;
        this.currentUserId = null;
        this.editingImageId = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEventListeners();
            await this.loadPortfolio();
        } catch (error) {
            console.error('Error al inicializar portafolio:', error);
        }
    }

    async checkAuth() {
        try {
            // Obtener usuario solo de localStorage
            const userStr = localStorage.getItem('user_data');

            console.log("[PORTAFOLIO] user_data raw:", userStr);

            if (!userStr) {
                console.warn("[PORTAFOLIO] No hay usuario en localStorage. Redirigiendo...");
                window.location.href = '../inicio.html';
                return;
            }

            const user = JSON.parse(userStr);
            console.log("[PORTAFOLIO] Usuario parseado:", user);

            const rol = parseInt(user.idRol || user.rol || 0);
            console.log("[PORTAFOLIO] Rol detectado:", rol);

            if (rol !== 2 && rol !== 1) {
                console.warn("[PORTAFOLIO] Rol no autorizado:", rol, "- Se requiere 1 o 2");
                window.location.href = '../inicio.html';
                return;
            }

            const nombre = user.nombre || 'Estilista';
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombre;

            this.currentUser = user;
            this.currentUserId = user.idUsuario || user.id;

            console.log("[PORTAFOLIO] ✅ Auth exitosa. Usuario ID:", this.currentUserId);

        } catch (error) {
            console.error("[PORTAFOLIO] ❌ Error auth:", error);
            window.location.href = '../inicio.html';
        }
    }

    setupEventListeners() {
        // Profile menu
        const userIcon = document.getElementById('stylistUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (userIcon && profileMenu) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
            });
        }

        document.addEventListener('click', (e) => {
            if (profileMenu && profileMenu.style.display === 'block') {
                if (!profileMenu.contains(e.target) && !userIcon.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
            }
        });

        window.addEventListener('scroll', () => {
            if (profileMenu) profileMenu.style.display = 'none';
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    await AuthService.logout();
                    window.location.href = '../login.html';
                }
            });
        }

        // Modal controls
        const addBtn = document.getElementById('addImageBtn');
        const modal = document.getElementById('imageModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('imageForm');
        const imageUrlInput = document.getElementById('imageUrl');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => this.previewImage(e.target.value));
        }

        // Close modal on outside click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    async loadPortfolio() {
        this.showLoader();
        try {
            const response = await PortafolioService.getAll();
            const allImages = response || [];

            // Filtrar solo las imágenes del estilista actual
            const myImages = allImages.filter(img => {
                const idEstilista = img.idEstilista || (img.estilista ? img.estilista.id : 0);
                return idEstilista == this.currentUserId;
            });

            this.renderGallery(myImages);

        } catch (error) {
            console.error('Error al cargar portafolio:', error);
            this.showError('Error al cargar el portafolio');
        } finally {
            this.hideLoader();
        }
    }

    renderGallery(images) {
        const container = document.getElementById('galleryGrid');
        if (!container) return;

        if (images.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="ph ph-images"></i>
                    <h3>No tienes trabajos en tu portafolio</h3>
                    <p>Comienza a subir tus mejores trabajos para mostrar tu talento</p>
                </div>
            `;
            return;
        }

        container.innerHTML = images.map(img => `
            <div class="gallery-item" data-id="${img.idImagen}">
                <img src="${img.urlImagen}" alt="${img.titulo}" class="gallery-image"
                     onerror="this.src='https://via.placeholder.com/280x280?text=Imagen+no+disponible'">
                <div class="gallery-info">
                    <div class="gallery-title">${img.titulo}</div>
                    <div class="gallery-description">${img.descripcion || 'Sin descripción'}</div>
                    <div class="gallery-actions">
                        <button class="btn-edit" onclick="portfolioInstance.editImage(${img.idImagen})">
                            <i class="ph ph-pencil"></i> Editar
                        </button>
                        <button class="btn-delete" onclick="portfolioInstance.deleteImage(${img.idImagen})">
                            <i class="ph ph-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openModal(imageData = null) {
        const modal = document.getElementById('imageModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('imageForm');

        if (!modal || !form) return;

        if (imageData) {
            // Modo edición
            this.editingImageId = imageData.idImagen;
            modalTitle.textContent = 'Editar Imagen';
            document.getElementById('imageTitulo').value = imageData.titulo;
            document.getElementById('imageDescripcion').value = imageData.descripcion || '';
            document.getElementById('imageUrl').value = imageData.urlImagen;
            this.previewImage(imageData.urlImagen);
        } else {
            // Modo creación
            this.editingImageId = null;
            modalTitle.textContent = 'Agregar Imagen';
            form.reset();
            document.getElementById('imagePreview').style.display = 'none';
        }

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        const form = document.getElementById('imageForm');

        if (modal) modal.classList.remove('active');
        if (form) form.reset();

        this.editingImageId = null;
        document.getElementById('imagePreview').style.display = 'none';
    }

    previewImage(url) {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');

        if (!url) {
            preview.style.display = 'none';
            return;
        }

        img.src = url;
        preview.style.display = 'block';

        img.onerror = () => {
            preview.style.display = 'none';
        };
    }

    async handleSubmit(e) {
        e.preventDefault();

        const titulo = document.getElementById('imageTitulo').value.trim();
        const descripcion = document.getElementById('imageDescripcion').value.trim();
        const urlImagen = document.getElementById('imageUrl').value.trim();

        if (!titulo || !urlImagen) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        const data = {
            titulo,
            descripcion,
            urlImagen,
            idEstilista: this.currentUserId
        };

        this.showLoader();

        try {
            if (this.editingImageId) {
                // Actualizar
                data.idImagen = this.editingImageId;
                await PortafolioService.update(data);
                alert('Imagen actualizada correctamente');
            } else {
                // Crear
                await PortafolioService.create(data);
                alert('Imagen agregada correctamente');
            }

            this.closeModal();
            await this.loadPortfolio();

        } catch (error) {
            console.error('Error al guardar imagen:', error);
            alert('Error al guardar la imagen. Por favor intenta nuevamente.');
        } finally {
            this.hideLoader();
        }
    }

    async editImage(id) {
        try {
            const response = await PortafolioService.getAll();
            const allImages = response || [];
            const image = allImages.find(img => img.idImagen === id);

            if (image) {
                this.openModal(image);
            } else {
                alert('No se encontró la imagen');
            }
        } catch (error) {
            console.error('Error al cargar imagen:', error);
            alert('Error al cargar la imagen');
        }
    }

    async deleteImage(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
            return;
        }

        this.showLoader();

        try {
            await PortafolioService.delete(id);
            alert('Imagen eliminada correctamente');
            await this.loadPortfolio();
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            alert('Error al eliminar la imagen');
        } finally {
            this.hideLoader();
        }
    }

    showError(message) {
        const container = document.getElementById('galleryGrid');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="ph ph-warning" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>${message}</p>
                </div>
            `;
        }
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

// Instancia global para acceder desde onclick
let portfolioInstance;

document.addEventListener('DOMContentLoaded', () => {
    portfolioInstance = new PortafolioEstilista();
});
