let prestamosOriginales = [];
let prestamosFiltrados = [];

let alumnos = [];
let libros = [];

let pagina = 1;

const registrosPorPagina = 10;


// =====================================================
// INICIO
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    cargarDatos();

    document
        .getElementById("btn_buscar")
        .addEventListener("click", aplicarFiltros);

    document
        .getElementById("btn_limpiar")
        .addEventListener("click", limpiarFiltros);

    document
        .getElementById("buscar_prestamo")
        .addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                aplicarFiltros();

            }

        });


    document
        .getElementById("btnAnterior")
        .addEventListener("click", function () {

            if (pagina > 1) {

                pagina--;

                renderizarTabla(prestamosFiltrados);

            }

        });


    document
        .getElementById("btnSiguiente")
        .addEventListener("click", function () {

            const totalPaginas = Math.ceil(
                prestamosFiltrados.length /
                registrosPorPagina
            );

            if (pagina < totalPaginas) {

                pagina++;

                renderizarTabla(prestamosFiltrados);

            }

        });


    document
        .getElementById("filtro_estado")
        .addEventListener("change", aplicarFiltros);


    document
        .getElementById("btn_nuevo_prestamo")
        .addEventListener("click", prepararNuevoPrestamo);


    document
        .getElementById("form_nuevo_prestamo")
        .addEventListener("submit", registrarPrestamo);


    document
        .getElementById("btn_confirmar_devolucion")
        .addEventListener(
            "click",
            confirmarDevolucion
        );

});


// =====================================================
// CARGAR DATOS
// =====================================================

async function cargarDatos() {

    mostrarCargando();

    try {

        await Promise.all([
            cargarPrestamos(),
            cargarAlumnos(),
            cargarLibros()
        ]);

        prestamosFiltrados = [...prestamosOriginales];

        actualizarTotal();

        renderizarTabla(prestamosFiltrados);

    } catch (error) {

        console.error(
            "Error al cargar datos:",
            error
        );

        mostrarError(error.message);

    }

}


// =====================================================
// CARGAR PRÉSTAMOS
// =====================================================

async function cargarPrestamos() {

    const respuesta = await fetch(
        "http://localhost:3000/api/prestamos"
    );

    const resultado = await respuesta.json();

    if (
        !respuesta.ok ||
        !resultado.success
    ) {

        throw new Error(
            resultado.mensaje ||
            "No fue posible obtener los préstamos"
        );

    }

    prestamosOriginales =
        resultado.data || [];

}


// =====================================================
// CARGAR ALUMNOS
// =====================================================

async function cargarAlumnos() {

    const respuesta = await fetch(
        "http://localhost:3000/api/alumnos/"
    );

    const resultado = await respuesta.json();

    if (
        !respuesta.ok ||
        !resultado.success
    ) {

        throw new Error(
            resultado.mensaje ||
            "No fue posible obtener los alumnos"
        );

    }

    alumnos =
        resultado.data || [];

}


// =====================================================
// CARGAR LIBROS
// =====================================================

async function cargarLibros() {

    const respuesta = await fetch(
        "http://localhost:3000/api/libros"
    );

    const resultado = await respuesta.json();

    if (
        !respuesta.ok ||
        !resultado.success
    ) {

        throw new Error(
            resultado.mensaje ||
            "No fue posible obtener los libros"
        );

    }

    libros =
        resultado.data || [];

}


// =====================================================
// RENDERIZAR TABLA
// =====================================================

function renderizarTabla(prestamos) {

    const tabla =
        document.getElementById(
            "tabla_prestamos"
        );

    tabla.innerHTML = "";

    ocultarCargando();


    if (prestamos.length === 0) {

        document
            .getElementById("estado_vacio")
            .classList.remove("d-none");

        document
            .getElementById("info_paginacion")
            .textContent =
            "Mostrando 0 préstamos";

        document
            .getElementById("paginaActual")
            .textContent = "1";

        document
            .getElementById("btnAnterior")
            .disabled = true;

        document
            .getElementById("btnSiguiente")
            .disabled = true;

        return;

    }


    document
        .getElementById("estado_vacio")
        .classList.add("d-none");


    const inicio =
        (pagina - 1) *
        registrosPorPagina;

    const fin =
        inicio +
        registrosPorPagina;


    const prestamosPagina =
        prestamos.slice(
            inicio,
            fin
        );


    prestamosPagina.forEach(
        prestamo => {

            const tr =
                document.createElement("tr");


            const estadoBadge =
                obtenerBadgeEstado(
                    prestamo.Estado
                );


            const puedeDevolver =
                prestamo.Estado === "PRESTADO" ||
                prestamo.Estado === "VENCIDO";


            tr.innerHTML = `

                <td class="pl-4 font-weight-bold text-muted">

                    #${String(
                        prestamo.Id_Prestamo
                    ).padStart(2, "0")}

                </td>


                <td>

                    <div class="font-weight-bold">

                        ${escapeHtml(
                            prestamo.Alumno
                        )}

                    </div>

                    <small class="text-muted">

                        ${escapeHtml(
                            prestamo.Numero_Control
                        )}

                    </small>

                </td>


                <td>

                    <div class="font-weight-bold">

                        ${escapeHtml(
                            prestamo.Titulo
                        )}

                    </div>

                    <small class="text-muted">

                        ${escapeHtml(
                            prestamo.Autor || "—"
                        )}

                    </small>

                </td>


                <td>

                    ${formatearFecha(
                        prestamo.Fecha_Prestamo
                    )}

                </td>


                <td>

                    ${formatearFecha(
                        prestamo.Fecha_Vencimiento
                    )}

                </td>


                <td>

                    ${estadoBadge}

                </td>


                <td class="text-center pr-4">

                    <div class="dropdown">

                        <button
                            class="btn btn-link text-muted p-0 border-0"
                            type="button"
                            data-toggle="dropdown">

                            <i class="fa-solid fa-ellipsis-vertical fa-lg"></i>

                        </button>


                        <div class="dropdown-menu dropdown-menu-right shadow-sm">

                            <button
                                class="dropdown-item"
                                type="button"
                                onclick="verPrestamo(${prestamo.Id_Prestamo})">

                                <i class="fa-regular fa-eye mr-2 text-primary"></i>

                                Ver detalles

                            </button>


                            ${
                                puedeDevolver
                                ?

                                `

                                <button
                                    class="dropdown-item"
                                    type="button"
                                    onclick="abrirDevolucion(${prestamo.Id_Prestamo})">

                                    <i class="fa-solid fa-rotate-left mr-2 text-success"></i>

                                    Registrar devolución

                                </button>

                                `

                                :

                                ""
                            }

                        </div>

                    </div>

                </td>

            `;

            tabla.appendChild(tr);

        }
    );


    const total =
        prestamos.length;

    const mostrandoDesde =
        inicio + 1;

    const mostrandoHasta =
        Math.min(
            fin,
            total
        );


    document
        .getElementById(
            "info_paginacion"
        )
        .textContent =
        `Mostrando ${mostrandoDesde} a ${mostrandoHasta} de ${total} préstamos`;


    const totalPaginas =
        Math.ceil(
            total /
            registrosPorPagina
        );


    document
        .getElementById(
            "paginaActual"
        )
        .textContent =
        pagina;


    document
        .getElementById(
            "btnAnterior"
        )
        .disabled =
        pagina <= 1;


    document
        .getElementById(
            "btnSiguiente"
        )
        .disabled =
        pagina >= totalPaginas;

}


// =====================================================
// ESTADO
// =====================================================

function obtenerBadgeEstado(estado) {

    switch (estado) {

        case "PRESTADO":

            return `
                <span class="badge badge-primary px-2 py-1">
                    <i class="fa-solid fa-book mr-1"></i>
                    Prestado
                </span>
            `;


        case "VENCIDO":

            return `
                <span class="badge badge-danger px-2 py-1">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i>
                    Vencido
                </span>
            `;


        case "DEVUELTO":

            return `
                <span class="badge badge-success px-2 py-1">
                    <i class="fa-solid fa-circle-check mr-1"></i>
                    Devuelto
                </span>
            `;


        default:

            return `
                <span class="badge badge-secondary">
                    ${escapeHtml(estado || "Desconocido")}
                </span>
            `;

    }

}


// =====================================================
// FILTROS
// =====================================================

function aplicarFiltros() {

    const texto =
        document
            .getElementById(
                "buscar_prestamo"
            )
            .value
            .trim()
            .toLowerCase();


    const estado =
        document
            .getElementById(
                "filtro_estado"
            )
            .value;


    prestamosFiltrados =
        prestamosOriginales.filter(
            prestamo => {

                const coincideTexto =
                    !texto ||

                    (
                        prestamo.Alumno &&
                        prestamo.Alumno
                            .toLowerCase()
                            .includes(texto)
                    ) ||

                    (
                        prestamo.Numero_Control &&
                        String(
                            prestamo.Numero_Control
                        )
                        .toLowerCase()
                        .includes(texto)
                    ) ||

                    (
                        prestamo.Titulo &&
                        prestamo.Titulo
                            .toLowerCase()
                            .includes(texto)
                    );


                const coincideEstado =
                    !estado ||
                    prestamo.Estado === estado;


                return (
                    coincideTexto &&
                    coincideEstado
                );

            }
        );


    pagina = 1;

    actualizarTotalFiltrados();

    renderizarTabla(
        prestamosFiltrados
    );

}


// =====================================================
// LIMPIAR
// =====================================================

function limpiarFiltros() {

    document
        .getElementById(
            "buscar_prestamo"
        )
        .value = "";


    document
        .getElementById(
            "filtro_estado"
        )
        .value = "";


    prestamosFiltrados =
        [...prestamosOriginales];


    pagina = 1;

    actualizarTotal();

    renderizarTabla(
        prestamosFiltrados
    );

}


// =====================================================
// TOTAL
// =====================================================

function actualizarTotal() {

    document
        .getElementById(
            "total_prestamos"
        )
        .textContent =
        `Total registrados: ${prestamosOriginales.length}`;

}


function actualizarTotalFiltrados() {

    document
        .getElementById(
            "total_prestamos"
        )
        .textContent =
        `Resultados: ${prestamosFiltrados.length}`;

}


// =====================================================
// NUEVO PRÉSTAMO
// =====================================================

function prepararNuevoPrestamo() {

    modal_manager
        .limpiar_formulario(
            "form_nuevo_prestamo"
        );


    poblarSelectAlumnos();

    poblarSelectLibros();


    const ahora =
        obtenerFechaHoraActual();


    modal_manager.establecer_valor(
        "nuevo_fecha_prestamo",
        ahora
    );


    const vencimiento =
        new Date();

    vencimiento.setDate(
        vencimiento.getDate() + 7
    );


    modal_manager.establecer_valor(
        "nuevo_fecha_vencimiento",
        formatearFechaInput(
            vencimiento
        )
    );


    modal_manager.abrir(
        "modal_nuevo_prestamo"
    );

}


// =====================================================
// SELECT ALUMNOS
// =====================================================

function poblarSelectAlumnos() {

    const select =
        document.getElementById(
            "nuevo_id_alumno"
        );


    select.innerHTML = `
        <option value="">
            Selecciona un alumno
        </option>
    `;


    alumnos
        .filter(
            alumno =>
                alumno.Activo === 1 ||
                alumno.Activo === true
        )
        .forEach(
            alumno => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    alumno.Id_Alumno;


                option.textContent =
                    `${alumno.Numero_Control} - ${alumno.Nombre}`;


                select.appendChild(
                    option
                );

            }
        );

}


// =====================================================
// SELECT LIBROS
// =====================================================

function poblarSelectLibros() {

    const select =
        document.getElementById(
            "nuevo_id_libro"
        );


    select.innerHTML = `
        <option value="">
            Selecciona un libro
        </option>
    `;


    libros
        .filter(
            libro =>
                (
                    libro.Activo === 1 ||
                    libro.Activo === true
                ) &&
                (
                    libro.Disponible === 1 ||
                    libro.Disponible === true
                )
        )
        .forEach(
            libro => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    libro.Id_Libro;


                option.textContent =
                    `${libro.Titulo} — ${libro.Autor || "Autor desconocido"}`;


                select.appendChild(
                    option
                );

            }
        );

}


// =====================================================
// REGISTRAR PRÉSTAMO
// =====================================================

async function registrarPrestamo(event) {

    event.preventDefault();


    const idAlumno =
        modal_manager.obtener_valor(
            "nuevo_id_alumno"
        );


    const idLibro =
        modal_manager.obtener_valor(
            "nuevo_id_libro"
        );


    const fechaPrestamo =
        modal_manager.obtener_valor(
            "nuevo_fecha_prestamo"
        );


    const fechaVencimiento =
        modal_manager.obtener_valor(
            "nuevo_fecha_vencimiento"
        );


    if (!idAlumno) {

        alert(
            "Debes seleccionar un alumno"
        );

        return;

    }


    if (!idLibro) {

        alert(
            "Debes seleccionar un libro"
        );

        return;

    }


    if (!fechaPrestamo) {

        alert(
            "La fecha de préstamo es obligatoria"
        );

        return;

    }


    if (!fechaVencimiento) {

        alert(
            "La fecha de vencimiento es obligatoria"
        );

        return;

    }


    if (
        new Date(fechaVencimiento) <=
        new Date(fechaPrestamo)
    ) {

        alert(
            "La fecha de vencimiento debe ser posterior a la fecha de préstamo"
        );

        return;

    }


    const datos = {

        Id_Alumno:
            Number(idAlumno),

        Id_Libro:
            Number(idLibro),

        Fecha_Prestamo:
            fechaPrestamo,

        Fecha_Vencimiento:
            fechaVencimiento,

        Id_Usuario:
            1

    };


    try {

        modal_manager.bloquear_boton(
            "btn_guardar_nuevo",
            "Registrando..."
        );


        const respuesta =
            await fetch(
                "http://localhost:3000/api/prestamos",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datos)

                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.success
        ) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible registrar el préstamo"
            );

        }


        modal_manager.cerrar(
            "modal_nuevo_prestamo"
        );


        alert(
            "Préstamo registrado correctamente"
        );


        await recargarDatos();


    } catch (error) {

        console.error(
            "Error al registrar préstamo:",
            error
        );

        alert(
            error.message
        );

    } finally {

        modal_manager.desbloquear_boton(
            "btn_guardar_nuevo"
        );

    }

}


// =====================================================
// ABRIR DEVOLUCIÓN
// =====================================================

window.abrirDevolucion =
    function (idPrestamo) {

        const prestamo =
            prestamosOriginales.find(
                p =>
                    p.Id_Prestamo ===
                    idPrestamo
            );


        if (!prestamo) {

            alert(
                "No fue posible encontrar el préstamo"
            );

            return;

        }


        modal_manager.establecer_valor(
            "devolver_id_prestamo",
            prestamo.Id_Prestamo
        );


        document
            .getElementById(
                "devolver_alumno"
            )
            .textContent =
            `${prestamo.Alumno} (${prestamo.Numero_Control})`;


        document
            .getElementById(
                "devolver_libro"
            )
            .textContent =
            prestamo.Titulo;


        modal_manager.abrir(
            "modal_devolver_prestamo"
        );

    };


// =====================================================
// CONFIRMAR DEVOLUCIÓN
// =====================================================

async function confirmarDevolucion() {

    const idPrestamo =
        modal_manager.obtener_valor(
            "devolver_id_prestamo"
        );


    if (!idPrestamo) {

        return;

    }


    try {

        modal_manager.bloquear_boton(
            "btn_confirmar_devolucion",
            "Procesando..."
        );


        const respuesta =
            await fetch(
                `http://localhost:3000/api/prestamos/${idPrestamo}/devolver`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }

                }
            );


        const resultado =
            await respuesta.json();


        if (
            !respuesta.ok ||
            !resultado.success
        ) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible registrar la devolución"
            );

        }


        modal_manager.cerrar(
            "modal_devolver_prestamo"
        );


        alert(
            "Devolución registrada correctamente"
        );


        await recargarDatos();


    } catch (error) {

        console.error(
            "Error al registrar devolución:",
            error
        );

        alert(
            error.message
        );

    } finally {

        modal_manager.desbloquear_boton(
            "btn_confirmar_devolucion"
        );

    }

}


// =====================================================
// VER DETALLES
// =====================================================

window.verPrestamo =
    async function (idPrestamo) {

        try {

            const respuesta =
                await fetch(
                    `http://localhost:3000/api/prestamos/${idPrestamo}`
                );


            const resultado =
                await respuesta.json();


            if (
                !respuesta.ok ||
                !resultado.success
            ) {

                throw new Error(
                    resultado.mensaje ||
                    "No fue posible obtener el préstamo"
                );

            }


            const prestamo =
                resultado.data;


            alert(
                `Préstamo #${prestamo.Id_Prestamo}

Alumno:
${prestamo.Alumno}

Número de control:
${prestamo.Numero_Control}

Libro:
${prestamo.Titulo}

Autor:
${prestamo.Autor || "—"}

Fecha de préstamo:
${formatearFecha(prestamo.Fecha_Prestamo)}

Fecha de vencimiento:
${formatearFecha(prestamo.Fecha_Vencimiento)}

Fecha de devolución:
${prestamo.Fecha_Devolucion
    ? formatearFecha(prestamo.Fecha_Devolucion)
    : "Pendiente"
}

Estado:
${prestamo.Estado}`
            );

        } catch (error) {

            console.error(
                "Error al obtener préstamo:",
                error
            );

            alert(
                error.message
            );

        }

    };


// =====================================================
// RECARGAR DATOS
// =====================================================

async function recargarDatos() {

    await cargarPrestamos();

    prestamosFiltrados =
        [...prestamosOriginales];

    pagina = 1;

    actualizarTotal();

    renderizarTabla(
        prestamosFiltrados
    );

}


// =====================================================
// FECHAS
// =====================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "—";
    }


    const fechaObj =
        new Date(fecha);


    if (isNaN(fechaObj)) {
        return fecha;
    }


    return fechaObj.toLocaleString(
        "es-MX",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


function obtenerFechaHoraActual() {

    const fecha =
        new Date();


    return formatearFechaInput(
        fecha
    );

}


function formatearFechaInput(fecha) {

    const year =
        fecha.getFullYear();


    const month =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            fecha.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            fecha.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            fecha.getMinutes()
        ).padStart(2, "0");


    return `${year}-${month}-${day}T${hours}:${minutes}`;

}


// =====================================================
// ESTADOS VISUALES
// =====================================================

function mostrarCargando() {

    document
        .getElementById(
            "estado_cargando"
        )
        .classList.remove(
            "d-none"
        );

}


function ocultarCargando() {

    document
        .getElementById(
            "estado_cargando"
        )
        .classList.add(
            "d-none"
        );

}


function mostrarError(mensaje) {

    ocultarCargando();


    const estado =
        document.getElementById(
            "estado_vacio"
        );


    estado.classList.remove(
        "d-none"
    );


    estado.innerHTML = `

        <div class="mb-3">

            <i class="fa-solid fa-triangle-exclamation fa-3x text-danger"></i>

        </div>

        <h6 class="font-weight-bold text-dark">

            Error al cargar préstamos

        </h6>

        <p class="text-muted small mb-0">

            ${escapeHtml(mensaje)}

        </p>

    `;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(valor) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        valor ?? "";

    return div.innerHTML;

}