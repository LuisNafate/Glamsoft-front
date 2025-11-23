// ================== MANEJADOR DE ESTADO DE LA APLICACIÓN ==================

const StateManager = {
    /**
     * Estado global de la aplicación
     */
    state: {
        user: null,
        isLoading: false,
        notifications: [],
        cart: [],
        selectedService: null,
        selectedDate: null,
        selectedTime: null,
        selectedStylist: null
    },

    /**
     * Listeners del estado
     */
    listeners: {},

    /**
     * Inicializar el estado desde localStorage
     */
    init() {
        // Cargar usuario si está autenticado
        // Intentar primero con API_CONFIG si existe
        let userStr = null;
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.AUTH && API_CONFIG.AUTH.USER_KEY) {
            userStr = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
        }
        // Si no existe, intentar con 'user_data' (usado por login.js)
        if (!userStr) {
            userStr = localStorage.getItem('user_data');
        }
        
        if (userStr) {
            try {
                this.state.user = JSON.parse(userStr);
                console.log('Usuario cargado en StateManager:', this.state.user);
            } catch (e) {
                console.error('Error al parsear datos de usuario:', e);
            }
        }

        // Cargar otros datos persistentes si existen
        const savedState = localStorage.getItem('app_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            } catch (e) {
                console.error('Error al parsear estado guardado:', e);
            }
        }
    },

    /**
     * Obtener valor del estado
     */
    get(key) {
        return this.state[key];
    },

    /**
     * Actualizar estado
     */
    set(key, value, persist = false) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Persistir en localStorage si se indica
        if (persist) {
            this.saveState();
        }

        // Notificar a los listeners
        this.notify(key, value, oldValue);
    },

    /**
     * Actualizar múltiples valores del estado
     */
    setMultiple(updates, persist = false) {
        Object.keys(updates).forEach(key => {
            this.set(key, updates[key], false);
        });

        if (persist) {
            this.saveState();
        }
    },

    /**
     * Guardar estado en localStorage
     */
    saveState() {
        try {
            const stateToPersist = {
                selectedService: this.state.selectedService,
                selectedDate: this.state.selectedDate,
                selectedTime: this.state.selectedTime,
                selectedStylist: this.state.selectedStylist,
                cart: this.state.cart
            };
            localStorage.setItem('app_state', JSON.stringify(stateToPersist));
        } catch (e) {
            console.error('Error al guardar estado:', e);
        }
    },

    /**
     * Limpiar estado
     */
    clear() {
        this.state = {
            user: null,
            isLoading: false,
            notifications: [],
            cart: [],
            selectedService: null,
            selectedDate: null,
            selectedTime: null,
            selectedStylist: null
        };
        localStorage.removeItem('app_state');
    },

    /**
     * Suscribirse a cambios en el estado
     */
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);

        // Retornar función para desuscribirse
        return () => {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        };
    },

    /**
     * Notificar cambios a los listeners
     */
    notify(key, newValue, oldValue) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    },

    // ========== HELPERS ESPECÍFICOS ==========

    /**
     * Actualizar datos del usuario
     */
    setUser(user) {
        this.set('user', user);
        if (user) {
            localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
        }
    },

    /**
     * Obtener usuario actual
     */
    getUser() {
        return this.state.user;
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return this.state.user !== null && localStorage.getItem('isLoggedIn') === 'true';
    },

    /**
     * Mostrar/ocultar loading
     */
    setLoading(isLoading) {
        this.set('isLoading', isLoading);
        
        // Actualizar UI del loading
        const loadingElement = document.getElementById('global-loading');
        if (loadingElement) {
            loadingElement.style.display = isLoading ? 'flex' : 'none';
        }
    },

    /**
     * Agregar notificación
     */
    addNotification(notification) {
        const notifications = [...this.state.notifications, notification];
        this.set('notifications', notifications);
    },

    /**
     * Marcar notificación como leída
     */
    markNotificationAsRead(notificationId) {
        const notifications = this.state.notifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
        );
        this.set('notifications', notifications);
    },

    /**
     * Obtener notificaciones no leídas
     */
    getUnreadNotifications() {
        return this.state.notifications.filter(notif => !notif.read);
    },

    /**
     * Configurar datos de cita
     */
    setAppointmentData(data) {
        this.setMultiple({
            selectedService: data.service || this.state.selectedService,
            selectedDate: data.date || this.state.selectedDate,
            selectedTime: data.time || this.state.selectedTime,
            selectedStylist: data.stylist || this.state.selectedStylist
        }, true);
    },

    /**
     * Obtener datos de cita
     */
    getAppointmentData() {
        return {
            service: this.state.selectedService,
            date: this.state.selectedDate,
            time: this.state.selectedTime,
            stylist: this.state.selectedStylist
        };
    },

    /**
     * Limpiar datos de cita
     */
    clearAppointmentData() {
        this.setMultiple({
            selectedService: null,
            selectedDate: null,
            selectedTime: null,
            selectedStylist: null
        }, true);
    }
};

// Inicializar al cargar
StateManager.init();

// Exportar manejador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
