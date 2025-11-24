class ServiciosAdmin {
    constructor() {
        this.servicios = [];
        this.filteredServicios = [];
        this.currentServicio = null;
        this.imagenBase64 = null; // Almacenar imagen en Base64
        // Mapa manual para traducir Nombres de API -> IDs de Formulario
        this.mapaCategorias = {
            'Cabello': 1,
            'Uñas': 2,
            'Maquillaje': 3,
            'Spa': 4,
            'Depilación': 5
        };
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadCategorias();
            await this.loadServicios();
            this.handleUrlParams(); // Para abrir modal desde URL
        } catch (error) {
            console.error('Error al inicializar:', error);
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
        document.getElementById('btnNuevoServicio')?.addEventListener('click', () => this.openModal());
        document.getElementById('searchInput')?.addEventListener('input', () => this.filterServicios());
        document.getElementById('filterCategoria')?.addEventListener('change', () => this.filterServicios());

        document.getElementById('formServicio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveServicio();
        });

        // Event listener para la carga de imagen
        const imagenInput = document.getElementById('imagenServicio');
        if (imagenInput) {
            imagenInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Event listener para quitar imagen
        const removeBtn = document.getElementById('removeImageBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeImage());
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No se seleccionó archivo');
            return;
        }

        console.log('========== CARGANDO IMAGEN ==========');
        console.log('Archivo seleccionado:', file.name);
        console.log('Tipo:', file.type);
        console.log('Tamaño:', (file.size / 1024).toFixed(2), 'KB');

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor selecciona una imagen válida', 'error');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('La imagen es muy grande. Máximo 5MB', 'error');
            return;
        }

        try {
            // Comprimir y convertir a Base64
            const base64 = await this.compressAndConvertToBase64(file);
            this.imagenBase64 = base64;

            console.log('Imagen convertida a Base64');
            console.log('Longitud Base64:', base64.length);
            console.log('Primeros 100 caracteres:', base64.substring(0, 100));

            // Mostrar preview
            const preview = document.getElementById('imagenPreview');
            const previewImg = document.getElementById('previewImg');
            if (preview && previewImg) {
                previewImg.src = base64;
                preview.style.display = 'block';
                console.log('Preview mostrado correctamente');
            } else {
                console.warn('No se encontraron elementos de preview');
            }

            console.log('=====================================');
            this.showNotification('Imagen cargada correctamente', 'success');
        } catch (error) {
            console.error('Error al cargar imagen:', error);
            this.showNotification('Error al cargar la imagen', 'error');
        }
    }

    async compressAndConvertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar si es muy grande
                    const maxWidth = 800;
                    const maxHeight = 800;

                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        } else {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir a Base64 con compresión
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    removeImage() {
        this.imagenBase64 = null;
        const imagenInput = document.getElementById('imagenServicio');
        const preview = document.getElementById('imagenPreview');

        if (imagenInput) imagenInput.value = '';
        if (preview) preview.style.display = 'none';

        this.showNotification('Imagen eliminada', 'info');
    }

    async loadCategorias() {
        try {
            const categorias = await CategoriasService.getAll();
            console.log('Categorías cargadas:', categorias);

            // Llenar select del formulario (para crear/editar)
            const selectForm = document.getElementById('categoriaServicio');
            if (selectForm) {
                selectForm.innerHTML = '<option value="">Seleccionar...</option>' +
                    categorias.map(cat =>
                        `<option value="${cat.idCategoria}">${cat.nombre}</option>`
                    ).join('');
            }

            // Llenar select del filtro
            const selectFilter = document.getElementById('filterCategoria');
            if (selectFilter) {
                selectFilter.innerHTML = '<option value="">Todas las categorías</option>' +
                    categorias.map(cat =>
                        `<option value="${cat.nombre}">${cat.nombre}</option>`
                    ).join('');
            }

            // Actualizar el mapa de categorías dinámicamente
            this.mapaCategorias = {};
            categorias.forEach(cat => {
                this.mapaCategorias[cat.nombre] = cat.idCategoria;
            });

            console.log('Mapa de categorías actualizado:', this.mapaCategorias);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            this.showNotification('Error al cargar categorías', 'error');
        }
    }

    async loadServicios() {
        this.showLoader();
        try {
            const response = await ServiciosService.getAll();
            console.log('========== ADMIN: CARGANDO SERVICIOS ==========');
            console.log('Respuesta completa:', response);

            // Filtrar solo servicios activos
            this.servicios = (response.data || []).filter(s => s.activo === true);
            this.filteredServicios = [...this.servicios];

            // DEBUG: Ver imágenes
            if (this.servicios.length > 0) {
                console.log('Primer servicio:', this.servicios[0]);
                console.log('¿Tiene imagenURL?', !!this.servicios[0].imagenURL);
                console.log('Longitud imagenURL:', this.servicios[0].imagenURL ? this.servicios[0].imagenURL.length : 0);
            }
            console.log('===============================================');

            this.renderTable();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.hideLoader();
        }
    }

    filterServicios() {
        const searchInput = document.getElementById('searchInput');
        const categoriaSelect = document.getElementById('filterCategoria');

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const categoriaFilter = categoriaSelect ? categoriaSelect.value : '';

        this.filteredServicios = this.servicios.filter(servicio => {
            // Búsqueda por nombre y descripción
            const nombre = (servicio.nombre || '').toLowerCase();
            const descripcion = (servicio.descripcion || '').toLowerCase();
            const matchesSearch = !searchTerm ||
                                nombre.includes(searchTerm) ||
                                descripcion.includes(searchTerm);

            // Filtro por categoría (por nombre de categoría)
            const catNombre = servicio.categoria || '';
            const matchesCategoria = !categoriaFilter || catNombre === categoriaFilter;

            return matchesSearch && matchesCategoria;
        });

        this.renderTable();
    }

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const servicioId = params.get('id');
        if (servicioId) {
            this.editServicio(parseInt(servicioId));
        }
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
                    <div class="service-image" style="width: 60px; height: 60px; background: #ecf0f1; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden;">
                        ${servicio.imagenURL ?
                            `<img src="${servicio.imagenURL}" alt="${servicio.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` :
                            `<i class="ph ph-scissors" style="font-size: 24px; color: #bdc3c7;"></i>`
                        }
                    </div>
                </td>
                <td><strong>${servicio.nombre}</strong></td>
                <td>${servicio.categoria || 'General'}</td>
                <td><strong>$${parseFloat(servicio.precio).toFixed(2)}</strong></td>
                <td>${servicio.duracion} min</td>
                <td><span class="badge active">Activo</span></td>
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

    openModal(servicio = null) {
        const modal = document.getElementById('modalServicio');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('formServicio');
        const preview = document.getElementById('imagenPreview');
        const previewImg = document.getElementById('previewImg');

        if (servicio) {
            // --- MODO EDICIÓN ---
            title.textContent = 'Editar Servicio';
            document.getElementById('servicioId').value = servicio.idServicio;
            document.getElementById('nombreServicio').value = servicio.nombre;
            document.getElementById('descripcionServicio').value = servicio.descripcion || '';
            document.getElementById('precioServicio').value = servicio.precio;
            document.getElementById('duracionServicio').value = servicio.duracion;
            document.getElementById('activoServicio').checked = servicio.activo;

            // TRUCO: Usar el mapa para seleccionar la categoría correcta
            // Si la API dice "Cabello", buscamos el ID 1
            const catId = this.mapaCategorias[servicio.categoria] || "";
            document.getElementById('categoriaServicio').value = catId;

            // Cargar imagen si existe
            if (servicio.imagenURL) {
                this.imagenBase64 = servicio.imagenURL;
                if (preview && previewImg) {
                    previewImg.src = servicio.imagenURL;
                    preview.style.display = 'block';
                }
            } else {
                this.imagenBase64 = null;
                if (preview) preview.style.display = 'none';
            }

        } else {
            // --- MODO CREACIÓN ---
            title.textContent = 'Nuevo Servicio';
            form.reset();
            document.getElementById('servicioId').value = '';
            document.getElementById('activoServicio').checked = true;
            this.imagenBase64 = null;
            if (preview) preview.style.display = 'none';
        }
        modal.classList.add('active');
    }

    editServicio(id) {
        const servicio = this.servicios.find(s => s.idServicio === id);
        if (servicio) this.openModal(servicio);
    }

    async deleteServicio(id) {
        const confirmed = await customConfirm(
            '¿Eliminar servicio?',
            'Confirmar Eliminación',
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();
        try {
            await ServiciosService.delete(id);
            await this.loadServicios();
            await customAlert('Servicio eliminado', 'Éxito', { type: 'success' });
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            await customAlert('Error al eliminar', 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
    }

    async saveServicio() {
        const servicioId = document.getElementById('servicioId').value;

        // Objeto JAVA (Modelo)
        const data = {
            nombreServicio: document.getElementById('nombreServicio').value,
            duracionMinutos: parseInt(document.getElementById('duracionServicio').value),
            idCategoria: parseInt(document.getElementById('categoriaServicio').value) || 1,
            precio: parseFloat(document.getElementById('precioServicio').value),
            descripcion: document.getElementById('descripcionServicio').value,
            imagenURL: this.imagenBase64 || "", // Usar imagen Base64
            idFormulario: null,
            activo: document.getElementById('activoServicio').checked
        };

        // DEBUG: Ver qué datos estamos enviando
        console.log('========== GUARDANDO SERVICIO ==========');
        console.log('¿Tenemos imagenBase64?', !!this.imagenBase64);
        console.log('Longitud de imagenURL:', data.imagenURL.length);
        console.log('Primeros 100 caracteres de imagenURL:', data.imagenURL.substring(0, 100));
        console.log('Datos completos a enviar:', data);
        console.log('========================================');

        this.showLoader();
        try {
            let response;
            if (servicioId) {
                // UPDATE: Enviamos ID y DATA
                response = await ServiciosService.update(parseInt(servicioId), data);
                console.log('Respuesta del UPDATE:', response);
                this.showNotification('Servicio actualizado', 'success');
            } else {
                // CREATE: Enviamos solo DATA
                response = await ServiciosService.create(data);
                console.log('Respuesta del CREATE:', response);
                this.showNotification('Servicio creado', 'success');
            }
            document.getElementById('modalServicio').classList.remove('active');
            await this.loadServicios();
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            this.showNotification('Error al guardar', 'error');
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

let serviciosAdmin;
document.addEventListener('DOMContentLoaded', () => {
    serviciosAdmin = new ServiciosAdmin();
});