document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_URL = 'http://localhost:3000/api';

    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================

    const tabla_prestamos = document.getElementById('tabla_prestamos');
    const total_prestamos = document.getElementById('total_prestamos');

    const buscar_prestamo = document.getElementById('buscar_prestamo');
    const filtro_estado = document.getElementById('filtro_estado');
    const filtro_fecha = document.getElementById('filtro_fecha');

    const btn_limpiar = document.getElementById('btn_limpiar');
    const btn_buscar = document.getElementById('btn_buscar');

    const estado_vacio = document.getElementById('estado_vacio');
    const estado_cargando = document.getElementById('estado_cargando');

    const info_paginacion = document.getElementById('info_paginacion');
    const btnAnterior = document.getElementById('btnAnterior');
    const paginaActual = document.getElementById('paginaActual');
    const btnSiguiente = document.getElementById('btnSiguiente');

    const btn_nuevo_prestamo = document.getElementById('btn_nuevo_prestamo');

    // ==========================================
    // VARIABLES
    // ==========================================

    let prestamos = [];
    let prestamos_filtrados = [];

    let pagina_actual = 1;
    const registros_por_pagina = 10;

    // ==========================================
    // CARGAR PRÉSTAMOS
    // ==========================================

    async function cargar_prestamos() {

        mostrar_cargando();

        try {

            /*
             * Primero actualizamos los préstamos
             * que ya hayan vencido.
             */
            try {

                await fetch(`${API_URL}/prestamos/actualizar-vencidos`, {
                    method: 'PATCH'
                });

            } catch (error) {

                console.warn(
                    'No fue posible actualizar los vencidos:',
                    error
                );

            }

            // Obtener todos los préstamos
            const respuesta = await fetch(
                `${API_URL}/prestamos`
            );

            if (!respuesta.ok) {
                throw new Error(
                    'No fue posible obtener los préstamos'
                );
            }

            const resultado = await respuesta.json();

            if (!resultado.success) {
                throw new Error(
                    resultado.mensaje ||
                    'Error al obtener préstamos'
                );
            }

            prestamos = resultado.data || [];

            prestamos_filtrados = [...prestamos];

            pagina_actual = 1;

            renderizar_tabla();

        } catch (error) {

            console.error(
                'Error al cargar préstamos:',
                error
            );

            mostrar_error(
                error.message ||
                'No fue posible cargar los préstamos'
            );

        } finally {

            ocultar_cargando();

        }
    }

    // ==========================================
    // RENDERIZAR TABLA
    // ==========================================

    function renderizar_tabla() {

        if (!tabla_prestamos) return;

        tabla_prestamos.innerHTML = '';

        // No hay registros
        if (prestamos_filtrados.length === 0) {

            mostrar_vacio();

            actualizar_paginacion();

            return;
        }

        ocultar_vacio();

        // Calcular registros de la página
        const inicio =
            (pagina_actual - 1) *
            registros_por_pagina;

        const fin =
            inicio +
            registros_por_pagina;

        const registros_pagina =
            prestamos_filtrados.slice(inicio, fin);

        registros_pagina.forEach(prestamo => {

            const fila =
                document.createElement('tr');

            const estado_badge =
                obtener_badge_estado(
                    prestamo.Estado
                );

            const fecha_prestamo =
                formatear_fecha(
                    prestamo.Fecha_Prestamo
                );

            const fecha_vencimiento =
                formatear_fecha(
                    prestamo.Fecha_Vencimiento
                );

            const fecha_devolucion =
                prestamo.Fecha_Devolucion
                    ? formatear_fecha(
                        prestamo.Fecha_Devolucion
                    )
                    : '<span class="text-muted">Pendiente</span>';

            fila.innerHTML = `
                <td>
                    ${escape_html(
                        prestamo.Id_Prestamo
                    )}
                </td>

                <td>
                    ${escape_html(
                        prestamo.Alumno || 'Sin nombre'
                    )}
                </td>

                <td>
                    ${escape_html(
                        prestamo.Numero_Control || 'Sin registro'
                    )}
                </td>

                <td>
                    <strong>
                        ${escape_html(
                            prestamo.Titulo || 'Sin título'
                        )}
                    </strong>

                    ${
                        prestamo.Autor
                            ? `
                                <br>
                                <small class="text-muted">
                                    ${escape_html(
                                        prestamo.Autor
                                    )}
                                </small>
                            `
                            : ''
                    }
                </td>

                <td>
                    ${fecha_prestamo}
                </td>

                <td>
                    ${fecha_vencimiento}
                </td>

                <td>
                    ${fecha_devolucion}
                </td>

                <td>
                    ${estado_badge}
                </td>

                <td>
                    <div class="d-flex">

                        <button
                            type="button"
                            class="btn btn-info btn-sm mr-1"
                            onclick="ver_detalle_prestamo(${prestamo.Id_Prestamo})"
                            title="Ver detalle"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        ${
                            prestamo.Estado !== 'DEVUELTO'
                                ? `
                                    <button
                                        type="button"
                                        class="btn btn-success btn-sm"
                                        onclick="devolver_prestamo(${prestamo.Id_Prestamo})"
                                        title="Registrar devolución"
                                    >
                                        <i class="fa-solid fa-rotate-left"></i>
                                    </button>
                                `
                                : ''
                        }

                    </div>
                </td>
            `;

            tabla_prestamos.appendChild(fila);

        });

        actualizar_total();

        actualizar_paginacion();

    }

    // ==========================================
    // BADGE DE ESTADO
    // ==========================================

    function obtener_badge_estado(estado) {

        switch (estado) {

            case 'PRESTADO':

                return `
                    <span class="badge badge-primary">
                        <i class="fa-solid fa-book mr-1"></i>
                        Prestado
                    </span>
                `;

            case 'VENCIDO':

                return `
                    <span class="badge badge-danger">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i>
                        Vencido
                    </span>
                `;

            case 'DEVUELTO':

                return `
                    <span class="badge badge-success">
                        <i class="fa-solid fa-check mr-1"></i>
                        Devuelto
                    </span>
                `;

            default:

                return `
                    <span class="badge badge-secondary">
                        ${escape_html(
                            estado || 'Desconocido'
                        )}
                    </span>
                `;
        }

    }

    // ==========================================
    // FORMATEAR FECHA
    // ==========================================

    function formatear_fecha(fecha) {

        if (!fecha) {
            return '<span class="text-muted">No registrada</span>';
        }

        const fecha_objeto =
            new Date(fecha);

        if (isNaN(fecha_objeto.getTime())) {
            return 'Fecha inválida';
        }

        return fecha_objeto.toLocaleString(
            'es-MX',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    }

    // ==========================================
    // ACTUALIZAR TOTAL
    // ==========================================

    function actualizar_total() {

        if (total_prestamos) {

            total_prestamos.textContent =
                prestamos_filtrados.length;

        }

    }

    // ==========================================
    // BÚSQUEDA Y FILTROS
    // ==========================================

    function aplicar_filtros() {

        const termino =
            buscar_prestamo
                ? buscar_prestamo.value
                    .trim()
                    .toLowerCase()
                : '';

        const estado =
            filtro_estado
                ? filtro_estado.value
                : '';

        const tipo_fecha =
            filtro_fecha
                ? filtro_fecha.value
                : '';

        prestamos_filtrados =
            prestamos.filter(prestamo => {

                // -----------------------------
                // BÚSQUEDA
                // -----------------------------

                let coincide_busqueda = true;

                if (termino) {

                    const alumno =
                        (
                            prestamo.Alumno ||
                            ''
                        ).toLowerCase();

                    const numero_control =
                        (
                            prestamo.Numero_Control ||
                            ''
                        ).toLowerCase();

                    const libro =
                        (
                            prestamo.Titulo ||
                            ''
                        ).toLowerCase();

                    coincide_busqueda =
                        alumno.includes(termino) ||
                        numero_control.includes(termino) ||
                        libro.includes(termino);

                }

                // -----------------------------
                // ESTADO
                // -----------------------------

                let coincide_estado = true;

                if (estado) {

                    coincide_estado =
                        prestamo.Estado === estado;

                }

                // -----------------------------
                // FECHA
                // -----------------------------

                let coincide_fecha = true;

                if (tipo_fecha) {

                    let fecha = '';

                    switch (tipo_fecha) {

                        case 'prestamo':
                            fecha =
                                prestamo.Fecha_Prestamo;
                            break;

                        case 'vencimiento':
                            fecha =
                                prestamo.Fecha_Vencimiento;
                            break;

                        case 'devolucion':
                            fecha =
                                prestamo.Fecha_Devolucion;
                            break;

                    }

                    /*
                     * Por ahora el selector de fecha
                     * se utiliza para indicar qué campo
                     * de fecha revisar.
                     *
                     * No se filtra por un rango porque
                     * el HTML actual no tiene inputs
                     * de fecha.
                     */

                    coincide_fecha =
                        Boolean(fecha);

                }

                return (
                    coincide_busqueda &&
                    coincide_estado &&
                    coincide_fecha
                );

            });

        pagina_actual = 1;

        renderizar_tabla();

    }

    // ==========================================
    // LIMPIAR FILTROS
    // ==========================================

    function limpiar_filtros() {

        if (buscar_prestamo) {
            modal_manager.establecer_valor(
                'buscar_prestamo',
                ''
            );
        }

        if (filtro_estado) {
            modal_manager.establecer_valor(
                'filtro_estado',
                ''
            );
        }

        if (filtro_fecha) {
            modal_manager.establecer_valor(
                'filtro_fecha',
                ''
            );
        }

        prestamos_filtrados =
            [...prestamos];

        pagina_actual = 1;

        renderizar_tabla();

    }

    // ==========================================
    // PAGINACIÓN
    // ==========================================

    function actualizar_paginacion() {

        const total_registros =
            prestamos_filtrados.length;

        const total_paginas =
            Math.ceil(
                total_registros /
                registros_por_pagina
            );

        const pagina =
            total_paginas === 0
                ? 0
                : pagina_actual;

        if (paginaActual) {

            paginaActual.textContent =
                pagina;

        }

        if (info_paginacion) {

            info_paginacion.textContent =
                total_registros === 0
                    ? '0 registros'
                    : `${total_registros} registros`;

        }

        if (btnAnterior) {

            btnAnterior.disabled =
                pagina_actual <= 1;

        }

        if (btnSiguiente) {

            btnSiguiente.disabled =
                pagina_actual >= total_paginas ||
                total_paginas === 0;

        }

    }

    // ==========================================
    // BOTÓN ANTERIOR
    // ==========================================

    if (btnAnterior) {

        btnAnterior.addEventListener(
            'click',
            () => {

                if (pagina_actual > 1) {

                    pagina_actual--;

                    renderizar_tabla();

                }

            }
        );

    }

    // ==========================================
    // BOTÓN SIGUIENTE
    // ==========================================

    if (btnSiguiente) {

        btnSiguiente.addEventListener(
            'click',
            () => {

                const total_paginas =
                    Math.ceil(
                        prestamos_filtrados.length /
                        registros_por_pagina
                    );

                if (
                    pagina_actual <
                    total_paginas
                ) {

                    pagina_actual++;

                    renderizar_tabla();

                }

            }
        );

    }

    // ==========================================
    // BOTÓN BUSCAR
    // ==========================================

    if (btn_buscar) {

        btn_buscar.addEventListener(
            'click',
            aplicar_filtros
        );

    }

    // ==========================================
    // ENTER EN BÚSQUEDA
    // ==========================================

    if (buscar_prestamo) {

        buscar_prestamo.addEventListener(
            'keydown',
            event => {

                if (event.key === 'Enter') {

                    event.preventDefault();

                    aplicar_filtros();

                }

            }
        );

    }

    // ==========================================
    // CAMBIO DE ESTADO
    // ==========================================

    if (filtro_estado) {

        filtro_estado.addEventListener(
            'change',
            aplicar_filtros
        );

    }

    // ==========================================
    // CAMBIO DE FECHA
    // ==========================================

    if (filtro_fecha) {

        filtro_fecha.addEventListener(
            'change',
            aplicar_filtros
        );

    }

    // ==========================================
    // LIMPIAR
    // ==========================================

    if (btn_limpiar) {

        btn_limpiar.addEventListener(
            'click',
            limpiar_filtros
        );

    }

    // ==========================================
    // NUEVO PRÉSTAMO
    // ==========================================

    if (btn_nuevo_prestamo) {

        btn_nuevo_prestamo.addEventListener(
            'click',
            async () => {

                modal_manager.abrir_con_formulario(
                    'modal_nuevo_prestamo',
                    'form_nuevo_prestamo'
                );

                await cargar_alumnos();

                await cargar_libros_disponibles();

                establecer_fechas_nuevo_prestamo();

            }
        );

    }

    // ==========================================
    // CARGAR ALUMNOS
    // ==========================================

    async function cargar_alumnos() {

        const select =
            document.getElementById(
                'nuevo_id_alumno'
            );

        if (!select) return;

        try {

            select.innerHTML = `
                <option value="">
                    Cargando alumnos...
                </option>
            `;

            const respuesta =
                await fetch(
                    `${API_URL}/alumnos/`
                );

            if (!respuesta.ok) {

                throw new Error(
                    'No fue posible obtener los alumnos'
                );

            }

            const resultado =
                await respuesta.json();

            if (!resultado.success) {

                throw new Error(
                    resultado.mensaje ||
                    'Error al obtener alumnos'
                );

            }

            const alumnos =
                resultado.data || [];

            select.innerHTML = `
                <option value="">
                    Seleccionar alumno...
                </option>
            `;

            alumnos
                .filter(alumno => alumno.Activo)
                .forEach(alumno => {

                    const opcion =
                        document.createElement('option');

                    opcion.value =
                        alumno.Id_Alumno;

                    opcion.textContent =
                        `${alumno.Numero_Control} - ${alumno.Nombre}`;

                    select.appendChild(opcion);

                });

        } catch (error) {

            console.error(
                'Error al cargar alumnos:',
                error
            );

            select.innerHTML = `
                <option value="">
                    Error al cargar alumnos
                </option>
            `;

            mostrar_error(
                error.message
            );

        }

    }

    // ==========================================
    // CARGAR LIBROS DISPONIBLES
    // ==========================================

    async function cargar_libros_disponibles() {

        const select =
            document.getElementById(
                'nuevo_id_libro'
            );

        if (!select) return;

        try {

            select.innerHTML = `
                <option value="">
                    Cargando libros...
                </option>
            `;

            const respuesta =
                await fetch(
                    `${API_URL}/libros/disponibles`
                );

            if (!respuesta.ok) {

                throw new Error(
                    'No fue posible obtener los libros disponibles'
                );

            }

            const resultado =
                await respuesta.json();

            if (!resultado.success) {

                throw new Error(
                    resultado.mensaje ||
                    'Error al obtener libros disponibles'
                );

            }

            const libros =
                resultado.data || [];

            select.innerHTML = `
                <option value="">
                    Seleccionar libro disponible...
                </option>
            `;

            libros.forEach(libro => {

                const opcion =
                    document.createElement('option');

                opcion.value =
                    libro.Id_Libro;

                opcion.textContent =
                    `${libro.Titulo} - ${libro.Autor || 'Autor desconocido'}`;

                select.appendChild(opcion);

            });

        } catch (error) {

            console.error(
                'Error al cargar libros disponibles:',
                error
            );

            select.innerHTML = `
                <option value="">
                    Error al cargar libros
                </option>
            `;

            mostrar_error(
                error.message
            );

        }

    }

    // ==========================================
    // ESTABLECER FECHAS
    // ==========================================

    function establecer_fechas_nuevo_prestamo() {

        const fecha_prestamo =
            document.getElementById(
                'nuevo_fecha_prestamo'
            );

        const fecha_vencimiento =
            document.getElementById(
                'nuevo_fecha_vencimiento'
            );

        if (!fecha_prestamo) return;

        const ahora = new Date();

        const formato_datetime =
            fecha => {

                const year =
                    fecha.getFullYear();

                const month =
                    String(
                        fecha.getMonth() + 1
                    ).padStart(2, '0');

                const day =
                    String(
                        fecha.getDate()
                    ).padStart(2, '0');

                const hours =
                    String(
                        fecha.getHours()
                    ).padStart(2, '0');

                const minutes =
                    String(
                        fecha.getMinutes()
                    ).padStart(2, '0');

                return `${year}-${month}-${day}T${hours}:${minutes}`;

            };

        modal_manager.establecer_valor(
            'nuevo_fecha_prestamo',
            formato_datetime(ahora)
        );

        /*
         * Dejamos la fecha de vencimiento
         * sin establecer automáticamente.
         */
        modal_manager.establecer_valor(
            'nuevo_fecha_vencimiento',
            ''
        );

    }

    // ==========================================
    // CREAR PRÉSTAMO
    // ==========================================

    const form_nuevo_prestamo =
        document.getElementById(
            'form_nuevo_prestamo'
        );

    if (form_nuevo_prestamo) {

        form_nuevo_prestamo.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const id_alumno =
                    modal_manager.obtener_valor(
                        'nuevo_id_alumno'
                    );

                const id_libro =
                    modal_manager.obtener_valor(
                        'nuevo_id_libro'
                    );

                const fecha_prestamo =
                    modal_manager.obtener_valor(
                        'nuevo_fecha_prestamo'
                    );

                const fecha_vencimiento =
                    modal_manager.obtener_valor(
                        'nuevo_fecha_vencimiento'
                    );

                // -----------------------------
                // Validaciones básicas
                // -----------------------------

                if (!id_alumno) {

                    mostrar_advertencia(
                        'Selecciona un alumno'
                    );

                    return;

                }

                if (!id_libro) {

                    mostrar_advertencia(
                        'Selecciona un libro'
                    );

                    return;

                }

                if (!fecha_prestamo) {

                    mostrar_advertencia(
                        'Selecciona la fecha de préstamo'
                    );

                    return;

                }

                if (!fecha_vencimiento) {

                    mostrar_advertencia(
                        'Selecciona la fecha de vencimiento'
                    );

                    return;

                }

                // -----------------------------
                // Obtener usuario de sesión
                // -----------------------------

                const usuario =
                    obtener_usuario_sesion();

                if (!usuario) {

                    mostrar_error(
                        'No se encontró el usuario de la sesión'
                    );

                    return;

                }

                const id_usuario =
                    usuario.Id_Usuario;

                if (!id_usuario) {

                    mostrar_error(
                        'No se encontró el Id_Usuario'
                    );

                    return;

                }

                // -----------------------------
                // Datos
                // -----------------------------

                const data = {

                    Id_Alumno:
                        Number(id_alumno),

                    Id_Libro:
                        Number(id_libro),

                    Fecha_Prestamo:
                        fecha_prestamo,

                    Fecha_Vencimiento:
                        fecha_vencimiento,

                    Id_Usuario:
                        Number(id_usuario)

                };

                try {

                    modal_manager.bloquear_boton(
                        'btn_guardar_nuevo',
                        'Guardando...'
                    );

                    const respuesta =
                        await fetch(
                            `${API_URL}/prestamos`,
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );

                    const resultado =
                        await respuesta.json();

                    if (!respuesta.ok ||
                        !resultado.success) {

                        throw new Error(
                            resultado.mensaje ||
                            'No fue posible crear el préstamo'
                        );

                    }

                    modal_manager.cerrar_con_formulario(
                        'modal_nuevo_prestamo',
                        'form_nuevo_prestamo'
                    );

                    mostrar_exito(
                        'Préstamo creado correctamente'
                    );

                    await cargar_prestamos();

                } catch (error) {

                    console.error(
                        'Error al crear préstamo:',
                        error
                    );

                    mostrar_error(
                        error.message
                    );

                } finally {

                    modal_manager.desbloquear_boton(
                        'btn_guardar_nuevo'
                    );

                }

            }
        );

    }

    // ==========================================
    // VER DETALLE
    // ==========================================

    window.ver_detalle_prestamo =
        async function (id) {

            try {

                const respuesta =
                    await fetch(
                        `${API_URL}/prestamos/${id}`
                    );

                if (!respuesta.ok) {

                    throw new Error(
                        'No fue posible obtener el préstamo'
                    );

                }

                const resultado =
                    await respuesta.json();

                if (!resultado.success) {

                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible obtener el préstamo'
                    );

                }

                const prestamo =
                    resultado.data;

                llenar_detalle_prestamo(
                    prestamo
                );

                modal_manager.abrir(
                    'modal_detalle_prestamo'
                );

            } catch (error) {

                console.error(
                    'Error al obtener detalle:',
                    error
                );

                mostrar_error(
                    error.message
                );

            }

        };

    // ==========================================
    // LLENAR MODAL DE DETALLE
    // ==========================================

    function llenar_detalle_prestamo(prestamo) {

        modal_manager.establecer_valor(
            'detalle_id_prestamo',
            prestamo.Id_Prestamo
        );

        modal_manager.establecer_valor(
            'detalle_alumno',
            prestamo.Alumno
        );

        modal_manager.establecer_valor(
            'detalle_numero_control',
            prestamo.Numero_Control
        );

        modal_manager.establecer_valor(
            'detalle_carrera',
            prestamo.Carrera
        );

        modal_manager.establecer_valor(
            'detalle_libro',
            prestamo.Titulo
        );

        modal_manager.establecer_valor(
            'detalle_fecha_prestamo',
            convertir_fecha_input(
                prestamo.Fecha_Prestamo
            )
        );

        modal_manager.establecer_valor(
            'detalle_fecha_vencimiento',
            convertir_fecha_input(
                prestamo.Fecha_Vencimiento
            )
        );

        modal_manager.establecer_valor(
            'detalle_fecha_devolucion',
            prestamo.Fecha_Devolucion
                ? convertir_fecha_input(
                    prestamo.Fecha_Devolucion
                )
                : 'Pendiente'
        );

        modal_manager.establecer_valor(
            'detalle_usuario',
            prestamo.Usuario
        );

        establecer_estado_detalle(
            prestamo.Estado
        );

    }

    // ==========================================
    // ESTADO EN MODAL DE DETALLE
    // ==========================================

    function establecer_estado_detalle(estado) {

        const elemento =
            document.getElementById(
                'detalle_estado'
            );

        if (!elemento) return;

        elemento.innerHTML =
            obtener_badge_estado(estado);

    }

    // ==========================================
    // DEVOLVER PRÉSTAMO
    // ==========================================

    window.devolver_prestamo =
        async function (id) {

            const usuario =
                obtener_usuario_sesion();

            if (!usuario) {

                mostrar_error(
                    'No se encontró el usuario de la sesión'
                );

                return;

            }

            const id_usuario =
                usuario.Id_Usuario;

            if (!id_usuario) {

                mostrar_error(
                    'No se encontró el Id_Usuario'
                );

                return;

            }

            const confirmar =
                await confirmar_accion(
                    '¿Registrar devolución?',
                    'El préstamo se marcará como devuelto.'
                );

            if (!confirmar) return;

            try {

                const respuesta =
                    await fetch(
                        `${API_URL}/prestamos/${id}/devolver`,
                        {
                            method: 'PATCH',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    Id_Usuario:
                                        Number(id_usuario)
                                })
                        }
                    );

                const resultado =
                    await respuesta.json();

                if (!respuesta.ok ||
                    !resultado.success) {

                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible registrar la devolución'
                    );

                }

                modal_manager.cerrar(
                    'modal_detalle_prestamo'
                );

                mostrar_exito(
                    'Préstamo devuelto correctamente'
                );

                await cargar_prestamos();

            } catch (error) {

                console.error(
                    'Error al devolver préstamo:',
                    error
                );

                mostrar_error(
                    error.message
                );

            }

        };

    // ==========================================
    // OBTENER USUARIO DE SESIÓN
    // ==========================================

    function obtener_usuario_sesion() {

        try {

            const usuario =
                sessionStorage.getItem(
                    'usuario'
                );

            if (!usuario) {
                return null;
            }

            return JSON.parse(usuario);

        } catch (error) {

            console.error(
                'Error al obtener usuario:',
                error
            );

            return null;

        }

    }

    // ==========================================
    // CONVERTIR FECHA PARA INPUT
    // ==========================================

    function convertir_fecha_input(fecha) {

        if (!fecha) {
            return '';
        }

        const fecha_objeto =
            new Date(fecha);

        if (isNaN(fecha_objeto.getTime())) {
            return '';
        }

        const year =
            fecha_objeto.getFullYear();

        const month =
            String(
                fecha_objeto.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                fecha_objeto.getDate()
            ).padStart(2, '0');

        const hours =
            String(
                fecha_objeto.getHours()
            ).padStart(2, '0');

        const minutes =
            String(
                fecha_objeto.getMinutes()
            ).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;

    }

    // ==========================================
    // MOSTRAR CARGANDO
    // ==========================================

    function mostrar_cargando() {

        if (estado_cargando) {

            estado_cargando.style.display =
                'block';

        }

        if (estado_vacio) {

            estado_vacio.style.display =
                'none';

        }

    }

    // ==========================================
    // OCULTAR CARGANDO
    // ==========================================

    function ocultar_cargando() {

        if (estado_cargando) {

            estado_cargando.style.display =
                'none';

        }

    }

    // ==========================================
    // MOSTRAR VACÍO
    // ==========================================

    function mostrar_vacio() {

        if (estado_vacio) {

            estado_vacio.style.display =
                'block';

        }

    }

    // ==========================================
    // OCULTAR VACÍO
    // ==========================================

    function ocultar_vacio() {

        if (estado_vacio) {

            estado_vacio.style.display =
                'none';

        }

    }

    // ==========================================
    // MENSAJE DE ERROR
    // ==========================================

    function mostrar_error(mensaje) {

        if (
            typeof Swal !== 'undefined'
        ) {

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje
            });

        } else {

            alert(mensaje);

        }

    }

    // ==========================================
    // MENSAJE DE ÉXITO
    // ==========================================

    function mostrar_exito(mensaje) {

        if (
            typeof Swal !== 'undefined'
        ) {

            Swal.fire({
                icon: 'success',
                title: 'Correcto',
                text: mensaje,
                timer: 2000,
                showConfirmButton: false
            });

        } else {

            alert(mensaje);

        }

    }

    // ==========================================
    // MENSAJE DE ADVERTENCIA
    // ==========================================

    function mostrar_advertencia(mensaje) {

        if (
            typeof Swal !== 'undefined'
        ) {

            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: mensaje
            });

        } else {

            alert(mensaje);

        }

    }

    // ==========================================
    // CONFIRMAR ACCIÓN
    // ==========================================

    async function confirmar_accion(
        titulo,
        texto
    ) {

        if (
            typeof Swal === 'undefined'
        ) {

            return confirm(
                `${titulo}\n\n${texto}`
            );

        }

        const resultado =
            await Swal.fire({

                icon: 'question',

                title: titulo,

                text: texto,

                showCancelButton: true,

                confirmButtonText:
                    'Sí, continuar',

                cancelButtonText:
                    'Cancelar'

            });

        return resultado.isConfirmed;

    }

    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    function escape_html(valor) {

        if (valor === null ||
            valor === undefined) {

            return '';

        }

        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }

    // ==========================================
    // INICIALIZAR
    // ==========================================

    cargar_prestamos();

});