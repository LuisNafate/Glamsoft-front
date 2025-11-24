/**
 * Utilidades para verificar y gestionar perfiles de empleado
 * Usar en la consola del navegador para debug
 */

// Verificar si el usuario actual tiene perfil de empleado
async function verificarPerfilEmpleado() {
    console.log('🔍 Verificando perfil de empleado...');
    
    // Obtener usuario del StateManager o localStorage
    let user = null;
    if (typeof StateManager !== 'undefined') {
        user = StateManager.get('user');
    }
    if (!user) {
        const userStr = localStorage.getItem('user_data');
        if (userStr) user = JSON.parse(userStr);
    }
    
    if (!user) {
        console.error('❌ No hay usuario logueado');
        return false;
    }
    
    console.log('👤 Usuario actual:', user);
    console.log('🔑 ID Usuario:', user.id || user.idUsuario);
    console.log('🏢 ID Empleado:', user.idEmpleado);
    console.log('👔 Rol:', user.rol);
    
    if (!user.idEmpleado) {
        console.warn('⚠️ ADVERTENCIA: El usuario NO tiene idEmpleado');
        console.warn('⚠️ Este usuario NO puede recibir citas como estilista');
        console.warn('💡 Solución: Crear perfil de empleado con POST /api/empleados');
        
        // Intentar obtener del backend
        try {
            console.log('🔄 Intentando obtener del backend...');
            const empleadoData = await EmpleadosService.getById(user.id || user.idUsuario);
            console.log('📦 Respuesta del backend:', empleadoData);
            
            if (empleadoData.data?.idEmpleado || empleadoData.idEmpleado) {
                const idEmpleado = empleadoData.data?.idEmpleado || empleadoData.idEmpleado;
                console.log('✅ idEmpleado encontrado en backend:', idEmpleado);
                console.log('💡 Actualizando localStorage...');
                
                user.idEmpleado = idEmpleado;
                StateManager.set('user', user);
                localStorage.setItem('user_data', JSON.stringify(user));
                
                console.log('✅ Perfil actualizado correctamente');
                return true;
            } else {
                console.error('❌ El usuario NO tiene registro en la tabla empleado');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al consultar empleado:', error);
            return false;
        }
    } else {
        console.log('✅ El usuario tiene perfil de empleado completo');
        return true;
    }
}

// Crear perfil de empleado para usuario actual
async function crearPerfilEmpleado(datosEmpleado = {}) {
    console.log('🏗️ Creando perfil de empleado...');
    
    let user = null;
    if (typeof StateManager !== 'undefined') {
        user = StateManager.get('user');
    }
    if (!user) {
        const userStr = localStorage.getItem('user_data');
        if (userStr) user = JSON.parse(userStr);
    }
    
    if (!user) {
        console.error('❌ No hay usuario logueado');
        return;
    }
    
    const idUsuario = user.id || user.idUsuario;
    console.log('👤 Creando perfil para usuario ID:', idUsuario);
    
    const empleadoData = {
        idUsuario: idUsuario,
        puesto: datosEmpleado.puesto || 'Estilista',
        nombre: datosEmpleado.nombre || user.nombre || 'Sin nombre',
        telefono: datosEmpleado.telefono || user.telefono || '',
        imagenPerfil: datosEmpleado.imagenPerfil || null
    };
    
    console.log('📤 Datos a enviar:', empleadoData);
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/empleados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(empleadoData)
        });
        
        const result = await response.json();
        console.log('📦 Respuesta del servidor:', result);
        
        if (response.ok) {
            const idEmpleado = result.data?.idEmpleado || result.idEmpleado;
            console.log('✅ Perfil de empleado creado exitosamente');
            console.log('🏢 ID Empleado:', idEmpleado);
            
            // Actualizar usuario en localStorage
            user.idEmpleado = idEmpleado;
            StateManager.set('user', user);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            console.log('✅ Usuario actualizado en localStorage');
            return true;
        } else {
            console.error('❌ Error al crear perfil:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en la solicitud:', error);
        return false;
    }
}

// Listar estilistas y verificar sus IDs
async function listarEstilistas() {
    console.log('📋 Listando estilistas...');
    
    try {
        const response = await EstilistasService.getAll();
        const estilistas = response.data || response;
        
        console.log(`✅ ${estilistas.length} estilistas encontrados:`);
        console.table(estilistas.map(e => ({
            Nombre: e.nombre,
            'ID Usuario': e.idUsuario,
            'ID Empleado': e.idEmpleado || e.idEstilista,
            Puesto: e.puesto || 'N/A'
        })));
        
        return estilistas;
    } catch (error) {
        console.error('❌ Error al listar estilistas:', error);
    }
}

// Verificar citas de un estilista
async function verificarCitasEstilista(idEmpleado) {
    console.log(`📅 Verificando citas del estilista (idEmpleado: ${idEmpleado})...`);
    
    try {
        const response = await CitasService.getByEstilista(idEmpleado);
        const citas = response.data?.data || response.data || response;
        
        console.log(`✅ ${citas.length} citas encontradas:`);
        console.table(citas.map(c => ({
            ID: c.idCita,
            Cliente: c.nombreCliente || c.cliente,
            Fecha: c.fechaCita || c.fecha,
            Hora: c.horaCita || c.hora,
            Estado: c.estadoCita || c.estado,
            Servicio: c.nombreServicio || c.servicio
        })));
        
        return citas;
    } catch (error) {
        console.error('❌ Error al consultar citas:', error);
    }
}

// Menú de ayuda
function ayudaEstilistas() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║        UTILIDADES PARA DIAGNÓSTICO DE ESTILISTAS               ║
╚════════════════════════════════════════════════════════════════╝

📌 FUNCIONES DISPONIBLES:

1. verificarPerfilEmpleado()
   → Verifica si el usuario actual tiene perfil de empleado
   → Intenta obtener el idEmpleado del backend si no está en localStorage

2. crearPerfilEmpleado({ puesto, nombre, telefono, imagenPerfil })
   → Crea un perfil de empleado para el usuario actual
   → Ejemplo: crearPerfilEmpleado({ puesto: 'Estilista Senior' })

3. listarEstilistas()
   → Lista todos los estilistas con sus IDs
   → Muestra idUsuario e idEmpleado de cada uno

4. verificarCitasEstilista(idEmpleado)
   → Muestra las citas asignadas a un estilista específico
   → Ejemplo: verificarCitasEstilista(15)

5. ayudaEstilistas()
   → Muestra este menú de ayuda

🔍 DIAGNÓSTICO RÁPIDO:
   await verificarPerfilEmpleado()
   await listarEstilistas()

📚 MÁS INFO: Ver FLUJO_ESTILISTAS.md
    `);
}

console.log('✅ Utilidades de estilistas cargadas. Ejecuta ayudaEstilistas() para ver las opciones');
