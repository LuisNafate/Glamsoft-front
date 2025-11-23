// ================== SERVICIO DE NOTIFICACIONES ==================

const NotificacionesService = {
    /**
     * Obtener todas las notificaciones de un usuario
     * @param {number} idUsuario - ID del usuario
     */
    async getByUsuario(idUsuario) {
        try {
            const response = await HttpService.get(`/usuarios/${idUsuario}/notificaciones`);
            return response;
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las notificaciones del usuario autenticado
     */
    async getAll() {
        try {
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            const idUsuario = userData.idUsuario || userData.id_usuario;

            if (!idUsuario) {
                throw new Error('Usuario no autenticado');
            }

            return await this.getByUsuario(idUsuario);
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            throw error;
        }
    },

    /**
     * Contar notificaciones no leídas de un usuario
     * @param {number} idUsuario - ID del usuario
     */
    async contarNoLeidas(idUsuario) {
        try {
            const response = await HttpService.get(`/usuarios/${idUsuario}/notificaciones/no-leidas`);
            return response;
        } catch (error) {
            console.error('Error al contar notificaciones no leídas:', error);
            throw error;
        }
    },

    /**
     * Obtener notificaciones no leídas del usuario autenticado
     */
    async getUnread() {
        try {
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            const idUsuario = userData.idUsuario || userData.id_usuario;

            if (!idUsuario) {
                throw new Error('Usuario no autenticado');
            }

            return await this.contarNoLeidas(idUsuario);
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
            const response = await HttpService.put(`/notificaciones/${id}/marcar-leida`);
            return response;
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            throw error;
        }
    },

    /**
     * Alias para marcarLeida (usado en admin)
     * @param {number|string} id
     */
    async marcarLeida(id) {
        return this.markAsRead(id);
    },

    /**
     * Marcar todas las notificaciones como leídas
     * @param {number} idUsuario - ID del usuario
     */
    async marcarTodasComoLeidas(idUsuario) {
        try {
            const notificaciones = await this.getByUsuario(idUsuario);
            const noLeidas = (notificaciones.data || notificaciones).filter(n => !n.leida);

            const promises = noLeidas.map(n =>
                this.markAsRead(n.idNotificacion || n.id_notificacion)
            );

            await Promise.all(promises);
            return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
            throw error;
        }
    },

    /**
     * Eliminar notificación
     * @param {number|string} id
     */
    async delete(id) {
        try {
            const response = await HttpService.delete(`/notificaciones/${id}`);
            return response;
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
