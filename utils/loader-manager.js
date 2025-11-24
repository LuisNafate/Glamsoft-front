/**
 * Gestor Global de Loader - Garantiza que el loader siempre se oculte
 * Uso: LoaderManager.show() / LoaderManager.hide()
 */
class LoaderManager {
    static loaderElement = null;
    static isVisible = false;
    static timeout = null;
    static MAX_TIMEOUT = 30000; // 30 segundos máximo

    /**
     * Inicializa el gestor de loader
     */
    static init() {
        this.loaderElement = document.getElementById('loader');

        if (!this.loaderElement) {
            console.warn('⚠️ LoaderManager: No se encontró el elemento #loader');
            return;
        }

        // Asegurar que el loader esté oculto al cargar la página
        this.hide();

        // Safety: Ocultar loader automáticamente después de 30 segundos
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.isVisible) {
                    console.warn('⚠️ LoaderManager: Loader visible después de 30s, ocultando automáticamente');
                    this.forceHide();
                }
            }, this.MAX_TIMEOUT);
        });
    }

    /**
     * Muestra el loader
     */
    static show() {
        if (!this.loaderElement) {
            this.init();
        }

        if (this.loaderElement) {
            this.loaderElement.style.display = 'flex';
            this.isVisible = true;
            console.log('🔄 Loader: Mostrado');

            // Auto-hide después de 30 segundos como medida de seguridad
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                console.warn('⚠️ Loader: Tiempo máximo alcanzado, ocultando automáticamente');
                this.forceHide();
            }, this.MAX_TIMEOUT);
        }
    }

    /**
     * Oculta el loader
     */
    static hide() {
        if (!this.loaderElement) {
            this.init();
        }

        if (this.loaderElement) {
            this.loaderElement.style.display = 'none';
            this.isVisible = false;
            console.log('✅ Loader: Ocultado');

            // Limpiar timeout
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
    }

    /**
     * Fuerza el ocultamiento del loader (en caso de emergencia)
     */
    static forceHide() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
            this.isVisible = false;
            console.log('🚨 Loader: Forzado a ocultar');
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    /**
     * Ejecuta una función asíncrona mostrando el loader automáticamente
     * y garantizando que se oculte al finalizar
     */
    static async execute(asyncFunction) {
        try {
            this.show();
            const result = await asyncFunction();
            return result;
        } catch (error) {
            console.error('❌ Error en operación con loader:', error);
            throw error;
        } finally {
            this.hide();
        }
    }
}

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LoaderManager.init();
    });
} else {
    LoaderManager.init();
}

// Exponer globalmente
window.LoaderManager = LoaderManager;

// Safety: Ocultar loader si la página se está descargando (antes de reload)
window.addEventListener('beforeunload', () => {
    LoaderManager.forceHide();
});

// Safety: Ocultar loader si hubo un error global no capturado
window.addEventListener('error', (e) => {
    console.error('❌ Error global detectado:', e.error);
    LoaderManager.forceHide();
});

// Safety: Ocultar loader si hubo un error de promesa no capturada
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesa rechazada no capturada:', e.reason);
    LoaderManager.forceHide();
});
