class PortafolioAdmin {
    constructor() {
        this.imagenes = [];
        this.currentImageBase64 = null; // Para guardar la imagen temporalmente
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadImagenes();
        } catch (error) {
            console.error('Error init:', error);
        }
    }

    setupEventListeners() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        
        // 1. Abrir selector de archivos
        uploadZone?.addEventListener('click', () => fileInput.click());
        document.getElementById('btnNuevaImagen')?.addEventListener('click', () => this.openModal());

        // 2. Manejar selección de archivo (Input)
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processFile(e.target.files[0]);
            }
        });

        // 3. Drag & Drop
        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        
        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.processFile(e.dataTransfer.files[0]);
            }
        });

        // 4. Guardar Formulario
        document.getElementById('formImagen')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveImagen();
        });
    }

    // Convierte la imagen a Base64 y abre el modal para confirmar
    processFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Solo se permiten imágenes', 'error');
            return;
        }

        // Validar tamaño de archivo (máximo 5MB)
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        if (file.size > maxSizeInBytes) {
            this.showNotification(`La imagen es muy grande. Máximo ${maxSizeInMB}MB`, 'error');
            return;
        }

        // Comprimir y redimensionar la imagen antes de convertir a Base64
        this.compressImage(file, (compressedBase64) => {
            this.currentImageBase64 = compressedBase64;
            this.openModal(null, this.currentImageBase64); // Abrir modal en modo creación
        });
    }

    // Nueva función para comprimir imágenes
    compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Redimensionar si es muy grande (máximo 1920px de ancho)
                let width = img.width;
                let height = img.height;
                const maxWidth = 1920;
                const maxHeight = 1920;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height / width) * maxWidth;
                        width = maxWidth;
                    } else {
                        width = (width / height) * maxHeight;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a Base64 con compresión (calidad 0.8)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                console.log('Tamaño original:', (file.size / 1024).toFixed(2), 'KB');
                console.log('Tamaño comprimido:', (compressedBase64.length / 1024).toFixed(2), 'KB');

                callback(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async loadImagenes() {
        this.showLoader();
        try {
            const response = await PortafolioService.getAll();
            console.log('Respuesta completa del servidor:', response);

            // El backend puede devolver { data: [...] } o directamente [...]
            if (response.data && Array.isArray(response.data)) {
                this.imagenes = response.data;
            } else if (Array.isArray(response)) {
                this.imagenes = response;
            } else {
                this.imagenes = [];
            }

            console.log('Imágenes cargadas:', this.imagenes);

            // DEBUG: Ver cada imagen en detalle
            this.imagenes.forEach((img, i) => {
                console.log(`Imagen ${i}:`, {
                    id: img.idImagen,
                    titulo: img.titulo,
                    tieneUrl: !!img.urlImagen,
                    urlTipo: typeof img.urlImagen,
                    urlInicio: img.urlImagen ? img.urlImagen.substring(0, 50) : 'NULL'
                });
            });

            this.renderGallery();
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            this.showNotification('Error al cargar las imágenes', 'error');
        } finally {
            this.hideLoader();
        }
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) {
            console.error('No se encontró el elemento galleryGrid');
            return;
        }

        console.log('Renderizando galería con', this.imagenes.length, 'imágenes');

        if (this.imagenes.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = this.imagenes.map((img, index) => {
            console.log(`Imagen ${index}:`, {
                id: img.idImagen,
                titulo: img.titulo,
                url: img.urlImagen ? `${img.urlImagen.substring(0, 50)}...` : 'null',
                urlLength: img.urlImagen ? img.urlImagen.length : 0,
                destacado: img.destacado
            });

            // Validar que la URL exista y sea válida
            const imageSrc = (img.urlImagen && img.urlImagen.trim() !== '')
                ? img.urlImagen
                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="20"%3ESin imagen%3C/text%3E%3C/svg%3E';

            return `
                <div class="gallery-item">
                    <img src="${imageSrc}"
                         alt="${img.titulo || 'Sin título'}"
                         class="gallery-image">
                    <div class="gallery-content">
                        <div class="gallery-title">${img.titulo || 'Sin título'}</div>
                        <div class="gallery-description">${img.descripcion || 'Sin descripción'}</div>
                        ${img.destacado ? '<span class="badge active">Destacado</span>' : ''}
                        <div class="gallery-actions" style="margin-top: 10px;">
                            <button class="btn-icon edit" onclick="window.portafolioAdmin.editImagen(${img.idImagen})" type="button" title="Editar">
                                <i class="ph ph-pencil-simple"></i>
                            </button>
                            <button class="btn-icon delete" onclick="window.portafolioAdmin.deleteImagen(${img.idImagen})" type="button" title="Eliminar">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('Galería renderizada correctamente');
    }

    openModal(imagen = null, newImageBase64 = null) {
        const modal = document.getElementById('modalImagen');
        const title = document.querySelector('#modalImagen .modal-title');
        const form = document.getElementById('formImagen');
        const preview = document.getElementById('previewImagen');

        if (imagen) {
            // EDITAR
            title.textContent = 'Editar Imagen';
            document.getElementById('imagenId').value = imagen.idImagen;
            document.getElementById('tituloImagen').value = imagen.titulo;
            document.getElementById('descripcionImagen').value = imagen.descripcion || '';
            document.getElementById('categoriaImagen').value = imagen.idCategoria || 1;
            document.getElementById('destacadaImagen').checked = imagen.destacado;  // Campo correcto: destacado

            preview.src = imagen.urlImagen;
            this.currentImageBase64 = imagen.urlImagen; // Mantener la URL existente si no se cambia
        } else {
            // CREAR
            title.textContent = 'Nueva Imagen';
            form.reset();
            document.getElementById('imagenId').value = '';
            document.getElementById('categoriaImagen').value = 1;
            
            if (newImageBase64) {
                preview.src = newImageBase64;
                this.currentImageBase64 = newImageBase64;
            } else {
                preview.src = ''; // O imagen placeholder
                this.currentImageBase64 = null;
            }
        }
        modal.classList.add('active');
    }

    editImagen(id) {
        const img = this.imagenes.find(i => i.idImagen === id);
        if (img) this.openModal(img);
    }

    async deleteImagen(id) {
        if(!confirm('¿Borrar imagen?')) return;
        this.showLoader();
        try {
            await PortafolioService.delete(id);
            this.showNotification('Imagen eliminada', 'success');
            await this.loadImagenes();
        } catch(e) { console.error(e); }
        finally { this.hideLoader(); }
    }

    async saveImagen() {
        const id = document.getElementById('imagenId').value;

        console.log('=== INICIO GUARDAR IMAGEN ===');
        console.log('currentImageBase64 existe?', !!this.currentImageBase64);
        console.log('currentImageBase64 length:', this.currentImageBase64 ? this.currentImageBase64.length : 0);
        console.log('currentImageBase64 tipo:', typeof this.currentImageBase64);

        // Validar que haya una imagen
        if (!this.currentImageBase64) {
            this.showNotification('Debes seleccionar una imagen', 'error');
            return;
        }

        // Validar título
        const titulo = document.getElementById('tituloImagen').value.trim();
        if (!titulo) {
            this.showNotification('El título es requerido', 'error');
            return;
        }

        // Objeto EXACTO para Java (Portafolio.java)
        const data = {
            titulo: titulo,
            descripcion: document.getElementById('descripcionImagen').value,
            url: this.currentImageBase64, // Enviamos el Base64 o URL
            idEstilista: 1, // Default ID
            idCategoria: parseInt(document.getElementById('categoriaImagen').value) || 1,
            destacado: document.getElementById('destacadaImagen').checked  // Campo correcto: destacado
        };

        // Si estamos editando, agregamos el ID al cuerpo también por si acaso
        if (id) data.idImagen = parseInt(id);

        // Log detallado para debugging
        console.log('=== DATOS A ENVIAR ===');
        console.log('Título:', data.titulo);
        console.log('Descripción:', data.descripcion);
        console.log('ID Estilista:', data.idEstilista);
        console.log('ID Categoría:', data.idCategoria);
        console.log('Destacado:', data.destacado);
        console.log('URL existe?', !!data.url);
        console.log('URL type:', typeof data.url);
        console.log('URL length:', data.url ? data.url.length : 0);
        console.log('URL empieza con data:image?', data.url ? data.url.startsWith('data:image/') : false);
        console.log('Primeros 100 caracteres de URL:', data.url ? data.url.substring(0, 100) : 'null');

        if (id) {
            console.log('ID Imagen (editando):', data.idImagen);
        }

        this.showLoader();
        try {
            let response;
            if (id) {
                console.log('Actualizando imagen ID:', id);
                response = await PortafolioService.update(data);
            } else {
                console.log('Creando nueva imagen');
                response = await PortafolioService.create(data);
            }

            console.log('✅ Respuesta del servidor:', response);

            // Verificar si la imagen creada tiene URL
            if (response.data) {
                console.log('📋 Datos de la imagen creada:', response.data);
                console.log('   - ID:', response.data.idImagen);
                console.log('   - URL:', response.data.urlImagen ? `Longitud: ${response.data.urlImagen.length}` : 'NULL o vacío');

                // ⚠️ SOLUCIÓN TEMPORAL: Si el backend no devolvió la URL, la agregamos nosotros
                if (!response.data.urlImagen && this.currentImageBase64) {
                    console.log('⚡ Agregando URL manualmente porque el backend no la devolvió');
                    response.data.urlImagen = this.currentImageBase64;
                }
            }

            // Cerrar modal
            document.getElementById('modalImagen').classList.remove('active');

            // Limpiar el formulario y la imagen temporal
            this.currentImageBase64 = null;
            document.getElementById('formImagen').reset();

            // Recargar la galería
            await this.loadImagenes();

            this.showNotification(id ? 'Imagen actualizada correctamente' : 'Imagen guardada correctamente', 'success');
        } catch (error) {
            console.error('Error completo:', error);

            // Mostrar mensaje de error más específico
            let errorMsg = 'Error al guardar';

            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);

                if (error.response.status === 413) {
                    errorMsg = 'La imagen es demasiado grande para el servidor';
                } else if (error.response.status === 400) {
                    errorMsg = 'Datos inválidos: ' + (error.response.data?.message || 'Verifica los campos');
                } else if (error.response.data?.message) {
                    errorMsg = error.response.data.message;
                } else {
                    errorMsg = `Error del servidor (${error.response.status})`;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            this.showNotification(errorMsg, 'error');
        } finally {
            this.hideLoader();
        }
    }

    showNotification(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `admin-notification ${type}`;
        div.textContent = msg;
        div.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px; background: ${type==='success'?'#27ae60':'#e74c3c'}; color: white; border-radius: 8px; z-index: 10000;`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
}

let portafolioAdmin;
document.addEventListener('DOMContentLoaded', () => {
    portafolioAdmin = new PortafolioAdmin();
    // Hacer disponible globalmente para los onclick
    window.portafolioAdmin = portafolioAdmin;

    // Debug helper - temporal
    window.debugPortafolio = () => {
        console.log('=== DEBUG PORTAFOLIO ===');
        console.log('Total de imágenes:', portafolioAdmin.imagenes.length);
        portafolioAdmin.imagenes.forEach((img, i) => {
            console.log(`\nImagen ${i + 1}:`);
            console.log('  ID:', img.idImagen);
            console.log('  Título:', img.titulo);
            console.log('  Descripción:', img.descripcion);
            console.log('  URL existe?', !!img.urlImagen);
            console.log('  URL length:', img.urlImagen ? img.urlImagen.length : 0);
            console.log('  Es Base64?', img.urlImagen ? img.urlImagen.startsWith('data:image/') : false);
            console.log('  Categoría:', img.idCategoria);
            console.log('  Destacado:', img.destacado);
        });
        console.log('\n💡 Puedes ejecutar "debugPortafolio()" en cualquier momento');
    };

    console.log('💡 Ejecuta "debugPortafolio()" en la consola para ver detalles de las imágenes');
});