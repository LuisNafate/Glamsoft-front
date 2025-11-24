// Admin: Gestión de Preguntas por Servicio (sin entidad formulario)
class PreguntasPorServicioAdmin {
  constructor() {
    this.servicios = [];
    this.servicioSeleccionado = null;
    this.preguntas = [];
    this.editingPregunta = null;
    this.init();
  }

  async init() {
    try {
      this.cacheDom();
      this.bindEvents();
      await this.loadServicios();
      this.setUIState();
    } catch (err) {
      console.error(err);
      this.notify('Error al inicializar', 'error');
    }
  }
async checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user_data') || 'null');
            
            // 🔒 SEGURIDAD: Solo Rol 1 (Admin) puede estar aquí
            if (!user || user.idRol !== 1) {
                console.warn("Acceso denegado: No eres Administrador.");
                window.location.href = '../inicio.html';
                return; // Detener ejecución
            }

            // Actualizar interfaz con datos del usuario
            const nombreReal = user.nombre || 'Administrador';
            
            const headerName = document.getElementById('userName');
            if (headerName) headerName.textContent = nombreReal;
            
            const menuName = document.getElementById('menuUserName');
            if (menuName) menuName.textContent = nombreReal;

        } catch (error) {
            console.error("Error de sesión:", error);
            window.location.href = '../login.html';
        }
    }
  cacheDom() {
    this.$servicesList = document.getElementById('servicesList');
    this.$searchServicios = document.getElementById('searchServicios');

    this.$questionsHeader = document.getElementById('questionsHeader');
    this.$questionsList = document.getElementById('questionsList');
    this.$emptyQuestions = document.getElementById('emptyQuestions');

    this.$btnAddQuestion = document.getElementById('btnAddQuestion');

    this.$modalPregunta = document.getElementById('modalPregunta');
    this.$btnGuardarPregunta = document.getElementById('btnGuardarPregunta');
  }

  bindEvents() {
    this.$searchServicios?.addEventListener('input', () => this.renderServicios());
    this.$btnAddQuestion?.addEventListener('click', () => this.showPreguntaModal());
    this.$btnGuardarPregunta?.addEventListener('click', () => this.guardarPregunta());
  }

  setUIState() {
    const hasService = !!this.servicioSeleccionado;
    if (!hasService) {
      this.$questionsHeader.textContent = 'Selecciona un servicio para gestionar sus preguntas.';
    }
    if (this.$btnAddQuestion) this.$btnAddQuestion.disabled = !hasService;
  }

  async loadServicios() {
    this.showLoader();
    try {
      const resp = await ServiciosService.getAll();
      const list = resp.data || resp || [];
      this.servicios = list.filter(s => s.activo !== false);
      this.renderServicios();
    } catch (e) {
      console.error(e);
      this.notify('Error al cargar servicios', 'error');
    } finally { this.hideLoader(); }
  }

  getServiciosFiltrados() {
    const q = (this.$searchServicios?.value || '').toLowerCase();
    if (!q) return this.servicios;
    return this.servicios.filter(s =>
      (s.nombre || '').toLowerCase().includes(q) || (s.categoria || '').toLowerCase().includes(q)
    );
  }

  renderServicios() {
    const servicios = this.getServiciosFiltrados();
    this.$servicesList.innerHTML = servicios.map(s => `
      <div class="service-item ${this.servicioSeleccionado?.idServicio === s.idServicio ? 'active' : ''}" data-id="${s.idServicio}">
        <div class="name">${s.nombre}</div>
        <div class="category">${s.categoria || 'General'}</div>
      </div>
    `).join('');

    this.$servicesList.querySelectorAll('.service-item').forEach(el => {
      el.addEventListener('click', async () => {
        const id = parseInt(el.dataset.id);
        this.servicioSeleccionado = this.servicios.find(s => s.idServicio === id) || null;
        this.setUIState();
        await this.loadPreguntas();
      });
    });
  }

  async loadPreguntas() {
    this.preguntas = [];
    if (!this.servicioSeleccionado) { this.renderPreguntas(); return; }
    this.showLoader();
    try {
      const resp = await PreguntasService.getByServicio(this.servicioSeleccionado.idServicio);
      this.preguntas = resp?.data || resp || [];
      this.$questionsHeader.textContent = `Preguntas del servicio: ${this.servicioSeleccionado.nombre}`;
    } catch (e) {
      console.error(e);
      this.notify('Error al cargar preguntas del servicio', 'error');
    } finally {
      this.hideLoader();
      this.renderPreguntas();
    }
  }

  renderPreguntas() {
    if (!this.servicioSeleccionado) {
      this.$questionsList.innerHTML = '';
      this.$emptyQuestions.style.display = 'block';
      return;
    }

    if (!this.preguntas || this.preguntas.length === 0) {
      this.$questionsList.innerHTML = '';
      this.$emptyQuestions.style.display = 'block';
      return;
    }

    this.$emptyQuestions.style.display = 'none';
    const sorted = [...this.preguntas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    this.$questionsList.innerHTML = sorted.map((p, idx) => `
      <div class="question-item">
        <div class="small muted">#${p.orden ?? idx} • ${p.tipoRespuesta}</div>
        <div><strong>${p.pregunta || ''}</strong></div>
        ${p.opciones && p.opciones.length ? `<div class="small muted">Opciones: ${(Array.isArray(p.opciones) ? p.opciones : (p.opciones || '')).toString()}</div>` : ''}
        <div class="question-actions">
          <button class="btn btn-secondary" data-act="up" data-id="${p.idPregunta}"><i class="fas fa-arrow-up"></i></button>
          <button class="btn btn-secondary" data-act="down" data-id="${p.idPregunta}"><i class="fas fa-arrow-down"></i></button>
          <button class="btn btn-primary" data-act="edit" data-id="${p.idPregunta}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger" data-act="del" data-id="${p.idPregunta}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');

    this.$questionsList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleQuestionAction(e));
    });
  }

  handleQuestionAction(e) {
    const act = e.currentTarget.dataset.act;
    const id = parseInt(e.currentTarget.dataset.id);
    const idx = this.preguntas.findIndex(p => p.idPregunta === id);
    if (idx === -1) return;

    if (act === 'up') {
      this.moveQuestion(idx, -1);
    } else if (act === 'down') {
      this.moveQuestion(idx, +1);
    } else if (act === 'edit') {
      this.showPreguntaModal(this.preguntas[idx]);
    } else if (act === 'del') {
      this.eliminarPregunta(this.preguntas[idx]);
    }
  }

  async moveQuestion(idx, delta) {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= this.preguntas.length) return;

    // Intercambiar en memoria
    const a = this.preguntas[idx];
    const b = this.preguntas[newIdx];
    const ordenA = a.orden ?? idx;
    const ordenB = b.orden ?? newIdx;

    // Persistir nuevo orden en backend
    try {
      this.showLoader();
      await Promise.all([
        PreguntasService.update(a.idPregunta, {
          idServicio: this.servicioSeleccionado.idServicio,
          pregunta: a.pregunta,
          tipoRespuesta: a.tipoRespuesta,
          opciones: a.opciones || [],
          obligatoria: a.obligatoria !== false,
          orden: ordenB,
          activo: a.activo !== false
        }),
        PreguntasService.update(b.idPregunta, {
          idServicio: this.servicioSeleccionado.idServicio,
          pregunta: b.pregunta,
          tipoRespuesta: b.tipoRespuesta,
          opciones: b.opciones || [],
          obligatoria: b.obligatoria !== false,
          orden: ordenA,
          activo: b.activo !== false
        })
      ]);
      await this.loadPreguntas();
    } catch (e) {
      console.error(e);
      this.notify('No se pudo reordenar', 'error');
    } finally {
      this.hideLoader();
    }
  }

  showPreguntaModal(pregunta = null) {
    this.editingPregunta = pregunta;
    document.getElementById('preguntaModalTitle').textContent = pregunta ? 'Editar Pregunta' : 'Nueva Pregunta';
    document.getElementById('textoPregunta').value = pregunta?.pregunta || '';
    document.getElementById('tipoPregunta').value = pregunta?.tipoRespuesta || '';
    const opts = Array.isArray(pregunta?.opciones) ? pregunta.opciones.join('\n') : (pregunta?.opciones || '');
    document.getElementById('opcionesPregunta').value = opts;
    this.toggleOpciones();
    this.$modalPregunta.classList.add('active');

    document.getElementById('tipoPregunta').onchange = () => this.toggleOpciones();
  }

  toggleOpciones() {
    const tipo = (document.getElementById('tipoPregunta').value || '').toLowerCase();
    const show = ['opcion_multiple'].includes(tipo);
    document.getElementById('opcionesContainer').style.display = show ? 'block' : 'none';
  }

  async guardarPregunta() {
    if (!this.servicioSeleccionado) return;
    const preguntaTxt = document.getElementById('textoPregunta').value.trim();
    const tipoRespuesta = document.getElementById('tipoPregunta').value;
    const opcionesRaw = document.getElementById('opcionesPregunta').value.trim();
    const opciones = opcionesRaw ? opcionesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

    if (!preguntaTxt || !tipoRespuesta) { this.notify('Completa los campos requeridos', 'error'); return; }

    // Orden por defecto al final
    const orden = (this.preguntas?.length || 0);

    const payload = {
      idServicio: this.servicioSeleccionado.idServicio,
      pregunta: preguntaTxt,
      tipoRespuesta,
      opciones,
      obligatoria: true,
      orden,
      activo: true
    };

    this.showLoader();
    try {
      if (this.editingPregunta?.idPregunta) {
        await PreguntasService.update(this.editingPregunta.idPregunta, {
          ...payload,
          orden: this.editingPregunta.orden ?? orden
        });
        this.notify('Pregunta actualizada', 'success');
      } else {
        await PreguntasService.create(payload);
        this.notify('Pregunta creada', 'success');
      }
      this.$modalPregunta.classList.remove('active');
      await this.loadPreguntas();
    } catch (e) {
      console.error(e);
      this.notify('No se pudo guardar la pregunta', 'error');
    } finally { this.hideLoader(); }
  }

  async eliminarPregunta(p) {
    const confirmed = await customConfirm(
      '¿Eliminar esta pregunta?',
      'Eliminar Pregunta',
      { icon: 'ph-trash' }
    );

    if (!confirmed) return;

    this.showLoader();
    try {
      await PreguntasService.delete(p.idPregunta);
      await customAlert('Pregunta eliminada', 'Éxito', { type: 'success' });
      await this.loadPreguntas();
    } catch (e) {
      console.error(e);
      await customAlert('No se pudo eliminar', 'Error', { type: 'error' });
    } finally { this.hideLoader(); }
  }

  // Utilidades UI
  showLoader() { const l = document.getElementById('loader'); if (l) l.style.display = 'flex'; }
  hideLoader() { const l = document.getElementById('loader'); if (l) l.style.display = 'none'; }
  notify(msg, type='info') {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:20px;right:20px;padding:10px 14px;border-radius:8px;background:${type==='success'?'#27ae60':type==='error'?'#e74c3c':'#3498db'};color:#fff;z-index:9999;`;
    el.textContent = msg; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
  }
}

let formulariosAdmin;

document.addEventListener('DOMContentLoaded', () => {
  formulariosAdmin = new PreguntasPorServicioAdmin();
});
