class PortafolioAdmin {
    constructor() {
        this.imagenes = [];
        this.currentImageBase64 = null; // Para guardar la imagen temporalmente (modo edición)
        this.currentImagesBase64 = []; // Para guardar múltiples imágenes (modo creación)
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadCategorias();
            await this.loadImagenes();
        } catch (error) {
            console.error('Error init:', error);
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
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');

        // 1. Abrir selector de archivos
        uploadZone?.addEventListener('click', () => fileInput.click());
        // Botón "Nueva Imagen" eliminado - solo gestión por álbumes
        // document.getElementById('btnNuevaImagen')?.addEventListener('click', () => this.openModal());

        // 2. Manejar selección de archivo (Input) - MÚLTIPLES ARCHIVOS
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processFiles(Array.from(e.target.files));
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
                this.processFiles(Array.from(e.dataTransfer.files));
            }
        });

        // 4. Guardar Formulario
        document.getElementById('formImagen')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveImagen();
        });
    }

    async loadCategorias() {
        try {
            console.log('📂 Cargando categorías para portafolio...');
            const categorias = await CategoriasService.getAll();
            console.log('✅ Categorías cargadas:', categorias);

            const selectCategoria = document.getElementById('categoriaImagen');
            if (selectCategoria) {
                // Limpiar opciones existentes
                selectCategoria.innerHTML = '';

                // Si no hay categorías, mostrar un mensaje
                if (!categorias || categorias.length === 0) {
                    selectCategoria.innerHTML = '<option value="1">Sin categorías disponibles</option>';
                    console.warn('⚠️ No se encontraron categorías');
                    return;
                }

                // Agregar opciones desde la API
                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.idCategoria;
                    option.textContent = categoria.nombre;
                    selectCategoria.appendChild(option);
                });

                console.log(`✅ ${categorias.length} categorías cargadas en el selector`);
            } else {
                console.warn('⚠️ No se encontró el elemento #categoriaImagen');
            }
        } catch (error) {
            console.error('❌ Error al cargar categorías:', error);
            // En caso de error, dejar las categorías por defecto o mostrar mensaje
            const selectCategoria = document.getElementById('categoriaImagen');
            if (selectCategoria && selectCategoria.options.length === 0) {
                selectCategoria.innerHTML = '<option value="1">Error al cargar categorías</option>';
            }
        }
    }

    // Convierte la imagen a Base64 y abre el modal para confirmar (UNA SOLA IMAGEN)
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

    // Procesar MÚLTIPLES imágenes
    processFiles(files) {
        // Filtrar solo imágenes
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            this.showNotification('Solo se permiten imágenes', 'error');
            return;
        }

        if (imageFiles.length !== files.length) {
            this.showNotification(`Se ignoraron ${files.length - imageFiles.length} archivo(s) que no son imágenes`, 'warning');
        }

        // Validar tamaño de archivos
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        const validFiles = imageFiles.filter(file => {
            if (file.size > maxSizeInBytes) {
                this.showNotification(`${file.name} es muy grande. Máximo ${maxSizeInMB}MB`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            this.showNotification('Ninguna imagen cumple con los requisitos', 'error');
            return;
        }

        // Comprimir todas las imágenes
        this.currentImagesBase64 = [];
        let processed = 0;

        validFiles.forEach((file, index) => {
            this.compressImage(file, (compressedBase64) => {
                this.currentImagesBase64.push(compressedBase64);
                processed++;

                // Cuando todas estén procesadas, abrir el modal
                if (processed === validFiles.length) {
                    this.openModalMultiple();
                }
            });
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

        // AGRUPAR IMÁGENES POR TÍTULO (ÁLBUMES)
        const albumes = this.agruparPorTitulo(this.imagenes);
        console.log('Álbumes agrupados:', albumes);

        grid.innerHTML = albumes.map((album, index) => {
            console.log(`Álbum ${index}:`, {
                titulo: album.titulo,
                totalImagenes: album.imagenes.length,
                portada: album.portada
            });

            // Usar la imagen de portada (primera imagen o la marcada como destacada)
            const imageSrc = (album.portada && album.portada.trim() !== '')
                ? album.portada
                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="20"%3ESin imagen%3C/text%3E%3C/svg%3E';

            return `
                <div class="gallery-item">
                    <div style="position: relative;">
                        <img src="${imageSrc}"
                             alt="${album.titulo || 'Sin título'}"
                             class="gallery-image">
                        ${album.imagenes.length > 1 ? `
                            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                                <i class="fas fa-images"></i> ${album.imagenes.length}
                            </div>
                        ` : ''}
                    </div>
                    <div class="gallery-content">
                        <div class="gallery-title">${album.titulo || 'Sin título'}</div>
                        <div class="gallery-description">${album.descripcion || 'Sin descripción'}</div>
                        ${album.destacado ? '<span class="badge active">Destacado</span>' : ''}
                        <div class="gallery-actions" style="margin-top: 10px;">
                            <button class="btn-icon view" onclick="window.portafolioAdmin.viewAlbum('${album.titulo}')" type="button" title="Ver álbum">
                                <i class="ph ph-eye"></i>
                            </button>
                            <button class="btn-icon delete" onclick="window.portafolioAdmin.deleteAlbum('${album.titulo}')" type="button" title="Eliminar álbum">
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
        const previewMultiple = document.getElementById('previewMultiple');
        const modoEdicion = document.getElementById('modoEdicion');

        // Ocultar preview múltiple y mostrar preview único
        previewMultiple.style.display = 'none';
        preview.style.display = 'block';

        if (imagen) {
            // EDITAR
            title.textContent = 'Editar Imagen';
            modoEdicion.value = 'true';
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
            modoEdicion.value = 'false';
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

    // Abrir modal para MÚLTIPLES imágenes
    openModalMultiple() {
        const modal = document.getElementById('modalImagen');
        const title = document.querySelector('#modalImagen .modal-title');
        const form = document.getElementById('formImagen');
        const preview = document.getElementById('previewImagen');
        const previewMultiple = document.getElementById('previewMultiple');
        const previewGrid = document.getElementById('previewGrid');
        const cantidadImagenes = document.getElementById('cantidadImagenes');
        const modoEdicion = document.getElementById('modoEdicion');

        // Mostrar preview múltiple y ocultar preview único
        preview.style.display = 'none';
        previewMultiple.style.display = 'block';

        // CREAR ÁLBUM
        title.textContent = 'Nuevo Álbum de Portafolio';
        modoEdicion.value = 'false';
        form.reset();
        document.getElementById('imagenId').value = '';
        document.getElementById('categoriaImagen').value = 1;

        // Mostrar cantidad de imágenes
        cantidadImagenes.textContent = this.currentImagesBase64.length;

        // Renderizar previsualizaciones
        previewGrid.innerHTML = this.currentImagesBase64.map((base64, index) => `
            <div style="position: relative;">
                <img src="${base64}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
                <button type="button" onclick="window.portafolioAdmin.removeImage(${index})"
                    style="position: absolute; top: 5px; right: 5px; background: rgba(231, 76, 60, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                    ×
                </button>
                ${index === 0 ? '<div style="position: absolute; bottom: 5px; left: 5px; background: rgba(52, 152, 219, 0.9); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Portada</div>' : ''}
            </div>
        `).join('');

        modal.classList.add('active');
    }

    // Remover una imagen de la selección múltiple
    removeImage(index) {
        this.currentImagesBase64.splice(index, 1);

        if (this.currentImagesBase64.length === 0) {
            this.showNotification('Debes tener al menos una imagen', 'error');
            document.getElementById('modalImagen').classList.remove('active');
            return;
        }

        // Actualizar el preview
        const previewGrid = document.getElementById('previewGrid');
        const cantidadImagenes = document.getElementById('cantidadImagenes');

        cantidadImagenes.textContent = this.currentImagesBase64.length;

        previewGrid.innerHTML = this.currentImagesBase64.map((base64, idx) => `
            <div style="position: relative;">
                <img src="${base64}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
                <button type="button" onclick="window.portafolioAdmin.removeImage(${idx})"
                    style="position: absolute; top: 5px; right: 5px; background: rgba(231, 76, 60, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                    ×
                </button>
                ${idx === 0 ? '<div style="position: absolute; bottom: 5px; left: 5px; background: rgba(52, 152, 219, 0.9); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Portada</div>' : ''}
            </div>
        `).join('');
    }

    // Agrupar imágenes por título para crear "álbumes virtuales"
    agruparPorTitulo(imagenes) {
        const grupos = {};

        imagenes.forEach(img => {
            const titulo = img.titulo || 'Sin título';
            if (!grupos[titulo]) {
                grupos[titulo] = {
                    titulo: titulo,
                    descripcion: img.descripcion,
                    idCategoria: img.idCategoria,
                    destacado: false,
                    portada: null,
                    imagenes: []
                };
            }

            // Agregar imagen al grupo
            grupos[titulo].imagenes.push(img);

            // Si es destacada, usar como portada y marcar el álbum como destacado
            if (img.destacado) {
                grupos[titulo].destacado = true;
                grupos[titulo].portada = img.urlImagen;
            }
        });

        // Convertir objeto a array y asignar portada si no hay destacada
        const albumes = Object.values(grupos).map(album => {
            if (!album.portada && album.imagenes.length > 0) {
                album.portada = album.imagenes[0].urlImagen;
            }
            return album;
        });

        return albumes;
    }

    // Ver todas las imágenes de un álbum
    viewAlbum(titulo) {
        const album = this.agruparPorTitulo(this.imagenes).find(a => a.titulo === titulo);
        if (!album) return;

        // Crear modal para mostrar todas las imágenes
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '10001';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2 class="modal-title">${album.titulo} (${album.imagenes.length} imagen${album.imagenes.length !== 1 ? 'es' : ''})</h2>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <p style="color: #7f8c8d; margin-bottom: 20px;">${album.descripcion || 'Sin descripción'}</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; max-height: 500px; overflow-y: auto;">
                        ${album.imagenes.map((img, idx) => `
                            <div style="position: relative; border: 2px solid ${img.destacado ? '#3498db' : '#ddd'}; border-radius: 8px; overflow: hidden;">
                                <img src="${img.urlImagen}" style="width: 100%; height: 200px; object-fit: cover;">
                                ${img.destacado ? '<div style="position: absolute; top: 5px; left: 5px; background: rgba(52, 152, 219, 0.9); color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">Portada</div>' : ''}
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 8px; display: flex; justify-content: space-around;">
                                    <button onclick="window.portafolioAdmin.editImagen(${img.idImagen}); this.closest('.modal-overlay').remove();" class="btn-icon edit" style="background: white;" title="Editar">
                                        <i class="ph ph-pencil-simple"></i>
                                    </button>
                                    <button onclick="(async () => { const confirmed = await customConfirm('¿Eliminar esta imagen?', 'Eliminar Imagen', { icon: 'ph-trash' }); if (confirmed) { window.portafolioAdmin.deleteImagen(${img.idImagen}); this.closest('.modal-overlay').remove(); } })()" class="btn-icon delete" style="background: white;" title="Eliminar">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Eliminar un álbum completo (todas las imágenes con ese título)
    async deleteAlbum(titulo) {
        const album = this.agruparPorTitulo(this.imagenes).find(a => a.titulo === titulo);
        if (!album) return;

        const confirmed = await customConfirm(
            `¿Eliminar el álbum "${titulo}" con ${album.imagenes.length} imagen(es)?`,
            'Eliminar Álbum',
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();
        try {
            let exitosas = 0;
            let fallidas = 0;

            for (const img of album.imagenes) {
                try {
                    await PortafolioService.delete(img.idImagen);
                    exitosas++;
                } catch (error) {
                    console.error(`Error al eliminar imagen ${img.idImagen}:`, error);
                    fallidas++;
                }
            }

            await this.loadImagenes();

            if (fallidas === 0) {
                await customAlert(`Álbum "${titulo}" eliminado completamente`, 'Éxito', { type: 'success' });
            } else {
                await customAlert(`Álbum eliminado parcialmente: ${exitosas} exitosas, ${fallidas} fallidas`, 'Advertencia', { type: 'warning' });
            }
        } catch (error) {
            console.error('Error al eliminar álbum:', error);
            this.showNotification('Error al eliminar el álbum', 'error');
        } finally {
            this.hideLoader();
        }
    }

    editImagen(id) {
        const img = this.imagenes.find(i => i.idImagen === id);
        if (img) this.openModal(img);
    }

    async deleteImagen(id) {
        const confirmed = await customConfirm(
            '¿Borrar imagen?',
            'Eliminar Imagen',
            { icon: 'ph-trash' }
        );

        if (!confirmed) return;

        this.showLoader();
        try {
            await PortafolioService.delete(id);
            await customAlert('Imagen eliminada', 'Éxito', { type: 'success' });
            await this.loadImagenes();
        } catch(e) {
            console.error(e);
            await customAlert('Error al eliminar imagen', 'Error', { type: 'error' });
        } finally {
            this.hideLoader();
        }
    }

    async saveImagen() {
        const id = document.getElementById('imagenId').value;
        const modoEdicion = document.getElementById('modoEdicion').value === 'true';

        console.log('=== INICIO GUARDAR IMAGEN/ÁLBUM ===');
        console.log('Modo edición:', modoEdicion);
        console.log('Imágenes múltiples:', this.currentImagesBase64.length);

        // Validar título
        const titulo = document.getElementById('tituloImagen').value.trim();
        if (!titulo) {
            this.showNotification('El título es requerido', 'error');
            return;
        }

        // MODO EDICIÓN: Actualizar una sola imagen
        if (modoEdicion && id) {
            await this.saveImagenSingle(id, titulo);
            return;
        }

        // MODO CREACIÓN: Puede ser una o múltiples imágenes
        if (this.currentImagesBase64.length > 0) {
            // Guardar múltiples imágenes (ÁLBUM)
            await this.saveImagenMultiple(titulo);
        } else if (this.currentImageBase64) {
            // Guardar una sola imagen
            await this.saveImagenSingle(null, titulo);
        } else {
            this.showNotification('Debes seleccionar al menos una imagen', 'error');
        }
    }

    // Guardar UNA SOLA imagen (edición o creación única)
    async saveImagenSingle(id, titulo) {
        console.log('=== GUARDAR IMAGEN ÚNICA ===');
        console.log('currentImageBase64 existe?', !!this.currentImageBase64);

        // Validar que haya una imagen
        if (!this.currentImageBase64) {
            this.showNotification('Debes seleccionar una imagen', 'error');
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

    // Guardar MÚLTIPLES imágenes (ÁLBUM)
    async saveImagenMultiple(titulo) {
        console.log('=== GUARDAR ÁLBUM (MÚLTIPLES IMÁGENES) ===');
        console.log('Total de imágenes:', this.currentImagesBase64.length);
        console.log('Título del álbum:', titulo);

        const descripcion = document.getElementById('descripcionImagen').value;
        const idCategoria = parseInt(document.getElementById('categoriaImagen').value) || 1;
        const destacadoCheckbox = document.getElementById('destacadaImagen').checked;

        this.showLoader();

        try {
            let exitosas = 0;
            let fallidas = 0;

            // Crear un registro por cada imagen con el mismo título y descripción
            for (let i = 0; i < this.currentImagesBase64.length; i++) {
                const imageBase64 = this.currentImagesBase64[i];

                const data = {
                    titulo: titulo, // Mismo título para todas las imágenes del álbum
                    descripcion: descripcion, // Misma descripción
                    url: imageBase64,
                    idEstilista: 1,
                    idCategoria: idCategoria,
                    destacado: i === 0 && destacadoCheckbox // Solo la primera es destacada (portada)
                };

                console.log(`Guardando imagen ${i + 1}/${this.currentImagesBase64.length}...`);

                try {
                    const response = await PortafolioService.create(data);
                    console.log(`✅ Imagen ${i + 1} guardada:`, response);
                    exitosas++;
                } catch (error) {
                    console.error(`❌ Error al guardar imagen ${i + 1}:`, error);
                    fallidas++;
                }
            }

            // Cerrar modal
            document.getElementById('modalImagen').classList.remove('active');

            // Limpiar datos temporales
            this.currentImagesBase64 = [];
            this.currentImageBase64 = null;
            document.getElementById('formImagen').reset();

            // Recargar la galería
            await this.loadImagenes();

            // Mostrar resultado
            if (fallidas === 0) {
                this.showNotification(`Álbum creado: ${exitosas} imágenes guardadas correctamente`, 'success');
            } else if (exitosas > 0) {
                this.showNotification(`Álbum creado parcialmente: ${exitosas} exitosas, ${fallidas} fallidas`, 'warning');
            } else {
                this.showNotification('Error al crear el álbum', 'error');
            }

        } catch (error) {
            console.error('Error al guardar álbum:', error);
            this.showNotification('Error al guardar el álbum', 'error');
        } finally {
            this.hideLoader();
        }
    }

    showNotification(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `admin-notification ${type}`;
        div.textContent = msg;

        let bgColor = '#e74c3c'; // error (rojo)
        if (type === 'success') bgColor = '#27ae60'; // verde
        else if (type === 'warning') bgColor = '#f39c12'; // naranja
        else if (type === 'info') bgColor = '#3498db'; // azul

        div.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px; background: ${bgColor}; color: white; border-radius: 8px; z-index: 10000;`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
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