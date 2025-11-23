// Gestión de Estilistas Admin
class EstilistasAdmin {
    constructor() {
        this.estilistas = [];
        this.servicios = [];
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadServicios(); // Cargar lista para el select
            await this.loadEstilistas(); // Cargar tabla
        } catch (error) {
            console.error('Error init:', error);
        }
    }

    setupEventListeners() {
        // Botón para abrir modal
        document.getElementById('btnNuevoEstilista')?.addEventListener('click', () => this.openModal());
        
        // Formulario Guardar (Prevenir submit default)
        document.getElementById('formEstilista')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEstilista();
        });
        
        // Botón Verificar Usuario
        document.getElementById('btnVerificarUsuario')?.addEventListener('click', () => this.verificarUsuario());
        
        // Checkboxes de Horario (Visual)
        document.querySelectorAll('.day-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const container = e.target.closest('.day-schedule');
                const inputs = container.querySelector('.time-inputs');
                if (e.target.checked) {
                    container.classList.add('active');
                    inputs.style.display = 'flex';
                } else {
                    container.classList.remove('active');
                    inputs.style.display = 'none';
                }
            });
        });
    }

    // Cargar lista de servicios para el Select Múltiple
    async loadServicios() {
        try {
            const response = await ServiciosService.getAll();
            this.servicios = response.data || response || [];
            
            const select = document.getElementById('serviciosEstilista');
            select.innerHTML = this.servicios.map(s => 
                `<option value="${s.idServicio}">${s.nombre || s.nombreServicio}</option>`
            ).join('');
        } catch (error) {
            console.error("Error cargando servicios:", error);
        }
    }

    // Cargar Tabla de Estilistas
    async loadEstilistas() {
        this.showLoader();
        try {
            const response = await EstilistasService.getAll();
            this.estilistas = response.data || response || [];
            this.renderTable();
        } catch (error) {
            console.error('Error al cargar estilistas:', error);
        } finally {
            this.hideLoader();
        }
    }

    // Renderizar Tabla
    renderTable() {
        const tbody = document.getElementById('estilistasTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;
        
        if (this.estilistas.length === 0) {
            tbody.innerHTML = '';
            if(emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if(emptyState) emptyState.style.display = 'none';
        
        tbody.innerHTML = this.estilistas.map(e => `
            <tr>
                <td>
                    <div class="estilista-avatar" style="background:#3498db; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; width:40px; height:40px; border-radius:50%;">
                        ${e.nombre ? e.nombre.charAt(0).toUpperCase() : '?'}
                    </div>
                </td>
                <td><strong>${e.nombre}</strong></td>
                <td>${e.puesto || 'Estilista'}</td>
                <td>${e.telefono}</td>
                <td>${e.email}</td>
                <td>
                    <button class="btn-icon delete" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="estilistasAdmin.deleteEstilista(${e.idEstilista || e.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ✅ VERIFICAR USUARIO (USANDO EL NUEVO SERVICIO)
    async verificarUsuario() {
        const telefono = document.getElementById('telefonoEstilista').value.trim();
        const msg = document.getElementById('msgUsuarioEncontrado');
        const btnGuardar = document.getElementById('btnGuardarEstilista');
        
        // Referencias a los campos que vamos a llenar
        const inputs = {
            nombre: document.getElementById('nombreEstilista'),
            email: document.getElementById('emailEstilista'),
            id: document.getElementById('usuarioId')
        };

        // Limpiar estado previo
        msg.style.display = 'none';
        msg.textContent = '';
        inputs.nombre.value = '';
        inputs.email.value = '';
        inputs.id.value = '';
        btnGuardar.disabled = true;

        // Validación simple
        if (!telefono) {
            alert("Por favor ingresa un número de teléfono para buscar.");
            return;
        }

        this.showLoader();
        try {
            // ✅ LLAMADA AL NUEVO SERVICIO
            console.log("Buscando usuario por teléfono:", telefono);
            const response = await UsuariosService.getByTelefono(telefono);
            
            // Extraemos los datos (la API devuelve {status, data: {...}})
            const usuario = response.data || response;

            if (usuario && (usuario.idUsuario || usuario.id)) {
                // Llenamos los campos
                inputs.id.value = usuario.idUsuario || usuario.id;
                inputs.nombre.value = usuario.nombre;
                inputs.email.value = usuario.email;
                
                // Mostramos éxito
                msg.textContent = `✅ Usuario encontrado: ${usuario.nombre}`;
                msg.style.color = "#27ae60"; // Verde
                msg.style.display = "block";
                btnGuardar.disabled = false; // Habilitar guardado
            } else {
                throw new Error("Datos vacíos");
            }

        } catch (error) {
            console.warn("Error en búsqueda:", error);
            
            let textoError = "❌ Usuario no encontrado.";
            if (error.response && error.response.status === 404) {
                textoError = "❌ El usuario no está registrado. Debe crear una cuenta primero.";
            }
            
            msg.textContent = textoError;
            msg.style.color = "#e74c3c"; // Rojo
            msg.style.display = "block";
            btnGuardar.disabled = true;
        } finally {
            this.hideLoader();
        }
    }

    // ✅ GUARDAR ESTILISTA
   // ✅ FUNCIÓN PRINCIPAL: GUARDAR ESTILISTA (CORREGIDA)
    async saveEstilista() {
        const usuarioId = document.getElementById('usuarioId').value;
        
        if (!usuarioId) {
            alert("Error: No se ha seleccionado un usuario válido. Verifica el teléfono primero.");
            return;
        }

        // Recoger datos de los inputs (que ya se llenaron automáticamente)
        const nombre = document.getElementById('nombreEstilista').value;
        const email = document.getElementById('emailEstilista').value;
        const telefono = document.getElementById('telefonoEstilista').value;
        const puesto = document.getElementById('especialidadesEstilista').value;
        const foto = document.getElementById('avatarEstilista').value;

        this.showLoader();

        try {
            // 1. Actualizar Rol del Usuario (a Estilista = 2)
            await UsuariosService.update({
                idUsuario: usuarioId,
                nombre: nombre,
                email: email,
                telefono: telefono,
                idRol: 2, // Rol Estilista
                activo: true
            });

            // 2. Crear registro en tabla Empleado
            // ✅ CORRECCIÓN: Agregamos 'email' que faltaba y causaba el error
            const empleadoData = {
                idUsuario: usuarioId,
                nombre: nombre,
                email: email,      // <--- ¡ESTE CAMPO FALTABA!
                telefono: telefono,
                puesto: puesto,
                imagenPerfil: foto
            };

            console.log("Enviando datos de empleado:", empleadoData);

            const empleadoResponse = await EstilistasService.create(empleadoData);
            
            // Recuperar el ID del nuevo empleado
            const dataRes = empleadoResponse.data || empleadoResponse;
            const idEstilista = dataRes.idEmpleado || dataRes.idEstilista || usuarioId; 

            // 3. Asignar Servicios Seleccionados
            const serviciosSelect = document.getElementById('serviciosEstilista');
            const selectedServices = Array.from(serviciosSelect.selectedOptions).map(opt => opt.value);
            
            if (selectedServices.length > 0) {
                const serviciosPromesas = selectedServices.map(idServicio => 
                    EstilistasService.createServicio({
                        idEstilista: idEstilista,
                        idServicio: parseInt(idServicio)
                    })
                );
                await Promise.all(serviciosPromesas);
            }

            // 4. Asignar Horarios Seleccionados
            const horariosPromesas = [];
            document.querySelectorAll('.day-schedule.active').forEach(day => {
                const dia = day.getAttribute('data-day');
                const diaFormat = dia.charAt(0).toUpperCase() + dia.slice(1); // Capitalizar (lunes -> Lunes)
                
                const inicio = day.querySelector('.hora-inicio').value;
                const fin = day.querySelector('.hora-fin').value;
                
                horariosPromesas.push(EstilistasService.createHorario({
                    idEstilista: idEstilista,
                    diaSemana: diaFormat,
                    horaInicio: inicio + ":00",
                    horaFin: fin + ":00"
                }));
            });
            await Promise.all(horariosPromesas);

            this.showNotification('¡Estilista agregado exitosamente!', 'success');
            this.closeModal();
            this.loadEstilistas();

        } catch (error) {
            console.error("Error al guardar:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Revisa la consola';
            this.showNotification('Error al guardar: ' + errorMsg, 'error');
        } finally {
            this.hideLoader();
        }
    }
    // Eliminar
    async deleteEstilista(id) {
        if(!confirm("¿Eliminar estilista?")) return;
        this.showLoader();
        try {
            await EstilistasService.delete(id);
            this.showNotification('Estilista eliminado', 'success');
            this.loadEstilistas();
        } catch(e) {
            this.showNotification('Error al eliminar', 'error');
        } finally {
            this.hideLoader();
        }
    }

    // Helpers
    openModal() {
        document.getElementById('modalEstilista').classList.add('active');
        document.getElementById('formEstilista').reset();
        document.getElementById('btnGuardarEstilista').disabled = true;
        document.getElementById('msgUsuarioEncontrado').style.display = 'none';
        // Limpiar horarios visualmente
        document.querySelectorAll('.day-schedule').forEach(d => {
            d.classList.remove('active');
            d.querySelector('.time-inputs').style.display = 'none';
        });
    }
    
    closeModal() {
        document.getElementById('modalEstilista').classList.remove('active');
    }
    
    showLoader() { document.getElementById('loader').style.display = 'flex'; }
    hideLoader() { document.getElementById('loader').style.display = 'none'; }
    
    showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.style.cssText = `position:fixed; top:20px; right:20px; padding:15px; background:${type==='success'?'#2ecc71':'#e74c3c'}; color:white; border-radius:5px; z-index:10000;`;
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
}

let estilistasAdmin;
document.addEventListener('DOMContentLoaded', () => {
    estilistasAdmin = new EstilistasAdmin();
});

function closeModal() {
    estilistasAdmin.closeModal();
}