// js/estilista/portafolio.js - Versión Mejorada (Tipo Admin)

class PortafolioEstilista {
    constructor() {
        this.imagenes = [];
        this.currentImageBase64 = null;
        this.currentImagesBase64 = [];
        this.currentUserId = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadCategorias();
            await this.loadImagenes();
        } catch (error) {
            console.error('Error al inicializar:', error);
        }
    }

    setupEventListeners() {
        // 1. Drag & Drop y Archivos
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', (e) => {
                if(e.target !== document.getElementById('btnNuevaImagen')) fileInput.click();
            });
            
            // Botón explícito
            document.getElementById('btnNuevaImagen')?.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar doble click
                this.openModal();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.processFiles(Array.from(e.target.files));
            });

            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            
            uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
            
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) this.processFiles(Array.from(e.dataTransfer.files));
            });
        }

        // 2. Formulario
        document.getElementById('formImagen')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveImagen();
        });

        // 3. Menú Perfil
        const userIcon = document.getElementById('stylistUserIcon');
        const profileMenu = document.getElementById('profileMenuModal');
        
        if (userIcon) {
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
            });
            document.addEventListener('click', () => profileMenu.style.display = 'none');
        }

        // 4. Logout
        document.getElementById('headerLogoutBtn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
                await AuthService.logout();
                window.location.href = '../inicio.html';
            }
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

    // --- LÓGICA DE IMÁGENES (Igual que Admin) ---

    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            alert('Solo se permiten imágenes');
            return;
        }

        this.currentImagesBase64 = [];
        let processed = 0;

        // Si es solo una, abrir modal edición simple
        if (imageFiles.length === 1) {
            this.compressImage(imageFiles[0], (base64) => {
                this.currentImageBase64 = base64;
                this.openModal(null, base64);
            });
            return;
        }

        // Si son varias, procesar todas
        imageFiles.forEach(file => {
            this.compressImage(file, (base64) => {
                this.currentImagesBase64.push(base64);
                processed++;
                if (processed === imageFiles.length) this.openModalMultiple();
            });
        });
    }

    compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Redimensionar (Max 1920px)
                let width = img.width;
                let height = img.height;
                const maxDim = 1920;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = (height / width) * maxDim;
                        width = maxDim;
                    } else {
                        width = (width / height) * maxDim;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Calidad 0.8 JPEG
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async loadImagenes() {
        this.showLoader();
        try {
            // FILTRO EN BACKEND: Solicitar solo las imágenes de este estilista
            const response = await PortafolioService.getAll({ estilistaId: this.currentUserId });
            this.imagenes = response.data || response || [];

            this.renderGallery();
        } catch (error) {
            console.error('Error cargando portafolio:', error);
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
            if(emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if(emptyState) emptyState.style.display = 'none';

        // Agrupar por álbumes (Título)
        const albumes = this.agruparPorTitulo(this.imagenes);

        grid.innerHTML = albumes.map(album => {
            const imageSrc = album.portada || 'https://via.placeholder.com/300?text=Sin+Imagen';
            
            return `
                <div class="gallery-item">
                    <div style="position: relative;">
                        <img src="${imageSrc}" class="gallery-image" alt="${album.titulo}">
                        ${album.imagenes.length > 1 ? `
                            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                                <i class="fas fa-images"></i> ${album.imagenes.length}
                            </div>
                        ` : ''}
                    </div>
                    <div class="gallery-content">
                        <div class="gallery-title">${album.titulo}</div>
                        <div class="gallery-description">${album.descripcion || 'Sin descripción'}</div>
                        <div class="gallery-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn-icon" style="flex: 1; background: #3498db; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;" 
                                onclick="window.portfolioInstance.viewAlbum('${album.titulo}')">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn-icon" style="flex: 1; background: #e74c3c; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;"
                                onclick="window.portfolioInstance.deleteAlbum('${album.titulo}')">
                                <i class="fas fa-trash"></i> Borrar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    agruparPorTitulo(imagenes) {
        const grupos = {};
        imagenes.forEach(img => {
            const titulo = img.titulo || 'Sin título';
            if (!grupos[titulo]) {
                grupos[titulo] = {
                    titulo: titulo,
                    descripcion: img.descripcion,
                    idCategoria: img.idCategoria,
                    portada: img.urlImagen,
                    imagenes: []
                };
            }
            grupos[titulo].imagenes.push(img);
            if (img.destacado) grupos[titulo].portada = img.urlImagen;
        });
        return Object.values(grupos);
    }

    // --- MODALES Y GUARDADO ---

    openModal(imagen = null, newImageBase64 = null) {
        const modal = document.getElementById('modalImagen');
        const form = document.getElementById('formImagen');
        const preview = document.getElementById('previewImagen');
        const previewMultiple = document.getElementById('previewMultiple');
        
        // Resetear vistas
        preview.style.display = 'block';
        previewMultiple.style.display = 'none';
        
        if (imagen) {
            // Editar
            document.getElementById('modoEdicion').value = 'true';
            document.getElementById('imagenId').value = imagen.idImagen;
            document.getElementById('tituloImagen').value = imagen.titulo;
            document.getElementById('descripcionImagen').value = imagen.descripcion || '';
            document.getElementById('categoriaImagen').value = imagen.idCategoria || 1;
            document.getElementById('destacadaImagen').checked = imagen.destacado;
            
            preview.src = imagen.urlImagen;
            this.currentImageBase64 = imagen.urlImagen;
        } else {
            // Nuevo
            document.getElementById('modoEdicion').value = 'false';
            form.reset();
            document.getElementById('imagenId').value = '';
            
            if (newImageBase64) {
                preview.src = newImageBase64;
                this.currentImageBase64 = newImageBase64;
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        }
        
        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    openModalMultiple() {
        const modal = document.getElementById('modalImagen');
        const form = document.getElementById('formImagen');
        const preview = document.getElementById('previewImagen');
        const previewMultiple = document.getElementById('previewMultiple');
        const previewGrid = document.getElementById('previewGrid');
        
        preview.style.display = 'none';
        previewMultiple.style.display = 'block';
        
        document.getElementById('modoEdicion').value = 'false';
        form.reset();
        
        document.getElementById('cantidadImagenes').textContent = this.currentImagesBase64.length;
        
        previewGrid.innerHTML = this.currentImagesBase64.map((base64, index) => `
            <div style="position: relative;">
                <img src="${base64}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;">
                <button type="button" onclick="window.portfolioInstance.removeImage(${index})" 
                    style="position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">×</button>
            </div>
        `).join('');
        
        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    removeImage(index) {
        this.currentImagesBase64.splice(index, 1);
        if (this.currentImagesBase64.length === 0) {
            document.getElementById('modalImagen').classList.remove('active');
            document.getElementById('modalImagen').style.display = 'none';
        } else {
            this.openModalMultiple(); // Refrescar
        }
    }

    async saveImagen() {
        const id = document.getElementById('imagenId').value;
        const modoEdicion = document.getElementById('modoEdicion').value === 'true';
        const titulo = document.getElementById('tituloImagen').value.trim();
        const descripcion = document.getElementById('descripcionImagen').value;
        const categoria = parseInt(document.getElementById('categoriaImagen').value);
        const destacado = document.getElementById('destacadaImagen').checked;

        if (!titulo) {
            alert('El título es obligatorio');
            return;
        }

        // CAMBIO CLAVE: Usar this.currentUserId para idEstilista
        const baseData = {
            titulo,
            descripcion,
            idCategoria: categoria,
            destacado,
            idEstilista: this.currentUserId // ¡IMPORTANTE!
        };

        this.showLoader();

        try {
            if (this.currentImagesBase64.length > 0 && !modoEdicion) {
                // Guardar Múltiples
                for (const base64 of this.currentImagesBase64) {
                    await PortafolioService.create({
                        ...baseData,
                        url: base64
                    });
                }
            } else {
                // Guardar Individual (Crear o Editar)
                if (!this.currentImageBase64) {
                    alert('Debes seleccionar una imagen');
                    this.hideLoader();
                    return;
                }
                
                const data = { ...baseData, url: this.currentImageBase64 };
                
                if (modoEdicion && id) {
                    data.idImagen = parseInt(id);
                    await PortafolioService.update(data);
                } else {
                    await PortafolioService.create(data);
                }
            }

            // Limpiar y recargar
            document.getElementById('modalImagen').classList.remove('active');
            document.getElementById('modalImagen').style.display = 'none';
            this.currentImagesBase64 = [];
            this.currentImageBase64 = null;
            await this.loadImagenes();
            alert('Guardado correctamente');

        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Verifica la consola.');
        } finally {
            this.hideLoader();
        }
    }

    // Acciones sobre Álbumes
    async deleteAlbum(titulo) {
        if (!confirm(`¿Borrar todo el álbum "${titulo}"?`)) return;
        
        const album = this.agruparPorTitulo(this.imagenes).find(a => a.titulo === titulo);
        if (!album) return;

        this.showLoader();
        try {
            for (const img of album.imagenes) {
                await PortafolioService.delete(img.idImagen);
            }
            await this.loadImagenes();
        } catch (e) { console.error(e); }
        finally { this.hideLoader(); }
    }

    viewAlbum(titulo) {
        const album = this.agruparPorTitulo(this.imagenes).find(a => a.titulo === titulo);
        if (!album) return;
        
        // Reutilizamos el modal de Admin para ver álbumes, o creamos uno simple aquí
        // Para simplificar, voy a expandir el álbum en un modal temporal rápido
        const modalHtml = `
            <div class="modal-overlay active" style="z-index: 10001; display: flex;" id="viewAlbumModal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2>${album.titulo}</h2>
                        <button onclick="document.getElementById('viewAlbumModal').remove()" style="border:none; background:none; font-size: 24px; cursor:pointer;">&times;</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; padding: 20px;">
                        ${album.imagenes.map(img => `
                            <div style="position: relative;">
                                <img src="${img.urlImagen}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                                <button onclick="window.portfolioInstance.deleteSingle(${img.idImagen})" 
                                    style="position: absolute; bottom: 5px; right: 5px; background: red; color: white; border:none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    Borrar
                                </button>
                                <button onclick="window.portfolioInstance.editSingle(${img.idImagen})" 
                                    style="position: absolute; bottom: 5px; left: 5px; background: blue; color: white; border:none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    Editar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async deleteSingle(id) {
        if(confirm('¿Borrar esta imagen?')) {
            this.showLoader();
            await PortafolioService.delete(id);
            document.getElementById('viewAlbumModal').remove(); // Cerrar modal álbum
            await this.loadImagenes(); // Recargar todo
            this.hideLoader();
        }
    }

    async editSingle(id) {
        const img = this.imagenes.find(i => i.idImagen === id);
        if(img) {
            document.getElementById('viewAlbumModal').remove();
            this.openModal(img);
        }
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

let portfolioInstance;
document.addEventListener('DOMContentLoaded', () => {
    portfolioInstance = new PortafolioEstilista();
    window.portfolioInstance = portfolioInstance; // Hacerlo global para onclicks
});