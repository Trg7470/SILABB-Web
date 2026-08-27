// =====================================================
// ADMINISTRADOR DE MODALES
// =====================================================
window.modal_manager = {
    abrir(modal_id) {
        $(`#${modal_id}`).modal('show');
    },
    cerrar(modal_id) {
        $(`#${modal_id}`).modal('hide');
    },
    limpiar_formulario(form_id) {
        const formulario = document.getElementById(form_id);
        if (formulario) {
            formulario.reset();
        }
    },
    abrir_con_formulario(modal_id, form_id) {
        this.limpiar_formulario(form_id);
        this.abrir(modal_id);
    },
    establecer_valor(elemento_id, valor) {
        const elemento = document.getElementById(elemento_id);
        if (elemento) {
            elemento.value = valor ?? '';
        }
    },
    obtener_valor(elemento_id) {
        const elemento = document.getElementById(elemento_id);
        return elemento ? elemento.value.trim() : '';
    },
    obtener_checkbox(elemento_id) {
        const elemento = document.getElementById(elemento_id);
        return elemento ? elemento.checked : false;
    },
    establecer_checkbox(elemento_id, valor) {
        const elemento = document.getElementById(elemento_id);
        if (elemento) {
            elemento.checked = Boolean(valor);
        }
    },
    bloquear_boton(btn_id, texto = 'Guardando...') {
        const boton = document.getElementById(btn_id);
        if (!boton) return;
        boton.disabled = true;
        boton.dataset.texto_original = boton.innerHTML;
        boton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>
            ${texto}
        `;
    },
    desbloquear_boton(btn_id) {
        const boton = document.getElementById(btn_id);
        if (!boton) return;
        boton.disabled = false;
        if (boton.dataset.texto_original) {
            boton.innerHTML = boton.dataset.texto_original;
        }
    }
};