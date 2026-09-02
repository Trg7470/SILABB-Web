let alumno;
const usuario =
    JSON.parse(
        sessionStorage.getItem("usuario")
    );
const id_usuario =
    usuario.Id_Usuario;

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const numero_control = urlParams.get("numero_control");

    if (!numero_control) {
        console.warn("No se proporcionó un número de control.");
        window.location.href = "/pages/modulos/alumnos.html";
        return;
    }

    consultar_alumno(numero_control);

    // Abrir modal modificar
    const btn_editar = document.getElementById("btn_editar_alumno");

    if (btn_editar) {
        btn_editar.addEventListener("click", function () {
            modificar_alumno(numero_control);
        });
    }

    // Guardar modificación
    const formulario = document.getElementById("form_modificar_alumno");

    if (formulario) {
        formulario.addEventListener("submit", function (event) {
            event.preventDefault();
            guardar_modificacion();
        });
    }

    // Cerrar modal con X
    const btn_cerrar_modal = document.getElementById("btn_cerrar_modal");

    if (btn_cerrar_modal) {
        btn_cerrar_modal.addEventListener("click", function () {
            $("#modal_modificar_alumno").modal("hide");
        });
    }

    // Cerrar modal con Cancelar
    const btn_cancelar_modal = document.getElementById("btn_cancelar_modal");

    if (btn_cancelar_modal) {
        btn_cancelar_modal.addEventListener("click", function () {
            $("#modal_modificar_alumno").modal("hide");
        });
    }
});

async function consultar_alumno(numero_control) {
    try {
        const response = await fetch(`http://localhost:3000/api/alumnos/numero-control/${numero_control}`);

        if (!response.ok) {
            throw new Error(`Error al consultar alumno: ${response.status}`);
        }

        const result = await response.json();

        document.getElementById("numero_control").textContent = result.data.Numero_Control;
        document.getElementById("numero_control2").textContent = result.data.Numero_Control;
        document.getElementById("carrera").textContent = result.data.Carrera;
        document.getElementById("semestre").textContent = result.data.Semestre;
        document.getElementById("activo").textContent = result.data.Activo == 1 ? "Activo" : "Inactivo";
        document.getElementById("nombre_completo").textContent = result.data.Nombre_Completo;

    } catch (error) {
        console.error("Error al consultar alumno:", error);
    }
}

async function modificar_alumno(numero_control) {
    try {
        const response = await fetch(`http://localhost:3000/api/alumnos/numero-control/${numero_control}`);

        if (!response.ok) {
            throw new Error(`Error al consultar alumno: ${response.status}`);
        }

        const result = await response.json();
        alumno = result.data;

        document.getElementById("modificar_nombre").value = alumno.Nombre;
        document.getElementById("modificar_apellido_paterno").value = alumno.Apellido_Paterno;
        document.getElementById("modificar_apellido_materno").value = alumno.Apellido_Materno;
        document.getElementById("modificar_numero_control").value = alumno.Numero_Control;
        document.getElementById("modificar_semestre").value = alumno.Semestre;
        document.getElementById("modificar_carrera").value = alumno.Carrera;
        document.getElementById("modificar_activo").value = alumno.Activo;

        $("#modal_modificar_alumno").modal("show");

    } catch (error) {
        console.error("Error al cargar datos del alumno:", error);
    }
}

async function guardar_modificacion() {
    try {

        const datos = {
            Nombre: document.getElementById("modificar_nombre").value,
            Apellido_Paterno: document.getElementById("modificar_apellido_paterno").value,
            Apellido_Materno: document.getElementById("modificar_apellido_materno").value,
            Numero_Control: document.getElementById("modificar_numero_control").value,
            Semestre: document.getElementById("modificar_semestre").value,
            Carrera: document.getElementById("modificar_carrera").value,
            Activo: Number(document.getElementById("modificar_activo").value),
            Id_Usuario: id_usuario
        };

        console.log("Datos enviados:", datos);

        const response = await fetch(
            `http://localhost:3000/api/alumnos/${alumno.Id_Alumno}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await response.json();

        console.log("Respuesta API:", resultado);

        if (!response.ok) {
            throw new Error(
                resultado.mensaje ||
                `Error al modificar alumno: ${response.status}`
            );
        }

        $("#modal_modificar_alumno").modal("hide");

        await consultar_alumno(datos.Numero_Control);

    } catch (error) {
        console.error(
            "Error al modificar alumno:",
            error.message
        );
    }
}