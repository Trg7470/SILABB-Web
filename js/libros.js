document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('tabla_libros');
    const total_libros = document.getElementById('total_libros');
    const estado_cargando = document.getElementById('estado_cargando');
    const estado_vacio = document.getElementById('estado_vacio');
    const info_paginacion = document.getElementById('info_paginacion');
    const btn_anterior = document.getElementById('btnAnterior');
    const btn_siguiente = document.getElementById('btnSiguiente');
    const pagina_actual = document.getElementById('paginaActual');
    const buscar_libro = document.getElementById('buscar_libro');
    const filtro_estado = document.getElementById('filtro_estado');
    const filtro_disponibilidad = document.getElementById('filtro_disponibilidad');
    const btn_buscar = document.getElementById('btn_buscar');
    const btn_limpiar = document.getElementById('btn_limpiar');
    let libros = [];
    let libros_filtrados = [];
    let pagina = 1;
    const registros_por_pagina = 10;
    // =====================================================
    // CARGAR LIBROS
    // =====================================================
    async function cargar_libros() {
        mostrar_cargando();
        try {
            const respuesta = await fetch('http://localhost:3000/api/libros');
            const resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.success) {
                throw new Error(
                    resultado.mensaje ||
                    'No fue posible obtener los libros'
                );
            }
            libros = resultado.data || [];
            libros_filtrados = [...libros];
            pagina = 1;
            actualizar_total();
            renderizar_tabla();
        } catch (error) {
            console.error('Error al cargar libros:', error);
            mostrar_error(error.message);
        }
    }
    // =====================================================
    // RENDERIZAR TABLA
    // =====================================================
    function renderizar_tabla() {
        tabla.innerHTML = '';
        ocultar_cargando();
        if (libros_filtrados.length === 0) {
            estado_vacio.classList.remove('d-none');
            info_paginacion.textContent = 'Mostrando 0 libros';
            pagina_actual.textContent = '1';
            btn_anterior.disabled = true;
            btn_siguiente.disabled = true;
            return;
        }
        estado_vacio.classList.add('d-none');
        const inicio = (pagina - 1) * registros_por_pagina;
        const fin = inicio + registros_por_pagina;
        const libros_pagina = libros_filtrados.slice(inicio, fin);
        libros_pagina.forEach(libro => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="pl-4 font-weight-bold text-muted">
                    #${libro.Id_Libro}
                </td>
                <td>
                    <span class="font-weight-bold">
                        ${escape_html(libro.Titulo)}
                    </span>
                </td>
                <td>
                    ${escape_html(libro.Autor || '—')}
                </td>
                <td>
                    ${escape_html(libro.Editorial || '—')}
                </td>
                <td>
                    <span class="badge badge-light border">
                        ${escape_html(libro.ISBN || '—')}
                    </span>
                </td>
                <td>
                    ${libro.Anio_Publicacion || '—'}
                </td>
                <td>
                    ${obtener_badge_estado(libro)}
                </td>
                <td class="text-center align-middle">
                    ${obtener_badge_disponibilidad(libro)}
                </td>
                <td class="text-center align-middle">
                    <div class="d-inline-flex justify-content-center align-items-center gap-1">
                        <button
                            class="btn btn-sm btn-outline-primary"
                            title="Editar"
                            onclick="editar_libro(${libro.Id_Libro})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button
                            class="btn btn-sm btn-outline-danger"
                            title="${libro.Activo ? 'Desactivar' : 'Activar'}"
                            onclick="cambiar_estado_libro(${libro.Id_Libro}, ${libro.Activo})">
                            <i class="fa-solid ${libro.Activo ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                    </div>
                </td>
            `;
            tabla.appendChild(fila);
        });
        const total = libros_filtrados.length;
        const mostrando_desde = inicio + 1;
        const mostrando_hasta = Math.min(fin, total);
        info_paginacion.textContent = `Mostrando ${mostrando_desde} a ${mostrando_hasta} de ${total} libros`;
        const total_paginas = Math.ceil(total / registros_por_pagina);
        pagina_actual.textContent = pagina;
        btn_anterior.disabled = pagina <= 1;
        btn_siguiente.disabled = pagina >= total_paginas;
    }
    // =====================================================
    // ESTADO DEL LIBRO
    // =====================================================
    function obtener_badge_estado(libro) {
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
    // =====================================================
    // DISPONIBILIDAD DEL LIBRO
    // =====================================================
    function obtener_badge_disponibilidad(libro) {
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
    function actualizar_total() {
        total_libros.textContent = `Total registrados: ${libros.length}`;
    }
    function actualizar_total_filtrados() {
        total_libros.textContent = `Resultados: ${libros_filtrados.length}`;
    }

    // =====================================================
// BUSCAR / FILTRAR
// =====================================================

function aplicar_filtros() {

    const termino =
        buscar_libro.value
            .trim()
            .toLowerCase();

    const estado =
        filtro_estado.value;

    const disponibilidad =
        filtro_disponibilidad.value;

    libros_filtrados =
        libros.filter(libro => {

            // -----------------------------------------
            // BÚSQUEDA POR TEXTO
            // -----------------------------------------

            const titulo =
                String(libro.Titulo ?? '')
                    .toLowerCase();

            const autor =
                String(libro.Autor ?? '')
                    .toLowerCase();

            const editorial =
                String(libro.Editorial ?? '')
                    .toLowerCase();

            const isbn =
                String(libro.ISBN ?? '')
                    .toLowerCase();

            const coincide_texto =
                !termino ||
                titulo.includes(termino) ||
                autor.includes(termino) ||
                editorial.includes(termino) ||
                isbn.includes(termino);

            // -----------------------------------------
            // FILTRO DE ESTADO
            // -----------------------------------------

            const coincide_estado =
                !estado ||
                (
                    estado === '1' &&
                    Boolean(libro.Activo)
                ) ||
                (
                    estado === '0' &&
                    !Boolean(libro.Activo)
                );

            // -----------------------------------------
            // FILTRO DE DISPONIBILIDAD
            // -----------------------------------------

            const coincide_disponibilidad =
                !disponibilidad ||
                (
                    disponibilidad === 'disponible' &&
                    Boolean(libro.Disponible)
                ) ||
                (
                    disponibilidad === 'prestado' &&
                    !Boolean(libro.Disponible)
                );

            return (
                coincide_texto &&
                coincide_estado &&
                coincide_disponibilidad
            );

        });

    pagina = 1;

    if (
        !termino &&
        estado === '' &&
        disponibilidad === ''
    ) {
        actualizar_total();
    } else {
        actualizar_total_filtrados();
    }

    renderizar_tabla();
}
    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================
    function limpiar_filtros() {
        modal_manager.establecer_valor(
            'buscar_libro',
            ''
        );
        filtro_estado.value = '';
        filtro_disponibilidad.value = '';
        libros_filtrados = [...libros];
        pagina = 1;
        actualizar_total();
        renderizar_tabla();
    }
    // =====================================================
    // PAGINACIÓN
    // =====================================================
    btn_anterior.addEventListener('click', () => {
        if (pagina > 1) {
            pagina--;
            renderizar_tabla();
        }
    });
    btn_siguiente.addEventListener('click', () => {
        const total_paginas = Math.ceil(
            libros_filtrados.length /
            registros_por_pagina
        );
        if (pagina < total_paginas) {
            pagina++;
            renderizar_tabla();
        }
    });


// =====================================================
// BOTONES Y FILTROS
// =====================================================

btn_buscar.addEventListener(
    'click',
    aplicar_filtros
);

btn_limpiar.addEventListener(
    'click',
    limpiar_filtros
);

// Búsqueda automática al escribir
buscar_libro.addEventListener(
    'input',
    aplicar_filtros
);

// Filtrar automáticamente al cambiar estado
filtro_estado.addEventListener(
    'change',
    aplicar_filtros
);

// Filtrar automáticamente al cambiar disponibilidad
filtro_disponibilidad.addEventListener(
    'change',
    aplicar_filtros
);

    // =====================================================
    // NUEVO LIBRO - ABRIR MODAL
    // =====================================================
    document
        .getElementById('btn_nuevo_libro')
        .addEventListener('click', () => {
            modal_manager.abrir_con_formulario(
                'modal_nuevo_libro',
                'form_nuevo_libro'
            );
        });
    // =====================================================
    // NUEVO LIBRO - GUARDAR
    // =====================================================
    document
        .getElementById('form_nuevo_libro')
        .addEventListener('submit', async event => {
            event.preventDefault();
            const titulo = modal_manager.obtener_valor('nuevo_titulo');
            const autor = modal_manager.obtener_valor('nuevo_autor');
            const editorial = modal_manager.obtener_valor('nuevo_editorial');
            const isbn = modal_manager.obtener_valor('nuevo_isbn');
            const anio_publicacion = modal_manager.obtener_valor('nuevo_anio');
            if (!titulo) {
                alert('El título del libro es obligatorio');
                return;
            }

            const usuario =
        JSON.parse(
            sessionStorage.getItem("usuario")
        );

        const id_usuario =
        usuario.Id_Usuario;

            const datos = {
                Titulo: titulo,
                Autor: autor || null,
                Editorial: editorial || null,
                ISBN: isbn || null,
                Anio_Publicacion: anio_publicacion || null,
                Id_Usuario: id_usuario
            };
            try {
                modal_manager.bloquear_boton(
                    'btn_guardar_nuevo',
                    'Guardando...'
                );
                const respuesta = await fetch(
                    'http://localhost:3000/api/libros',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(datos)
                    }
                );
                const resultado = await respuesta.json();
                if (!respuesta.ok || !resultado.success) {
                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible registrar el libro'
                    );
                }
                modal_manager.cerrar(
                    'modal_nuevo_libro'
                );
                const libro_nuevo = resultado.data;
                libros.push(libro_nuevo);
                libros.sort(
                    (a, b) => a.Id_Libro - b.Id_Libro
                );
                const hay_filtros =
                    buscar_libro.value.trim() !== '' ||
                    filtro_estado.value !== '' ||
                    filtro_disponibilidad.value !== '';
                if (!hay_filtros) {
                    libros_filtrados.push(libro_nuevo);
                    libros_filtrados.sort(
                        (a, b) => a.Id_Libro - b.Id_Libro
                    );
                }
                actualizar_total();
                renderizar_tabla();
                alert('Libro registrado correctamente');
            } catch (error) {
                console.error(
                    'Error al registrar libro:',
                    error
                );
                alert(error.message);
            } finally {
                modal_manager.desbloquear_boton(
                    'btn_guardar_nuevo'
                );
            }
        });
    // =====================================================
    // EDITAR
    // =====================================================
    window.editar_libro = async function(id) {
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
            modal_manager.establecer_valor(
                'editar_id_libro',
                libro.Id_Libro
            );
            modal_manager.establecer_valor(
                'editar_titulo',
                libro.Titulo
            );
            modal_manager.establecer_valor(
                'editar_autor',
                libro.Autor
            );
            modal_manager.establecer_valor(
                'editar_editorial',
                libro.Editorial
            );
            modal_manager.establecer_valor(
                'editar_isbn',
                libro.ISBN
            );
            modal_manager.establecer_valor(
                'editar_anio',
                libro.Anio_Publicacion
            );
            modal_manager.abrir(
                'modal_editar_libro'
            );
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
            const id = modal_manager.obtener_valor(
                'editar_id_libro'
            );
            const titulo = modal_manager.obtener_valor(
                'editar_titulo'
            );
            const autor = modal_manager.obtener_valor(
                'editar_autor'
            );
            const editorial = modal_manager.obtener_valor(
                'editar_editorial'
            );
            const isbn = modal_manager.obtener_valor(
                'editar_isbn'
            );
            const anio_publicacion = modal_manager.obtener_valor(
                'editar_anio'
            );
            if (!titulo) {
                alert('El título del libro es obligatorio');
                return;
            }
            const usuario =
        JSON.parse(
            sessionStorage.getItem("usuario")
        );  
        const id_usuario =
        usuario.Id_Usuario;
        
            const datos = {
                Titulo: titulo,
                Autor: autor || null,
                Editorial: editorial || null,
                ISBN: isbn || null,
                Anio_Publicacion: anio_publicacion || null,
                Id_Usuario: id_usuario
            };
            try {
                modal_manager.bloquear_boton(
                    'btn_guardar_edicion',
                    'Guardando...'
                );
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
                const resultado = await respuesta.json();
                if (!respuesta.ok || !resultado.success) {
                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible actualizar el libro'
                    );
                }
                modal_manager.cerrar(
                    'modal_editar_libro'
                );
                const libro_actualizado = resultado.data;
                const indice = libros.findIndex(
                    libro =>
                        libro.Id_Libro ===
                        libro_actualizado.Id_Libro
                );
                if (indice !== -1) {
                    libros[indice] = libro_actualizado;
                }
                const indice_filtrado = libros_filtrados.findIndex(
                    libro =>
                        libro.Id_Libro ===
                        libro_actualizado.Id_Libro
                );
                if (indice_filtrado !== -1) {
                    libros_filtrados[indice_filtrado] =
                        libro_actualizado;
                }
                renderizar_tabla();
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
                modal_manager.desbloquear_boton(
                    'btn_guardar_edicion'
                );
            }
        });
    // =====================================================
    // CAMBIAR ESTADO
    // =====================================================
    window.cambiar_estado_libro = async function(id, estado_actual) {
        const accion = estado_actual
            ? 'desactivar'
            : 'activar';
        const confirmar = confirm(
            `¿Estás seguro de que deseas ${accion} el libro #${id}?`
        );
        if (!confirmar) {
            return;
        }

        const usuario=json.parse(sessionStorage.getItem("usuario"));
                    if(!usuario || !usuario.Id_Usuario){
                        alert("No se encontró la información del usuario. Por favor, inicia sesión nuevamente.");
                        return;
                    }
                    const id_usuario=usuario.Id_Usuario;
        try {

            const respuesta = await fetch(
                `http://localhost:3000/api/libros/${id}/estado`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    
                    body: JSON.stringify({
                        Activo: !estado_actual,
                        Id_Usuario: id_usuario
                    })
                }
            );
            const resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.success) {
                throw new Error(
                    resultado.mensaje ||
                    `No fue posible ${accion} el libro`
                );
            }
            const libro_actualizado = resultado.data;
            const indice = libros.findIndex(
                libro =>
                    libro.Id_Libro ===
                    libro_actualizado.Id_Libro
            );
            if (indice !== -1) {
                libros[indice] = libro_actualizado;
            }
            const indice_filtrado = libros_filtrados.findIndex(
                libro =>
                    libro.Id_Libro ===
                    libro_actualizado.Id_Libro
            );
            if (indice_filtrado !== -1) {
                libros_filtrados[indice_filtrado] =
                    libro_actualizado;
            }
            renderizar_tabla();
            alert(
                `Libro ${
                    accion === 'activar'
                        ? 'activado'
                        : 'desactivado'
                } correctamente`
            );
        } catch (error) {
            console.error(
                'Error al cambiar estado del libro:',
                error
            );
            alert(error.message);
        }
    };
    // =====================================================
    // UTILIDADES
    // =====================================================
    function mostrar_cargando() {
        estado_cargando.classList.remove('d-none');
        estado_vacio.classList.add('d-none');
    }
    function ocultar_cargando() {
        estado_cargando.classList.add('d-none');
    }
    function mostrar_error(mensaje) {
        ocultar_cargando();
        tabla.innerHTML = '';
        estado_vacio.classList.remove('d-none');
        estado_vacio.innerHTML = `
            <div class="mb-3">
                <i class="fa-solid fa-triangle-exclamation fa-3x text-danger"></i>
            </div>
            <h6 class="font-weight-bold text-dark">
                Error al cargar libros
            </h6>
            <p class="text-muted small mb-0">
                ${escape_html(mensaje)}
            </p>
        `;
    }
    function escape_html(valor) {
        const div = document.createElement('div');
        div.textContent = valor ?? '';
        return div.innerHTML;
    }
    // =====================================================
    // INICIO
    // =====================================================
    cargar_libros();
});