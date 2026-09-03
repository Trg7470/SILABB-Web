document.addEventListener("DOMContentLoaded", function () {

    const urlParams =
        new URLSearchParams(window.location.search);

    const id_prestamo =
        urlParams.get("id_prestamo");


    // Si no existe el ID, regresamos a la lista de préstamos

    if (!id_prestamo) {

        console.warn(
            "No se proporcionó un ID de préstamo."
        );

        window.location.href =
            "/pages/modulos/prestamos.html";

        return;
    }


    consultar_prestamo(id_prestamo);

});


// =====================================================
// CONSULTAR PRÉSTAMO
// =====================================================

async function consultar_prestamo(id_prestamo) {

    try {

        const response = await fetch(
            `http://localhost:3000/api/prestamos/${id_prestamo}`
        );


        if (!response.ok) {

            throw new Error(
                `Error al consultar préstamo: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Información del préstamo:",
            result
        );


        const prestamo =
            result.data;


        if (!prestamo) {

            throw new Error(
                "No se encontró información del préstamo."
            );

        }


        // =================================================
        // INFORMACIÓN PRINCIPAL
        // =================================================

        document.getElementById(
            "detalle_id_prestamo"
        ).textContent =
            `#${prestamo.Id_Prestamo}`;


        document.getElementById(
            "detalle_alumno"
        ).textContent =
            prestamo.Alumno || "Sin registro";


        document.getElementById(
            "detalle_alumno_info"
        ).textContent =
            prestamo.Alumno || "Sin registro";


        // =================================================
        // INFORMACIÓN DEL ALUMNO
        // =================================================

        document.getElementById(
            "detalle_numero_control"
        ).textContent =
            prestamo.Numero_Control || "Sin registro";


        document.getElementById(
            "detalle_carrera"
        ).textContent =
            prestamo.Carrera || "Sin registro";


        // =================================================
        // INFORMACIÓN DEL LIBRO
        // =================================================

        document.getElementById(
            "detalle_libro"
        ).textContent =
            prestamo.Titulo || "Sin registro";


        // =================================================
        // FECHAS
        // =================================================

        document.getElementById(
            "detalle_fecha_prestamo"
        ).textContent =
            formatear_fecha(
                prestamo.Fecha_Prestamo
            );


        document.getElementById(
            "detalle_fecha_vencimiento"
        ).textContent =
            formatear_fecha(
                prestamo.Fecha_Vencimiento
            );


        document.getElementById(
            "detalle_fecha_devolucion"
        ).textContent =
            prestamo.Fecha_Devolucion
                ? formatear_fecha(
                    prestamo.Fecha_Devolucion
                )
                : "Pendiente";


        // =================================================
        // USUARIO
        // =================================================

        document.getElementById(
            "detalle_usuario"
        ).textContent =
            prestamo.Usuario || "Sin registro";


        // =================================================
        // ESTADO
        // =================================================

        mostrar_estado(
            prestamo.Estado
        );


        // =================================================
        // RESUMEN
        // =================================================

        mostrar_resumen(
            prestamo
        );


    } catch (error) {

        console.error(
            "Error al consultar préstamo:",
            error
        );

        mostrar_error();

    }

}


// =====================================================
// MOSTRAR ESTADO
// =====================================================

function mostrar_estado(estado) {

    const elemento =
        document.getElementById(
            "detalle_estado"
        );


    if (!elemento) {
        return;
    }


    let clase = "badge-secondary";
    let icono = "fa-circle-info";
    let texto = estado || "SIN ESTADO";


    switch (estado) {

        case "PRESTADO":

            clase = "badge-warning text-white";
            icono = "fa-clock";
            texto = "Prestado";

            break;


        case "VENCIDO":

            clase = "badge-danger";
            icono = "fa-triangle-exclamation";
            texto = "Vencido";

            break;


        case "DEVUELTO":

            clase = "badge-success";
            icono = "fa-circle-check";
            texto = "Devuelto";

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

function mostrar_resumen(prestamo) {

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


    switch (prestamo.Estado) {

        case "PRESTADO":

            icono.className =
                "fa-solid fa-book-open fa-2x mb-2 text-primary";

            mensaje.className =
                "mb-0 font-weight-bold text-dark";

            mensaje.textContent =
                "El préstamo se encuentra activo.";

            break;


        case "VENCIDO":

            icono.className =
                "fa-solid fa-triangle-exclamation fa-2x mb-2 text-danger";

            mensaje.className =
                "mb-0 font-weight-bold text-danger";

            mensaje.textContent =
                "El préstamo se encuentra vencido.";

            break;


        case "DEVUELTO":

            icono.className =
                "fa-solid fa-circle-check fa-2x mb-2 text-success";

            mensaje.className =
                "mb-0 font-weight-bold text-success";

            mensaje.textContent =
                "El libro fue devuelto correctamente.";

            break;


        default:

            icono.className =
                "fa-solid fa-circle-info fa-2x mb-2 text-secondary";

            mensaje.className =
                "mb-0 font-weight-bold text-dark";

            mensaje.textContent =
                "Información del préstamo.";

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
            "No fue posible cargar la información del préstamo.";

    }

}