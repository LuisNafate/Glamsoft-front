/**
 * EmailService - Gestión de envío de correos con EmailJS
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear cuenta en https://www.emailjs.com/
 * 2. Configurar un servicio de email (Gmail, Outlook, etc.)
 * 3. Crear una plantilla de email
 * 4. Obtener tu Public Key de la sección "Account" > "General"
 * 5. Reemplazar las credenciales abajo con tus propios valores
 */

const EmailService = {
    // ⚠️ REEMPLAZAR ESTAS CREDENCIALES CON LAS TUYAS DE EMAILJS
    config: {
        PUBLIC_KEY: '9Ce6AidPK8kcH6EXo',           // De Account > General
        SERVICE_ID: 'service_q7btbxm',            // De Email Services
        TEMPLATE_ID: 'template_0vtm193'           // De Email Templates
    },

    /**
     * Inicializar EmailJS con tu Public Key
     */
    init() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.config.PUBLIC_KEY);
            console.log('📧 EmailJS inicializado');
        } else {
            console.error('❌ EmailJS no está cargado');
        }
    },

    /**
     * Enviar correo de confirmación de cita
     * @param {Object} citaData - Datos de la cita
     * @param {string} citaData.email - Email del cliente
     * @param {string} citaData.nombreCliente - Nombre del cliente (opcional)
     * @param {string} citaData.fecha - Fecha de la cita
     * @param {string} citaData.hora - Hora de la cita
     * @param {string} citaData.servicio - Nombre del servicio
     * @param {string} citaData.estilista - Nombre del estilista
     * @param {number} citaData.precio - Precio total
     * @returns {Promise}
     */
    async enviarConfirmacionCita(citaData) {
        try {
            console.log('📧 Enviando correo de confirmación...', citaData);

            // Validar que tengamos el email del cliente
            const clienteEmail = citaData.email;
            const clienteNombre = citaData.nombreCliente || 'Cliente';

            if (!clienteEmail) {
                console.warn('⚠️ No se encontró email del cliente');
                return { success: false, message: 'Email del cliente no disponible' };
            }

            // Formatear fecha para el correo
            const fechaFormateada = this.formatearFecha(citaData.fecha);
            const horaFormateada = this.formatearHora(citaData.hora);

            // Parámetros que se enviarán a la plantilla de EmailJS
            // Los nombres deben coincidir con las variables de tu plantilla
            const templateParams = {
                to_email: clienteEmail,
                to_name: clienteNombre,
                fecha: fechaFormateada,
                hora: horaFormateada,
                servicio: citaData.servicio || 'Servicio',
                estilista: citaData.estilista || 'Estilista',
                precio: citaData.precio ? `$${Number(citaData.precio).toLocaleString('es-CO')}` : '$0',
                // Información adicional
                salon_nombre: 'GLAMSOFT',
                salon_direccion: '295 Natalia Venegas, Tuxtla Gutiérrez, Chiapas',
                salon_telefono: '+961 933 4376'
            };

            console.log('📧 Parámetros del email:', templateParams);

            // Enviar email usando EmailJS
            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );

            console.log('✅ Email enviado exitosamente:', response);
            return {
                success: true,
                message: 'Email enviado correctamente',
                response
            };

        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            return {
                success: false,
                message: error.text || error.message || 'Error al enviar email',
                error
            };
        }
    },

    /**
     * Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
     */
    formatearFecha(fecha) {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    },

    /**
     * Formatear hora de 24h a 12h con AM/PM
     */
    formatearHora(hora) {
        if (!hora) return '';
        const [hours, minutes] = hora.split(':');
        const horaNum = parseInt(hours);
        const hora12 = horaNum === 0 ? 12 : horaNum > 12 ? horaNum - 12 : horaNum;
        const periodo = horaNum >= 12 ? 'PM' : 'AM';
        return `${hora12}:${minutes} ${periodo}`;
    },

    /**
     * Verificar si EmailJS está configurado correctamente
     */
    isConfigured() {
        const configured =
            this.config.PUBLIC_KEY !== 'TU_PUBLIC_KEY_AQUI' &&
            this.config.SERVICE_ID !== 'TU_SERVICE_ID_AQUI' &&
            this.config.TEMPLATE_ID !== 'TU_TEMPLATE_ID_AQUI';

        if (!configured) {
            console.warn('⚠️ EmailJS no está configurado. Por favor actualiza las credenciales en email.service.js');
        }

        return configured;
    }
};

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
