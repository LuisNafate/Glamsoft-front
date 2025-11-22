// ================== SERVICIO DE NOTIFICACIONES ==================

const NotificacionesService = {
    /**
     * Obtener todas las notificaciones del usuario
     */
    async getAll() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_ALL);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            throw error;
        }
    },

    /**
     * Obtener notificaciones no leídas
     */
    async getUnread() {
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_UNREAD);
            const response = await httpService.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener notificaciones no leídas:', error);
            throw error;
        }
    },

    /**
     * Marcar notificación como leída
     * @param {number|string} id 
     */
    async markAsRead(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.NOTIFICACIONES.MARK_AS_READ,
                { id }
            );
            const response = await httpService.post(url);
            return response.data;
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            throw error;
        }
    },

    /**
     * Eliminar notificación
     * @param {number|string} id 
     */
    async delete(id) {
        try {
            const url = API_CONFIG.buildUrl(
                API_CONFIG.ENDPOINTS.NOTIFICACIONES.DELETE,
                { id }
            );
            const response = await httpService.delete(url);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            throw error;
        }
    }
};

// Exportar servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificacionesService;
}
