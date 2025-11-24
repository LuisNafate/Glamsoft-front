/**
 * Custom Modal Component
 * Reemplaza los alert() y confirm() nativos con modales personalizados
 */

class CustomModal {
    constructor() {
        this.modalContainer = null;
        this.currentResolve = null;
        this.createModalContainer();
    }

    createModalContainer() {
        // Crear el contenedor del modal si no existe
        if (!document.getElementById('customModalContainer')) {
            const container = document.createElement('div');
            container.id = 'customModalContainer';
            document.body.appendChild(container);
            this.modalContainer = container;
        } else {
            this.modalContainer = document.getElementById('customModalContainer');
        }
    }

    /**
     * Muestra un modal de confirmación
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título del modal (opcional)
     * @param {object} options - Opciones adicionales
     * @returns {Promise<boolean>} - true si acepta, false si cancela
     */
    confirm(message, title = '¿Estás seguro?', options = {}) {
        return new Promise((resolve) => {
            this.currentResolve = resolve;

            const {
                confirmText = 'Aceptar',
                cancelText = 'Cancelar',
                confirmClass = 'confirm',
                cancelClass = 'cancel',
                icon = null
            } = options;

            const iconHtml = icon ? `<i class="ph ${icon} modal-icon"></i>` : '';

            this.modalContainer.innerHTML = `
                <div class="custom-modal-overlay" id="modalOverlay">
                    <div class="custom-modal-content">
                        <button class="custom-modal-close" id="modalCloseBtn">&times;</button>
                        ${iconHtml}
                        <h2 class="custom-modal-title">${title}</h2>
                        <p class="custom-modal-message">${message}</p>
                        <div class="custom-modal-actions">
                            <button class="btn ${cancelClass}" id="modalCancelBtn">${cancelText}</button>
                            <button class="btn ${confirmClass}" id="modalConfirmBtn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            this.showModal();
            this.setupConfirmListeners();
        });
    }

    /**
     * Muestra un modal de alerta (solo información)
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título del modal (opcional)
     * @param {object} options - Opciones adicionales
     * @returns {Promise<void>}
     */
    alert(message, title = 'Información', options = {}) {
        return new Promise((resolve) => {
            this.currentResolve = resolve;

            const {
                okText = 'Entendido',
                type = 'info', // 'info', 'success', 'error', 'warning'
                icon = this.getIconByType(type)
            } = options;

            const iconHtml = icon ? `<i class="ph ${icon} modal-icon ${type}"></i>` : '';

            this.modalContainer.innerHTML = `
                <div class="custom-modal-overlay" id="modalOverlay">
                    <div class="custom-modal-content">
                        <button class="custom-modal-close" id="modalCloseBtn">&times;</button>
                        ${iconHtml}
                        <h2 class="custom-modal-title">${title}</h2>
                        <p class="custom-modal-message">${message}</p>
                        <div class="custom-modal-actions">
                            <button class="btn confirm" id="modalOkBtn">${okText}</button>
                        </div>
                    </div>
                </div>
            `;

            this.showModal();
            this.setupAlertListeners();
        });
    }

    /**
     * Muestra un modal con input (prompt)
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título del modal (opcional)
     * @param {string} defaultValue - Valor por defecto del input
     * @param {object} options - Opciones adicionales
     * @returns {Promise<string|null>} - Valor ingresado o null si cancela
     */
    prompt(message, title = 'Ingrese información', defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            this.currentResolve = resolve;

            const {
                confirmText = 'Aceptar',
                cancelText = 'Cancelar',
                placeholder = '',
                inputType = 'text',
                icon = 'ph-chat-circle-text'
            } = options;

            const iconHtml = icon ? `<i class="ph ${icon} modal-icon"></i>` : '';

            this.modalContainer.innerHTML = `
                <div class="custom-modal-overlay" id="modalOverlay">
                    <div class="custom-modal-content">
                        <button class="custom-modal-close" id="modalCloseBtn">&times;</button>
                        ${iconHtml}
                        <h2 class="custom-modal-title">${title}</h2>
                        <p class="custom-modal-message">${message}</p>
                        <input
                            type="${inputType}"
                            id="modalInput"
                            class="custom-modal-input"
                            placeholder="${placeholder}"
                            value="${defaultValue}"
                        />
                        <div class="custom-modal-actions">
                            <button class="btn cancel" id="modalCancelBtn">${cancelText}</button>
                            <button class="btn confirm" id="modalConfirmBtn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            this.showModal();
            this.setupPromptListeners();

            // Focus en el input
            setTimeout(() => {
                const input = document.getElementById('modalInput');
                if (input) input.focus();
            }, 100);
        });
    }

    getIconByType(type) {
        const icons = {
            'success': 'ph-check-circle',
            'error': 'ph-x-circle',
            'warning': 'ph-warning-circle',
            'info': 'ph-info'
        };
        return icons[type] || 'ph-info';
    }

    setupConfirmListeners() {
        const overlay = document.getElementById('modalOverlay');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const closeBtn = document.getElementById('modalCloseBtn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.hideModal();
                if (this.currentResolve) this.currentResolve(true);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal();
                if (this.currentResolve) this.currentResolve(false);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
                if (this.currentResolve) this.currentResolve(false);
            });
        }

        // Cerrar al hacer clic en el overlay
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal();
                    if (this.currentResolve) this.currentResolve(false);
                }
            });
        }

        // Cerrar con ESC
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                if (this.currentResolve) this.currentResolve(false);
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    setupAlertListeners() {
        const overlay = document.getElementById('modalOverlay');
        const okBtn = document.getElementById('modalOkBtn');
        const closeBtn = document.getElementById('modalCloseBtn');

        const closeHandler = () => {
            this.hideModal();
            if (this.currentResolve) this.currentResolve();
        };

        if (okBtn) okBtn.addEventListener('click', closeHandler);
        if (closeBtn) closeBtn.addEventListener('click', closeHandler);

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeHandler();
            });
        }

        this.escapeHandler = (e) => {
            if (e.key === 'Escape') closeHandler();
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    setupPromptListeners() {
        const overlay = document.getElementById('modalOverlay');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const closeBtn = document.getElementById('modalCloseBtn');
        const input = document.getElementById('modalInput');

        const confirmHandler = () => {
            const value = input ? input.value : null;
            this.hideModal();
            if (this.currentResolve) this.currentResolve(value);
        };

        const cancelHandler = () => {
            this.hideModal();
            if (this.currentResolve) this.currentResolve(null);
        };

        if (confirmBtn) confirmBtn.addEventListener('click', confirmHandler);
        if (cancelBtn) cancelBtn.addEventListener('click', cancelHandler);
        if (closeBtn) closeBtn.addEventListener('click', cancelHandler);

        // Enter para confirmar
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') confirmHandler();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cancelHandler();
            });
        }

        this.escapeHandler = (e) => {
            if (e.key === 'Escape') cancelHandler();
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    showModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            // Prevenir scroll en el body
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            // Restaurar scroll en el body
            document.body.style.overflow = '';
        }
        // Remover el listener de escape
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
    }
}

// Crear instancia global
const modal = new CustomModal();

// Funciones globales para fácil uso
window.customConfirm = (message, title, options) => modal.confirm(message, title, options);
window.customAlert = (message, title, options) => modal.alert(message, title, options);
window.customPrompt = (message, title, defaultValue, options) => modal.prompt(message, title, defaultValue, options);