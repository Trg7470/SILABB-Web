let alumnosOriginales = [];
let alumnosFiltrados = [];

document.addEventListener("DOMContentLoaded", function () {
    obtener_datos();

    // Eventos de los filtros
    document.getElementById("btn_limpiar").addEventListener("click", limpiarFiltros);

    // Filtrado en tiempo real al escribir
    document.getElementById("buscar_nombre").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro_adscripcion").addEventListener("change", aplicarFiltros); // Semestre
    document.getElementById("filtro_adscripcion_2").addEventListener("change", aplicarFiltros); // Carrera
    document.getElementById("filtro_carrera").addEventListener("change", aplicarFiltros); // Estado
});

async function obtener_datos() {
    // 1. Contar alumnos
    try {
        const response = await fetch("http://localhost:3000/api/alumnos/contar");
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const result = await response.json();

        // Extrae 'Total' considerando si la respuesta viene dentro de un objeto o un arreglo
        const total = result.data?.Total ?? result.data?.[0]?.Total ?? 0;
        document.getElementById("total_alumnos").textContent = `Total registrados: ${total}`;
    } catch (error) {
        console.error("Error al contar alumnos: ", error);
        document.getElementById("total_alumnos").textContent = `Total registrados: 0`;
    }

    // 2. Consultar lista completa de alumnos
    try {
        const response_l = await fetch("http://localhost:3000/api/alumnos/");
        if (!response_l.ok) {
            throw new Error(`Error HTTP: ${response_l.status}`);
        }
        const result_l = await response_l.json();

        if (result_l.success && Array.isArray(result_l.data)) {
            alumnosOriginales = result_l.data;
            alumnosFiltrados = [...alumnosOriginales];

            poblarSelectsFiltro(alumnosOriginales);
            renderizarTabla(alumnosFiltrados);
        }
    } catch (error) {
        console.error("Error al obtener alumnos: ", error);
        document.getElementById("tabla_alumnos").innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> Error al cargar los alumnos
                </td>
            </tr>`;
    }
}

/**
 * Renderiza los registros recibidos en la tabla HTML
 */
function renderizarTabla(alumnos) {
    const tbody = document.getElementById("tabla_alumnos");
    tbody.innerHTML = "";

    if (alumnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fa-solid fa-info-circle mr-1"></i> No se encontraron alumnos registrados.
                </td>
            </tr>`;
        actualizarPaginacionInfo(0, 0);
        return;
    }

    alumnos.forEach((alumno) => {
        const tr = document.createElement("tr");

        // Generar iniciales para el avatar
        const iniciales = alumno.Nombre
            ? alumno.Nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
            : "AL";

        // Formato para estado Activo/Inactivo
        const esActivo = alumno.Activo === 1 || alumno.Activo === true;
        const estadoBadge = esActivo
            ? '<span class="badge badge-success px-2 py-1">Activo</span>'
            : '<span class="badge badge-danger px-2 py-1">Inactivo</span>';

        tr.innerHTML = `
            <td class="pl-4 font-weight-bold text-muted">#${String(alumno.Id_Alumno).padStart(2, '0')}</td>
            <td><span class="badge badge-light border">${alumno.Numero_Control}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-2 font-weight-bold"
                        style="width: 32px; height: 32px; font-size: 0.75rem;">
                        ${iniciales}
                    </div>
                    <span class="font-weight-bold">${alumno.Nombre}</span>
                </div>
            </td>
            <td>Semestre ${alumno.Semestre}</td>
            <td>${alumno.Carrera}</td>
            <td>${estadoBadge}</td>
          <td class="text-center pr-4">
    <div class="dropdown">
        <button class="btn btn-link text-muted p-0 border-0" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa-solid fa-ellipsis-vertical fa-lg"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right shadow-sm">
            <a class="dropdown-item" href="/pages/alumnos/informacion.html"><i class="fa-regular fa-eye mr-2 text-primary"></i>Ver detalles</a>
        </div>
    </div>
</td>
        `;

        tbody.appendChild(tr);
    });

    actualizarPaginacionInfo(alumnos.length, alumnosOriginales.length);
}

/**
 * Llena dinámicamente los elementos <select> de los filtros según los datos disponibles
 */
function poblarSelectsFiltro(alumnos) {
    const selectSemestre = document.getElementById("filtro_adscripcion");
    const selectCarrera = document.getElementById("filtro_adscripcion_2");
    const selectEstado = document.getElementById("filtro_carrera");

    // Obtener valores únicos
    const semestres = [...new Set(alumnos.map(a => a.Semestre))].sort((a, b) => a - b);
    const carreras = [...new Set(alumnos.map(a => a.Carrera))].sort();

    // Poblar Semestres
    selectSemestre.innerHTML = '<option value="">Todos</option>';
    semestres.forEach(sem => {
        selectSemestre.innerHTML += `<option value="${sem}">Semestre ${sem}</option>`;
    });

    // Poblar Carreras
    selectCarrera.innerHTML = '<option value="">Todas</option>';
    carreras.forEach(car => {
        selectCarrera.innerHTML += `<option value="${car}">${car}</option>`;
    });

    // Poblar Estados
    selectEstado.innerHTML = `
        <option value="">Todos</option>
        <option value="1">Activo</option>
        <option value="0">Inactivo</option>
    `;
}

/**
 * Aplica los filtros de texto y dropdowns a la lista local de alumnos
 */
function aplicarFiltros() {
    const texto = document.getElementById("buscar_nombre").value.trim().toLowerCase();
    const semestreSel = document.getElementById("filtro_adscripcion").value;
    const carreraSel = document.getElementById("filtro_adscripcion_2").value;
    const estadoSel = document.getElementById("filtro_carrera").value;

    alumnosFiltrados = alumnosOriginales.filter(alumno => {
        // Coincidencia con Nombre o Número de Control
        const coincideTexto = !texto ||
            alumno.Nombre.toLowerCase().includes(texto) ||
            String(alumno.Numero_Control).includes(texto);

        // Coincidencia con Semestre
        const coincideSemestre = !semestreSel || String(alumno.Semestre) === semestreSel;

        // Coincidencia con Carrera
        const coincideCarrera = !carreraSel || alumno.Carrera === carreraSel;

        // Coincidencia con Estado
        const coincideEstado = !estadoSel || String(alumno.Activo) === estadoSel;

        return coincideTexto && coincideSemestre && coincideCarrera && coincideEstado;
    });

    renderizarTabla(alumnosFiltrados);
}

/**
 * Restablece todos los inputs/selects de búsqueda
 */
function limpiarFiltros() {
    document.getElementById("buscar_nombre").value = "";
    document.getElementById("filtro_adscripcion").value = "";
    document.getElementById("filtro_adscripcion_2").value = "";
    document.getElementById("filtro_carrera").value = "";

    alumnosFiltrados = [...alumnosOriginales];
    renderizarTabla(alumnosFiltrados);
}

/**
 * Actualiza el texto con información de registros en el footer de la tabla
 */
function actualizarPaginacionInfo(mostrando, total) {
    const elemInfo = document.getElementById("info_paginacion");
    if (elemInfo) {
        elemInfo.textContent = `Mostrando ${mostrando} de ${total} alumnos`;
    }
}

// Funciones placeholder para botones de acción
function editarAlumno(id) {
    console.log("Editar alumno ID:", id);
}

function eliminarAlumno(id) {
    console.log("Eliminar/Desactivar alumno ID:", id);
}