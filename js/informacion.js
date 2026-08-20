document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const numero_control = urlParams.get("numero_control");
    if (!numero_control) {
        console.warn("No se proporcionó un número de control.");
        window.location.href = "/pages/modulos/alumnos.html"; // Redirigir si no hay parámetro
        return;
    }
    consultar_alumno(numero_control);
});

async function consultar_alumno(numero_control)
{
    try {
        const response = await fetch(`http://localhost:3000/api/alumnos/numero-control/${numero_control}`);
        if(!response.ok)
        {
            throw new Error(`Error al consultar alumno: ${response.status}`);
        }
        const result = await response.json();
        document.getElementById("numero_control").textContent = result.data.Numero_Control;
        document.getElementById("numero_control2").textContent = result.data.Numero_Control;
        document.getElementById("carrera").textContent = result.data.Carrera;
        document.getElementById("semestre").textContent = result.data.Semestre;
        document.getElementById("activo").textContent = result.data.Activo;
        document.getElementById("nombre").textContent = result.data.Nombre;
    } catch (error) {
        
    }
}