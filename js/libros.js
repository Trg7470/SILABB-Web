document.addEventListener('DOMContentLoaded', () => {

    const tabla = document.getElementById('tabla_libros');
    const totalLibros = document.getElementById('total_libros');

    const estadoCargando = document.getElementById('estado_cargando');
    const estadoVacio = document.getElementById('estado_vacio');

    const infoPaginacion = document.getElementById('info_paginacion');

    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const paginaActual = document.getElementById('paginaActual');

    const buscarLibro = document.getElementById('buscar_libro');
    const filtroEstado = document.getElementById('filtro_estado');
    const filtroDisponibilidad = document.getElementById('filtro_disponibilidad');

    const btnBuscar = document.getElementById('btn_buscar');
    const btnLimpiar = document.getElementById('btn_limpiar');

    let libros = [];
    let librosFiltrados = [];

    let pagina = 1;

    const registrosPorPagina = 10;


    // =====================================================
    // CARGAR LIBROS
    // =====================================================

    async function cargarLibros() {

        mostrarCargando();

        try {

            const respuesta = await fetch('http://localhost:3000/api/libros');

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(
                    resultado.mensaje || 'No fue posible obtener los libros'
                );
            }

            libros = resultado.data || [];

            librosFiltrados = [...libros];

            pagina = 1;

            actualizarTotal();

            renderizarTabla();

        } catch (error) {

            console.error('Error al cargar libros:', error);

            mostrarError(error.message);

        }

    }


    // =====================================================
    // RENDERIZAR TABLA
    // =====================================================

    function renderizarTabla() {

        tabla.innerHTML = '';

        ocultarCargando();

        if (librosFiltrados.length === 0) {

            estadoVacio.classList.remove('d-none');

            infoPaginacion.textContent = 'Mostrando 0 libros';

            paginaActual.textContent = '1';

            btnAnterior.disabled = true;
            btnSiguiente.disabled = true;

            return;
        }

        estadoVacio.classList.add('d-none');


        // -----------------------------------------------
        // Paginación
        // -----------------------------------------------

        const inicio = (pagina - 1) * registrosPorPagina;

        const fin = inicio + registrosPorPagina;

        const librosPagina =
            librosFiltrados.slice(inicio, fin);


        // -----------------------------------------------
        // Crear filas
        // -----------------------------------------------

        librosPagina.forEach(libro => {

            const fila = document.createElement('tr');

            fila.innerHTML = `

                <td class="pl-4 font-weight-bold text-muted">
                    #${libro.Id_Libro}
                </td>

                <td>
                    <span class="font-weight-bold">
                        ${escapeHtml(libro.Titulo)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(libro.Autor || '—')}
                </td>

                <td>
                    ${escapeHtml(libro.Editorial || '—')}
                </td>

                <td>
                    <span class="badge badge-light border">
                        ${escapeHtml(libro.ISBN || '—')}
                    </span>
                </td>

                <td>
                    ${libro.Anio_Publicacion || '—'}
                </td>

                <td>
                ${obtenerBadgeEstado(libro)}
                </td>

                <td class="text-center align-middle">
                ${obtenerBadgeDisponibilidad(libro)}
                </td>

                    <td class="text-center align-middle">
                    <div class="d-inline-flex justify-content-center align-items-center gap-1">
                        <button
                            class="btn btn-sm btn-outline-primary"
                            title="Editar"
                            onclick="editarLibro(${libro.Id_Libro})">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="btn btn-sm btn-outline-danger"
                            title="${libro.Activo ? 'Desactivar' : 'Activar'}"
                            onclick="cambiarEstadoLibro(${libro.Id_Libro}, ${libro.Activo})">
                            <i class="fa-solid ${libro.Activo ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                    </div>
                </td>
            `;
            tabla.appendChild(fila);
        });

        // -----------------------------------------------
        // Información de paginación
        // -----------------------------------------------

        const total = librosFiltrados.length;

        const mostrandoDesde = inicio + 1;

        const mostrandoHasta =
            Math.min(fin, total);

        infoPaginacion.textContent =
            `Mostrando ${mostrandoDesde} a ${mostrandoHasta} de ${total} libros`;


        // -----------------------------------------------
        // Página actual
        // -----------------------------------------------

        const totalPaginas =
            Math.ceil(total / registrosPorPagina);

        paginaActual.textContent = pagina;


        btnAnterior.disabled = pagina <= 1;

        btnSiguiente.disabled =
            pagina >= totalPaginas;

    }


    // =====================================================
    // ESTADO DEL LIBRO
    // =====================================================

    function obtenerBadgeEstado(libro) {

        if (libro.Activo) {

            return `
                <span class="badge badge-success px-2 py-1">
                    Activo
                </span>
            `;

        }

        return `
            <span class="badge badge-secondary px-2 py-1">
                Inactivo
            </span>
        `;

    }

    function obtenerBadgeDisponibilidad(libro) {

    if (libro.Disponible) {

        return `
            <span class="badge badge-success px-2 py-1">
                <i class="fa-solid fa-circle-check mr-1"></i>
                Disponible
            </span>
        `;

    }

    return `
        <span class="badge badge-warning px-2 py-1">
            <i class="fa-solid fa-clock mr-1"></i>
            Prestado
        </span>
    `;

}

    // =====================================================
    // TOTAL DE LIBROS
    // =====================================================

    function actualizarTotal() {

        totalLibros.textContent =
            `Total registrados: ${libros.length}`;

    }

    function actualizarTotalFiltrados() {

    totalLibros.textContent =
        `Resultados: ${librosFiltrados.length}`;

}


    // =====================================================
    // BUSCAR / FILTRAR
    // =====================================================

    async function aplicarFiltros() {

    const termino = buscarLibro.value.trim();
    const estado = filtroEstado.value;
    const disponibilidad = filtroDisponibilidad.value;


    // =====================================================
    // SI NO HAY NINGÚN FILTRO
    // =====================================================

    if (!termino && estado === '' && disponibilidad === '') {

        librosFiltrados = [...libros];

        pagina = 1;

        actualizarTotal();

        renderizarTabla();

        return;
    }


    mostrarCargando();


    try {

        let resultados = [];


        // =====================================================
        // 1. BÚSQUEDA
        // =====================================================

        if (termino) {

            const respuesta = await fetch(
                `http://localhost:3000/api/libros/buscar?termino=${encodeURIComponent(termino)}`
            );


            const resultado = await respuesta.json();


            if (!respuesta.ok || !resultado.success) {

                throw new Error(
                    resultado.mensaje ||
                    'No fue posible realizar la búsqueda'
                );

            }


            resultados = resultado.data || [];

        } else {

            // Si no hay búsqueda utilizamos los libros
            // que ya cargamos anteriormente.

            resultados = [...libros];

        }


        // =====================================================
        // 2. FILTRO POR ESTADO
        // =====================================================

        if (estado === '1') {

            resultados = resultados.filter(
                libro => Boolean(libro.Activo)
            );

        }


        if (estado === '0') {

            resultados = resultados.filter(
                libro => !Boolean(libro.Activo)
            );

        }


        // =====================================================
        // 3. FILTRO POR DISPONIBILIDAD
        // =====================================================

        if (disponibilidad !== '') {

            let endpoint = '';


            if (disponibilidad === 'disponible') {

                endpoint =
                    'http://localhost:3000/api/libros/disponibles';

            }


            if (disponibilidad === 'prestado') {

                endpoint =
                    'http://localhost:3000/api/libros/prestados';

            }


            const respuestaDisponibilidad =
                await fetch(endpoint);


            const resultadoDisponibilidad =
                await respuestaDisponibilidad.json();


            if (
                !respuestaDisponibilidad.ok ||
                !resultadoDisponibilidad.success
            ) {

                throw new Error(
                    resultadoDisponibilidad.mensaje ||
                    'No fue posible consultar la disponibilidad de los libros'
                );

            }


            const librosDisponibilidad =
                resultadoDisponibilidad.data || [];


            // Obtenemos solamente los IDs de los libros
            // que pertenecen a la disponibilidad seleccionada.

            const idsDisponibles =
                new Set(
                    librosDisponibilidad.map(
                        libro => libro.Id_Libro
                    )
                );


            // Intersectamos los resultados actuales
            // con los libros disponibles/prestados.

            resultados = resultados.filter(
                libro => idsDisponibles.has(libro.Id_Libro)
            );

        }


        // =====================================================
        // 4. ACTUALIZAR RESULTADOS
        // =====================================================

        librosFiltrados = resultados;

        pagina = 1;


        actualizarTotalFiltrados();

        renderizarTabla();


    } catch (error) {

        console.error(
            'Error al aplicar filtros:',
            error
        );


        mostrarError(error.message);

    }

}

    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    function limpiarFiltros() {

        buscarLibro.value = '';

        filtroEstado.value = '';

        filtroDisponibilidad.value = '';

        librosFiltrados = [...libros];

        pagina = 1;

        renderizarTabla();

    }


    // =====================================================
    // PAGINACIÓN
    // =====================================================

    btnAnterior.addEventListener('click', () => {

        if (pagina > 1) {

            pagina--;

            renderizarTabla();

        }

    });


    btnSiguiente.addEventListener('click', () => {

        const totalPaginas =
            Math.ceil(
                librosFiltrados.length /
                registrosPorPagina
            );

        if (pagina < totalPaginas) {

            pagina++;

            renderizarTabla();

        }

    });


    // =====================================================
    // BOTONES
    // =====================================================

    btnBuscar.addEventListener(
        'click',
        aplicarFiltros
    );


    btnLimpiar.addEventListener(
        'click',
        limpiarFiltros
    );


    // Buscar presionando ENTER

    buscarLibro.addEventListener('keydown', event => {

        if (event.key === 'Enter') {

            event.preventDefault();

            aplicarFiltros();

        }

    });


    // =====================================================
    // NUEVO LIBRO
    // =====================================================

    document
        .getElementById('btn_nuevo_libro')
        .addEventListener('click', () => {

            alert('Formulario de nuevo libro próximamente.');

        });


    // =====================================================
    // EDITAR
    // =====================================================

    window.editarLibro = async function(id) {

    try {

        const respuesta = await fetch(
            `http://localhost:3000/api/libros/${id}`
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {

            throw new Error(
                resultado.mensaje ||
                'No fue posible obtener la información del libro'
            );

        }

        const libro = resultado.data;


        // =====================================================
        // CARGAR DATOS EN EL FORMULARIO
        // =====================================================

        document.getElementById('editar_id_libro').value =
            libro.Id_Libro;

        document.getElementById('editar_titulo').value =
            libro.Titulo || '';

        document.getElementById('editar_autor').value =
            libro.Autor || '';

        document.getElementById('editar_editorial').value =
            libro.Editorial || '';

        document.getElementById('editar_isbn').value =
            libro.ISBN || '';

        document.getElementById('editar_anio').value =
            libro.Anio_Publicacion || '';


        // =====================================================
        // ABRIR MODAL
        // =====================================================

        $('#modal_editar_libro').modal('show');


    } catch (error) {

        console.error(
            'Error al cargar libro para editar:',
            error
        );

        alert(error.message);

    }

};

    // =====================================================
// GUARDAR EDICIÓN
// =====================================================

document
    .getElementById('form_editar_libro')
    .addEventListener('submit', async event => {

        event.preventDefault();


        const id =
            document.getElementById('editar_id_libro').value;

        const Titulo =
            document.getElementById('editar_titulo').value.trim();

        const Autor =
            document.getElementById('editar_autor').value.trim();

        const Editorial =
            document.getElementById('editar_editorial').value.trim();

        const ISBN =
            document.getElementById('editar_isbn').value.trim();

        const Anio_Publicacion =
            document.getElementById('editar_anio').value;


        // =====================================================
        // VALIDACIÓN
        // =====================================================

        if (!Titulo) {

            alert('El título del libro es obligatorio');

            return;

        }


        // =====================================================
        // DATOS
        // =====================================================

        const datos = {

            Titulo,
            Autor: Autor || null,
            Editorial: Editorial || null,
            ISBN: ISBN || null,
            Anio_Publicacion:
                Anio_Publicacion || null

        };


        const btnGuardar =
            document.getElementById('btn_guardar_edicion');


        try {

            // Desactivar botón mientras se guarda

            btnGuardar.disabled = true;

            btnGuardar.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin mr-1"></i>
                Guardando...
            `;


            // =================================================
            // ACTUALIZAR LIBRO
            // =================================================

            const respuesta = await fetch(
                `http://localhost:3000/api/libros/${id}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(datos)
                }
            );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok || !resultado.success) {

                throw new Error(
                    resultado.mensaje ||
                    'No fue posible actualizar el libro'
                );

            }


            // =================================================
            // CERRAR MODAL
            // =================================================

            $('#modal_editar_libro').modal('hide');


            // =================================================
            // ACTUALIZAR LIBRO EN MEMORIA
            // =================================================

            const libroActualizado =
                resultado.data;


            const indice =
                libros.findIndex(
                    libro =>
                        libro.Id_Libro ===
                        libroActualizado.Id_Libro
                );


            if (indice !== -1) {

                libros[indice] =
                    libroActualizado;

            }


            // Actualizar también los resultados filtrados

            const indiceFiltrado =
                librosFiltrados.findIndex(
                    libro =>
                        libro.Id_Libro ===
                        libroActualizado.Id_Libro
                );


            if (indiceFiltrado !== -1) {

                librosFiltrados[indiceFiltrado] =
                    libroActualizado;

            }


            // =================================================
            // ACTUALIZAR TABLA
            // =================================================

            renderizarTabla();


            alert(
                'Libro actualizado correctamente'
            );


        } catch (error) {

            console.error(
                'Error al actualizar libro:',
                error
            );

            alert(error.message);


        } finally {

            // Restaurar botón

            btnGuardar.disabled = false;

            btnGuardar.innerHTML = `
                <i class="fa-solid fa-save mr-1"></i>
                Guardar cambios
            `;

        }

    });


    // =====================================================
    // CAMBIAR ESTADO
    // =====================================================

    window.cambiarEstadoLibro = function(id, estadoActual) {

        const accion =
            estadoActual
                ? 'desactivar'
                : 'activar';

        alert(
            `Aquí posteriormente podremos ${accion} el libro #${id}`
        );

    };


    // =====================================================
    // UTILIDADES
    // =====================================================

    function mostrarCargando() {

        estadoCargando.classList.remove('d-none');

        estadoVacio.classList.add('d-none');

    }


    function ocultarCargando() {

        estadoCargando.classList.add('d-none');

    }


    function mostrarError(mensaje) {

        ocultarCargando();

        tabla.innerHTML = '';

        estadoVacio.classList.remove('d-none');

        estadoVacio.innerHTML = `

            <div class="mb-3">

                <i class="fa-solid fa-triangle-exclamation fa-3x text-danger"></i>

            </div>

            <h6 class="font-weight-bold text-dark">
                Error al cargar libros
            </h6>

            <p class="text-muted small mb-0">
                ${escapeHtml(mensaje)}
            </p>

        `;

    }


    // Evitar insertar HTML proveniente de la BD

    function escapeHtml(valor) {

        const div = document.createElement('div');

        div.textContent = valor ?? '';

        return div.innerHTML;

    }


    // =====================================================
    // INICIO
    // =====================================================

    cargarLibros();

});