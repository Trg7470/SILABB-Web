let alumnos_originales = [];
let alumnos_filtrados = [];

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    obtener_datos();

    const btn_limpiar = document.getElementById("btn_limpiar");

    if (btn_limpiar) {
        btn_limpiar.addEventListener("click", limpiar_filtros);
    }

    const buscar_nombre = document.getElementById("buscar_nombre");

    if (buscar_nombre) {
        buscar_nombre.addEventListener("input", aplicar_filtros);
    }

    const filtro_adscripcion = document.getElementById("filtro_adscripcion");

    if (filtro_adscripcion) {
        filtro_adscripcion.addEventListener("change", aplicar_filtros);
    }

    const filtro_adscripcion_2 = document.getElementById("filtro_adscripcion_2");

    if (filtro_adscripcion_2) {
        filtro_adscripcion_2.addEventListener("change", aplicar_filtros);
    }

    const filtro_carrera = document.getElementById("filtro_carrera");

    if (filtro_carrera) {
        filtro_carrera.addEventListener("change", aplicar_filtros);
    }

    inicializar_modal_registro();

});

// =====================================================
// MODAL REGISTRAR ALUMNO
// =====================================================

function inicializar_modal_registro() {

    const btn_nuevo_alumno = document.getElementById("btn_nuevo_alumno");
    const form_nuevo_alumno = document.getElementById("form_nuevo_alumno");
    const modal_registrar_alumno = document.getElementById("modal_registrar_alumno");

    if (btn_nuevo_alumno) {

        btn_nuevo_alumno.addEventListener("click", function () {

            modal_manager.abrir_con_formulario(
                "modal_registrar_alumno",
                "form_nuevo_alumno"
            );

            const nuevo_activo = document.getElementById("nuevo_activo");

            if (nuevo_activo) {
                nuevo_activo.checked = true;
            }

        });

    }

    if (form_nuevo_alumno) {
        form_nuevo_alumno.addEventListener("submit", registrar_alumno);
    }

    /*
     * Cierre manual del modal.
     *
     * Esto garantiza que la X y Cancelar funcionen
     * aunque algún script del tema interfiera con
     * data-dismiss.
     */

    if (modal_registrar_alumno) {

        const btn_cerrar_modal =
            modal_registrar_alumno.querySelector(".modal-header .close");

        const btn_cancelar =
            modal_registrar_alumno.querySelector(".modal-footer button[type='button']");

        if (btn_cerrar_modal) {

            btn_cerrar_modal.addEventListener("click", function (event) {

                event.preventDefault();

                modal_manager.cerrar_con_formulario(
                    "modal_registrar_alumno",
                    "form_nuevo_alumno"
                );

            });

        }

        if (btn_cancelar) {

            btn_cancelar.addEventListener("click", function (event) {

                event.preventDefault();

                modal_manager.cerrar_con_formulario(
                    "modal_registrar_alumno",
                    "form_nuevo_alumno"
                );

            });

        }

    }

}

// =====================================================
// OBTENER ALUMNOS
// =====================================================

async function obtener_datos() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/api/alumnos/contar"
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        const total =
            resultado.data?.Total ??
            resultado.data?.[0]?.Total ??
            0;

        const total_alumnos =
            document.getElementById("total_alumnos");

        if (total_alumnos) {
            total_alumnos.textContent =
                `Total registrados: ${total}`;
        }

    } catch (error) {

        console.error("Error al contar alumnos:", error);

        const total_alumnos =
            document.getElementById("total_alumnos");

        if (total_alumnos) {
            total_alumnos.textContent =
                "Total registrados: 0";
        }

    }

    try {

        const respuesta_l =
            await fetch("http://localhost:3000/api/alumnos/");

        if (!respuesta_l.ok) {
            throw new Error(`Error HTTP: ${respuesta_l.status}`);
        }

        const resultado_l =
            await respuesta_l.json();

        if (
            resultado_l.success &&
            Array.isArray(resultado_l.data)
        ) {

            alumnos_originales =
                resultado_l.data;

            alumnos_filtrados =
                [...alumnos_originales];

            poblar_selects_filtro(
                alumnos_originales
            );

            renderizar_tabla(
                alumnos_filtrados
            );

        }

    } catch (error) {

        console.error(
            "Error al obtener alumnos:",
            error
        );

        const tabla_alumnos =
            document.getElementById("tabla_alumnos");

        if (tabla_alumnos) {

            tabla_alumnos.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center text-danger py-4">

                        <i class="fa-solid fa-circle-exclamation mr-1"></i>

                        Error al cargar los alumnos

                    </td>
                </tr>
            `;

        }

    }

}

// =====================================================
// RENDERIZAR TABLA
// =====================================================

function renderizar_tabla(alumnos) {

    const tbody =
        document.getElementById("tabla_alumnos");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (alumnos.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-4">

                    <i class="fa-solid fa-info-circle mr-1"></i>

                    No se encontraron alumnos registrados.

                </td>
            </tr>
        `;

        actualizar_paginacion_info(0, 0);

        return;
    }

    alumnos.forEach((alumno) => {

        const tr =
            document.createElement("tr");

        const iniciales =
            alumno.Nombre
                ? alumno.Nombre
                    .split(" ")
                    .map(nombre => nombre[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "AL";

        const es_activo =
            alumno.Activo === 1 ||
            alumno.Activo === true;

        const estado_badge =
            es_activo
                ? '<span class="badge badge-success px-2 py-1">Activo</span>'
                : '<span class="badge badge-danger px-2 py-1">Inactivo</span>';

        tr.innerHTML = `

            <td class="pl-4 font-weight-bold text-muted">
                #${String(alumno.Id_Alumno).padStart(2, "0")}
            </td>

            <td>
                <span class="badge badge-light border">
                    ${alumno.Numero_Control}
                </span>
            </td>

            <td>

                <div class="d-flex align-items-center">

                    <div
                        class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-2 font-weight-bold"
                        style="width: 32px; height: 32px; font-size: 0.75rem;">

                        ${iniciales}

                    </div>

                    <span class="font-weight-bold">
                        ${alumno.Nombre}
                    </span>

                </div>

            </td>

            <td>
                Semestre ${alumno.Semestre}
            </td>

            <td>
                ${alumno.Carrera}
            </td>

            <td>
                ${estado_badge}
            </td>

            <td class="text-center pr-4">

                <div class="dropdown">

                    <button
                        class="btn btn-link text-muted p-0 border-0"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">

                        <i class="fa-solid fa-ellipsis-vertical fa-lg"></i>

                    </button>

                    <div class="dropdown-menu dropdown-menu-right shadow-sm">

                        <a
                            class="dropdown-item"
                            href="/pages/alumnos/informacion.html?numero_control=${alumno.Numero_Control}">

                            <i class="fa-regular fa-eye mr-2 text-primary"></i>

                            Ver detalles

                        </a>

                    </div>

                </div>

            </td>

        `;

        tbody.appendChild(tr);

    });

    actualizar_paginacion_info(
        alumnos.length,
        alumnos_originales.length
    );

}

// =====================================================
// FILTROS
// =====================================================

function poblar_selects_filtro(alumnos) {

    const select_semestre =
        document.getElementById("filtro_adscripcion");

    const select_carrera =
        document.getElementById("filtro_adscripcion_2");

    const select_estado =
        document.getElementById("filtro_carrera");

    if (
        !select_semestre ||
        !select_carrera ||
        !select_estado
    ) {
        return;
    }

    const semestres =
        [
            ...new Set(
                alumnos.map(alumno => alumno.Semestre)
            )
        ].sort((a, b) => a - b);

    const carreras =
        [
            ...new Set(
                alumnos.map(alumno => alumno.Carrera)
            )
        ].sort();

    select_semestre.innerHTML =
        '<option value="">Todos</option>';

    semestres.forEach(semestre => {

        select_semestre.innerHTML += `
            <option value="${semestre}">
                Semestre ${semestre}
            </option>
        `;

    });

    select_carrera.innerHTML =
        '<option value="">Todas</option>';

    carreras.forEach(carrera => {

        select_carrera.innerHTML += `
            <option value="${carrera}">
                ${carrera}
            </option>
        `;

    });

    select_estado.innerHTML = `

        <option value="">Todos</option>

        <option value="1">
            Activo
        </option>

        <option value="0">
            Inactivo
        </option>

    `;

}

function aplicar_filtros() {

    const texto =
        document
            .getElementById("buscar_nombre")
            .value
            .trim()
            .toLowerCase();

    const semestre_sel =
        document
            .getElementById("filtro_adscripcion")
            .value;

    const carrera_sel =
        document
            .getElementById("filtro_adscripcion_2")
            .value;

    const estado_sel =
        document
            .getElementById("filtro_carrera")
            .value;

    alumnos_filtrados =
        alumnos_originales.filter(alumno => {

            const nombre =
                alumno.Nombre
                    ? alumno.Nombre.toLowerCase()
                    : "";

            const numero_control =
                String(alumno.Numero_Control ?? "");

            const coincide_texto =
                !texto ||
                nombre.includes(texto) ||
                numero_control.includes(texto);

            const coincide_semestre =
                !semestre_sel ||
                String(alumno.Semestre) === semestre_sel;

            const coincide_carrera =
                !carrera_sel ||
                alumno.Carrera === carrera_sel;

            const coincide_estado =
                !estado_sel ||
                String(alumno.Activo) === estado_sel;

            return (
                coincide_texto &&
                coincide_semestre &&
                coincide_carrera &&
                coincide_estado
            );

        });

    renderizar_tabla(
        alumnos_filtrados
    );

}

// =====================================================
// LIMPIAR FILTROS
// =====================================================

function limpiar_filtros() {

    document.getElementById(
        "buscar_nombre"
    ).value = "";

    document.getElementById(
        "filtro_adscripcion"
    ).value = "";

    document.getElementById(
        "filtro_adscripcion_2"
    ).value = "";

    document.getElementById(
        "filtro_carrera"
    ).value = "";

    alumnos_filtrados =
        [...alumnos_originales];

    renderizar_tabla(
        alumnos_filtrados
    );

}

// =====================================================
// PAGINACIÓN
// =====================================================

function actualizar_paginacion_info(
    mostrando,
    total
) {

    const elem_info =
        document.getElementById(
            "info_paginacion"
        );

    if (elem_info) {

        elem_info.textContent =
            `Mostrando ${mostrando} de ${total} alumnos`;

    }

}

// =====================================================
// REGISTRAR ALUMNO
// =====================================================

async function registrar_alumno(event) {

    event.preventDefault();

    const nombre =
        modal_manager.obtener_valor("nombre");

    const apellido_paterno =
        modal_manager.obtener_valor(
            "apellido_paterno"
        );

    const apellido_materno =
        modal_manager.obtener_valor(
            "apellido_materno"
        );

    const numero_control =
        modal_manager.obtener_valor(
            "numero_control"
        );

    const semestre =
        Number(
            modal_manager.obtener_valor(
                "semestre"
            )
        );

    const carrera =
        modal_manager.obtener_valor(
            "carrera"
        );

    if (!nombre) {

        alert(
            "El nombre del alumno es obligatorio"
        );

        return;
    }

    if (!apellido_paterno) {

        alert(
            "El apellido paterno es obligatorio"
        );

        return;
    }

    if (!apellido_materno) {

        alert(
            "El apellido materno es obligatorio"
        );

        return;
    }

    if (!numero_control) {

        alert(
            "El número de control es obligatorio"
        );

        return;
    }

    if (!semestre) {

        alert(
            "El semestre es obligatorio"
        );

        return;
    }

    if (!carrera) {

        alert(
            "La carrera es obligatoria"
        );

        return;
    }

    const usuario =
        JSON.parse(
            sessionStorage.getItem("usuario")
        );

    if (!usuario || !usuario.Id_Usuario) {

        alert(
            "No se encontró la información del usuario."
        );

        return;
    }

    const id_usuario =
        usuario.Id_Usuario;

    const data = {

        Nombre: nombre,

        Apellido_Paterno:
            apellido_paterno,

        Apellido_Materno:
            apellido_materno,

        Numero_Control:
            numero_control,

        Semestre:
            semestre,

        Carrera:
            carrera,

        Id_Usuario:
            id_usuario

    };

    try {

        modal_manager.bloquear_boton(
            "btn_registrar_alumno",
            "Registrando..."
        );

        const respuesta =
            await fetch(
                "http://localhost:3000/api/alumnos/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
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
                "No fue posible registrar el alumno"
            );

        }

        modal_manager.cerrar_con_formulario(
            "modal_registrar_alumno",
            "form_nuevo_alumno"
        );

        const alumno_nuevo =
            resultado.data;

        if (alumno_nuevo) {

            alumnos_originales.push(
                alumno_nuevo
            );

            alumnos_originales.sort(
                (a, b) =>
                    a.Id_Alumno -
                    b.Id_Alumno
            );

            poblar_selects_filtro(
                alumnos_originales
            );

            aplicar_filtros();

        } else {

            await obtener_datos();

        }

        actualizar_total();

        alert(
            "Alumno registrado correctamente"
        );

    } catch (error) {

        console.error(
            "Error al registrar alumno:",
            error
        );

        alert(
            error.message
        );

    } finally {

        modal_manager.desbloquear_boton(
            "btn_registrar_alumno"
        );

    }

}

// =====================================================
// ACTUALIZAR TOTAL
// =====================================================

function actualizar_total() {

    const total_alumnos =
        document.getElementById(
            "total_alumnos"
        );

    if (total_alumnos) {

        total_alumnos.textContent =
            `Total registrados: ${alumnos_originales.length}`;

    }

}