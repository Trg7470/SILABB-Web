// popup.js
const modalPopup = new bootstrap.Modal(
    document.getElementById("modalPopup")
);
const ICONOS = {
    carga: `
        <div class="spinner-border text-primary"
            style="width: 4rem; height: 4rem;"
            role="status">
        </div>
    `,
    exito: `
        <i class="bi bi-check-circle-fill text-success"
            style="font-size: 70px;">
        </i>
    `,
    error: `
        <i class="bi bi-x-circle-fill text-danger"
            style="font-size: 70px;">
        </i>
    `,
    advertencia: `
        <i class="bi bi-exclamation-triangle-fill text-warning"
            style="font-size: 70px;">
        </i>
    `,
    informacion: `
        <i class="bi bi-info-circle-fill text-info"
            style="font-size: 70px;">
        </i>
    `
};
/**
 * Mostrar popup
 * 
 * @param {Object} opciones
 * @param {String} opciones.titulo
 * @param {String} opciones.mensaje
 * @param {String} opciones.tipo
 * @param {Boolean} opciones.boton
 */
function mostrarPopup({
    titulo = "Procesando...",
    mensaje = "Espere un momento...",
    tipo = "carga",
    boton = false,
    redireccion = null
} = {}) {
    document.getElementById("modal-titulo").textContent = titulo;
    document.getElementById("modal-mensaje").textContent = mensaje;
    const icono = document.getElementById("modal-icono");
    icono.innerHTML = ICONOS[tipo] || ICONOS.carga;
    const btn = document.getElementById("modal-boton");
    if (boton) {
        btn.classList.remove("d-none");
        btn.onclick = () => {
            if (redireccion) {
                window.location.href = redireccion;
            } else {
                modalPopup.hide();
            }
        };
    } else {
        btn.classList.add("d-none");
    }
    modalPopup.show();
}
/**
 * Cerrar popup
 */
function cerrarPopup(){
    modalPopup.hide();
}   