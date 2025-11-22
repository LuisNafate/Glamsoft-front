// ================== MANEJADOR DE ERRORES ==================

const ErrorHandler = {
    /**
     * Tipos de errores
     */
    ERROR_TYPES: {
        NETWORK: 'NETWORK_ERROR',
        AUTH: 'AUTH_ERROR',
        VALIDATION: 'VALIDATION_ERROR',
        NOT_FOUND: 'NOT_FOUND',
        SERVER: 'SERVER_ERROR',
        TIMEOUT: 'TIMEOUT_ERROR',
        UNKNOWN: 'UNKNOWN_ERROR'
    },

    /**
     * Determinar el tipo de error
     */
    getErrorType(error) {
        if (!error.response || error.response.status === 0) {
            return this.ERROR_TYPES.NETWORK;
        }

        const status = error.response.status;

        if (status === 401 || status === 403) {
            return this.ERROR_TYPES.AUTH;
        }

        if (status === 400 || status === 422) {
            return this.ERROR_TYPES.VALIDATION;
        }

        if (status === 404) {
            return this.ERROR_TYPES.NOT_FOUND;
        }

        if (status >= 500) {
            return this.ERROR_TYPES.SERVER;
        }

        if (error.message && error.message.includes('tiempo')) {
            return this.ERROR_TYPES.TIMEOUT;
        }

        return this.ERROR_TYPES.UNKNOWN;
    },

    /**
     * Obtener mensaje amigable del error
     */
    getUserMessage(error) {
        const errorType = this.getErrorType(error);
        const defaultMessages = {
            [this.ERROR_TYPES.NETWORK]: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
            [this.ERROR_TYPES.AUTH]: 'No tienes permisos para realizar esta acción. Por favor, inicia sesión nuevamente.',
            [this.ERROR_TYPES.VALIDATION]: 'Los datos proporcionados no son válidos. Revisa la información e intenta nuevamente.',
            [this.ERROR_TYPES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
            [this.ERROR_TYPES.SERVER]: 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
            [this.ERROR_TYPES.TIMEOUT]: 'La petición tardó demasiado tiempo. Intenta nuevamente.',
            [this.ERROR_TYPES.UNKNOWN]: 'Ocurrió un error inesperado. Intenta nuevamente.'
        };

        // Si hay un mensaje personalizado del servidor, usarlo
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }

        return defaultMessages[errorType];
    },

    /**
     * Mostrar error al usuario
     */
    showError(error, customMessage = null) {
        const message = customMessage || this.getUserMessage(error);
        
        // Usar alert por defecto (puede ser reemplazado por un sistema de notificaciones más elegante)
        alert(`❌ ${message}`);
        
        // Log detallado para desarrollo
        console.error('Error Details:', {
            type: this.getErrorType(error),
            message: message,
            originalError: error,
            response: error.response
        });
    },

    /**
     * Manejar error de forma general
     */
    async handle(error, options = {}) {
        const {
            showToUser = true,
            customMessage = null,
            onRetry = null,
            logToServer = false
        } = options;

        // Mostrar al usuario si está configurado
        if (showToUser) {
            this.showError(error, customMessage);
        }

        // Log al servidor si está configurado (para monitoreo)
        if (logToServer) {
            await this.logToServer(error);
        }

        // Ejecutar función de reintentar si existe
        if (onRetry && typeof onRetry === 'function') {
            onRetry(error);
        }

        return {
            type: this.getErrorType(error),
            message: this.getUserMessage(error),
            originalError: error
        };
    },

    /**
     * Enviar log de error al servidor
     */
    async logToServer(error) {
        try {
            // Aquí puedes implementar el envío de logs al servidor
            const errorLog = {
                type: this.getErrorType(error),
                message: error.message,
                stack: error.stack,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            console.log('Error logged:', errorLog);
            // await httpService.post('/logs/errors', errorLog);
        } catch (logError) {
            console.error('Error al enviar log:', logError);
        }
    },

    /**
     * Validar formularios
     */
    validateForm(formData, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const fieldRules = rules[field];

            // Validar requerido
            if (fieldRules.required && (!value || value.trim() === '')) {
                errors[field] = `El campo ${fieldRules.label || field} es requerido`;
            }

            // Validar email
            if (fieldRules.email && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors[field] = 'Formato de email inválido';
                }
            }

            // Validar longitud mínima
            if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
                errors[field] = `Debe tener al menos ${fieldRules.minLength} caracteres`;
            }

            // Validar longitud máxima
            if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
                errors[field] = `No puede exceder ${fieldRules.maxLength} caracteres`;
            }

            // Validar patrón personalizado
            if (fieldRules.pattern && value) {
                if (!fieldRules.pattern.test(value)) {
                    errors[field] = fieldRules.patternMessage || 'Formato inválido';
                }
            }

            // Validación personalizada
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customError = fieldRules.custom(value, formData);
                if (customError) {
                    errors[field] = customError;
                }
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Mostrar errores de validación en el formulario
     */
    showValidationErrors(errors) {
        // Limpiar errores previos
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Mostrar nuevos errores
        Object.keys(errors).forEach(field => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('input-error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = 'red';
                errorDiv.style.fontSize = '12px';
                errorDiv.style.marginTop = '4px';
                errorDiv.textContent = errors[field];
                
                input.parentElement.appendChild(errorDiv);
            }
        });
    }
};

// Exportar manejador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
