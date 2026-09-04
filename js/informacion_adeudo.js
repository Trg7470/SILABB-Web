document.addEventListener("DOMContentLoaded", function () {

    const urlParams =
        new URLSearchParams(window.location.search);

    const id_adeudo =
        urlParams.get("id_adeudo");


    // =====================================================
    // SI NO EXISTE EL ID, REGRESAMOS A LA LISTA DE ADEUDOS
    // =====================================================

    if (!id_adeudo) {

        console.warn(
            "No se proporcionó un ID de adeudo."
        );

        window.location.href =
            "/pages/modulos/adeudos.html";

        return;
    }


    consultar_adeudo(id_adeudo);

});


// =====================================================
// CONSULTAR ADEUDO
// =====================================================

async function consultar_adeudo(id_adeudo) {

    try {

        const response = await fetch(
            `http://localhost:3000/api/adeudos/${id_adeudo}`
        );


        if (!response.ok) {

            throw new Error(
                `Error al consultar adeudo: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Información del adeudo:",
            result
        );


        const adeudo =
            result.data;


        if (!adeudo) {

            throw new Error(
                "No se encontró información del adeudo."
            );

        }


        // =================================================
        // INFORMACIÓN PRINCIPAL
        // =================================================

        document.getElementById(
            "detalle_id_adeudo"
        ).textContent =
            `#${adeudo.Id_Adeudo}`;


        document.getElementById(
            "detalle_alumno"
        ).textContent =
            adeudo.Alumno || "Sin registro";


        document.getElementById(
            "detalle_alumno_info"
        ).textContent =
            adeudo.Alumno || "Sin registro";


        // =================================================
        // INFORMACIÓN DEL ALUMNO
        // =================================================

        document.getElementById(
            "detalle_numero_control"
        ).textContent =
            adeudo.Numero_Control || "Sin registro";


        document.getElementById(
            "detalle_carrera"
        ).textContent =
            adeudo.Carrera || "Sin registro";


        // =================================================
        // INFORMACIÓN DEL ADEUDO
        // =================================================

        document.getElementById(
            "detalle_id_prestamo"
        ).textContent =
            adeudo.Id_Prestamo || "Sin registro";


        document.getElementById(
            "detalle_tipo"
        ).textContent =
            obtener_tipo_adeudo(
                adeudo.Tipo
            );


        document.getElementById(
            "detalle_descripcion"
        ).textContent =
            adeudo.Descripcion || "Sin descripción";


        // =================================================
        // FECHAS DEL ADEUDO
        // =================================================

        document.getElementById(
            "detalle_fecha_creacion"
        ).textContent =
            formatear_fecha(
                adeudo.Fecha_Creacion
            );


        document.getElementById(
            "detalle_fecha_resolucion"
        ).textContent =
            adeudo.Fecha_Resolucion
                ? formatear_fecha(
                    adeudo.Fecha_Resolucion
                )
                : "Pendiente";


        // =================================================
        // USUARIOS
        // =================================================

        document.getElementById(
            "detalle_usuario_creacion"
        ).textContent =
            adeudo.Usuario_Creacion || "Sin registro";


        document.getElementById(
            "detalle_usuario_resolucion"
        ).textContent =
            adeudo.Usuario_Resolucion || "Pendiente";


        // =================================================
        // INFORMACIÓN DEL LIBRO
        // =================================================

        document.getElementById(
            "detalle_libro"
        ).textContent =
            adeudo.Titulo || "Sin registro";


        document.getElementById(
            "detalle_autor"
        ).textContent =
            adeudo.Autor || "Sin registro";


        // =================================================
        // INFORMACIÓN DEL PRÉSTAMO
        // =================================================

        document.getElementById(
            "detalle_fecha_prestamo"
        ).textContent =
            formatear_fecha(
                adeudo.Fecha_Prestamo
            );


        document.getElementById(
            "detalle_fecha_vencimiento"
        ).textContent =
            formatear_fecha(
                adeudo.Fecha_Vencimiento
            );


        document.getElementById(
            "detalle_fecha_devolucion"
        ).textContent =
            adeudo.Fecha_Devolucion
                ? formatear_fecha(
                    adeudo.Fecha_Devolucion
                )
                : "Pendiente";


        document.getElementById(
            "detalle_estado_prestamo"
        ).textContent =
            obtener_estado_prestamo(
                adeudo.Estado_Prestamo
            );


        // =================================================
        // ESTADO DEL ADEUDO
        // =================================================

        mostrar_estado(
            adeudo.Estado
        );


        // =================================================
        // RESUMEN
        // =================================================

        mostrar_resumen(
            adeudo
        );


    } catch (error) {

        console.error(
            "Error al consultar adeudo:",
            error
        );

        mostrar_error();

    }

}


// =====================================================
// OBTENER TIPO DE ADEUDO
// =====================================================

function obtener_tipo_adeudo(tipo) {

    switch (tipo) {

        case "LIBRO_NO_DEVUELTO":
            return "Libro no devuelto";

        case "LIBRO_PERDIDO":
            return "Libro perdido";

        case "LIBRO_DANADO":
            return "Libro dañado";

        case "OTRO":
            return "Otro";

        default:
            return tipo || "Sin registro";

    }

}


// =====================================================
// OBTENER ESTADO DEL PRÉSTAMO
// =====================================================

function obtener_estado_prestamo(estado) {

    switch (estado) {

        case "PRESTADO":
            return "Prestado";

        case "VENCIDO":
            return "Vencido";

        case "DEVUELTO":
            return "Devuelto";

        default:
            return estado || "Sin estado";

    }

}


// =====================================================
// MOSTRAR ESTADO DEL ADEUDO
// =====================================================

function mostrar_estado(estado) {

    const elemento =
        document.getElementById(
            "detalle_estado"
        );


    if (!elemento) {
        return;
    }


    let clase =
        "badge-secondary";

    let icono =
        "fa-circle-info";

    let texto =
        estado || "SIN ESTADO";


    switch (estado) {

        case "PENDIENTE":

            clase =
                "badge-danger";

            icono =
                "fa-triangle-exclamation";

            texto =
                "Pendiente";

            break;


        case "RESUELTO":

            clase =
                "badge-success";

            icono =
                "fa-circle-check";

            texto =
                "Resuelto";

            break;

    }


    elemento.className =
        `badge ${clase} px-3 py-2 font-weight-normal`;


    elemento.style.fontSize =
        "0.9rem";


    elemento.innerHTML =
        `<i class="fa-solid ${icono} mr-1"></i>
         ${texto}`;

}


// =====================================================
// MOSTRAR RESUMEN
// =====================================================

function mostrar_resumen(adeudo) {

    const icono =
        document.getElementById(
            "resumen_icono"
        );


    const mensaje =
        document.getElementById(
            "resumen_mensaje"
        );


    if (!icono || !mensaje) {
        return;
    }


    switch (adeudo.Estado) {

        case "PENDIENTE":

            icono.className =
                "fa-solid fa-triangle-exclamation fa-2x mb-2 text-danger";


            mensaje.className =
                "mb-0 font-weight-bold text-danger";


            mensaje.textContent =
                "El adeudo se encuentra pendiente de resolución.";

            break;


        case "RESUELTO":

            icono.className =
                "fa-solid fa-circle-check fa-2x mb-2 text-success";


            mensaje.className =
                "mb-0 font-weight-bold text-success";


            mensaje.textContent =
                "El adeudo fue resuelto correctamente.";

            break;


        default:

            icono.className =
                "fa-solid fa-circle-info fa-2x mb-2 text-secondary";


            mensaje.className =
                "mb-0 font-weight-bold text-dark";


            mensaje.textContent =
                "Información del adeudo.";

            break;

    }

}


// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatear_fecha(fecha) {

    if (!fecha) {

        return "Sin registro";

    }


    const fecha_objeto =
        new Date(fecha);


    if (isNaN(fecha_objeto.getTime())) {

        return "Sin registro";

    }


    return fecha_objeto.toLocaleDateString(
        "es-MX",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// =====================================================
// MOSTRAR ERROR
// =====================================================

function mostrar_error() {

    const alumno =
        document.getElementById(
            "detalle_alumno"
        );


    const libro =
        document.getElementById(
            "detalle_libro"
        );


    const estado =
        document.getElementById(
            "detalle_estado"
        );


    const mensaje =
        document.getElementById(
            "resumen_mensaje"
        );


    if (alumno) {

        alumno.textContent =
            "No disponible";

    }


    if (libro) {

        libro.textContent =
            "No disponible";

    }


    if (estado) {

        estado.className =
            "badge badge-danger px-3 py-2 font-weight-normal";


        estado.style.fontSize =
            "0.9rem";


        estado.innerHTML =
            `<i class="fa-solid fa-triangle-exclamation mr-1"></i>
             Error`;

    }


    if (mensaje) {

        mensaje.className =
            "mb-0 font-weight-bold text-danger";


        mensaje.textContent =
            "No fue posible cargar la información del adeudo.";

    }

}