document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_URL = 'http://localhost:3000/api';

    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================

    const tabla_adeudos = document.getElementById('tabla_adeudos');
    const total_adeudos = document.getElementById('total_adeudos');
    const buscar_adeudo = document.getElementById('buscar_adeudo');
    const filtro_estado = document.getElementById('filtro_estado');
    const btn_limpiar = document.getElementById('btn_limpiar');
    const btn_buscar = document.getElementById('btn_buscar');
    const estado_vacio = document.getElementById('estado_vacio');
    const estado_cargando = document.getElementById('estado_cargando');
    const info_paginacion = document.getElementById('info_paginacion');
    const btnAnterior = document.getElementById('btnAnterior');
    const paginaActual = document.getElementById('paginaActual');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btn_nuevo_adeudo = document.getElementById('btn_nuevo_adeudo');

    // ==========================================
    // VARIABLES
    // ==========================================

    let adeudos = [];
    let adeudos_filtrados = [];
    let prestamos = [];

    let pagina_actual = 1;

    const registros_por_pagina = 10;

    // ==========================================
    // CARGAR ADEUDOS
    // ==========================================

    async function cargar_adeudos() {

        mostrar_cargando();

        try {

            // ==========================================
            // OBTENER ADEUDOS
            // ==========================================

            const respuesta_adeudos =
                await fetch(`${API_URL}/adeudos`);

            if (!respuesta_adeudos.ok) {
                throw new Error(
                    'No fue posible obtener los adeudos'
                );
            }

            const resultado_adeudos =
                await respuesta_adeudos.json();

            if (!resultado_adeudos.success) {
                throw new Error(
                    resultado_adeudos.mensaje ||
                    'Error al obtener adeudos'
                );
            }

            const datos_adeudos =
                resultado_adeudos.data || [];

            // ==========================================
            // OBTENER PRÉSTAMOS
            // ==========================================

            const respuesta_prestamos =
                await fetch(`${API_URL}/prestamos`);

            if (!respuesta_prestamos.ok) {
                throw new Error(
                    'No fue posible obtener los préstamos'
                );
            }

            const resultado_prestamos =
                await respuesta_prestamos.json();

            if (!resultado_prestamos.success) {
                throw new Error(
                    resultado_prestamos.mensaje ||
                    'Error al obtener préstamos'
                );
            }

            prestamos =
                resultado_prestamos.data || [];

            // ==========================================
            // COMBINAR INFORMACIÓN
            // ==========================================

            adeudos =
                datos_adeudos.map(adeudo => {

                    const prestamo =
                        prestamos.find(
                            p =>
                                Number(p.Id_Prestamo) ===
                                Number(adeudo.Id_Prestamo)
                        );

                    return {
                        ...adeudo,
                        prestamo: prestamo || null
                    };
                });

            adeudos_filtrados =
                [...adeudos];

            pagina_actual = 1;

            renderizar_tabla();

        } catch (error) {

            console.error(
                'Error al cargar adeudos:',
                error
            );

            mostrar_error(
                error.message ||
                'No fue posible cargar los adeudos'
            );

        } finally {

            ocultar_cargando();

        }
    }

    // ==========================================
    // RENDERIZAR TABLA
    // ==========================================

    function renderizar_tabla() {

        if (!tabla_adeudos) return;

        tabla_adeudos.innerHTML = '';

        if (adeudos_filtrados.length === 0) {

            mostrar_vacio();

            actualizar_total();
            actualizar_paginacion();

            return;
        }

        ocultar_vacio();

        const inicio =
            (pagina_actual - 1) *
            registros_por_pagina;

        const fin =
            inicio +
            registros_por_pagina;

        const registros_pagina =
            adeudos_filtrados.slice(
                inicio,
                fin
            );

        registros_pagina.forEach(adeudo => {

            const prestamo =
                adeudo.prestamo;

            // ==========================================
            // INFORMACIÓN DEL ALUMNO
            // ==========================================

            const nombre_completo =
                prestamo
                    ? `${prestamo.Nombre ?? ''} ${prestamo.Apellido_Paterno ?? ''} ${prestamo.Apellido_Materno ?? ''}`.trim()
                    : 'Alumno no disponible';

            const iniciales =
                obtener_iniciales(nombre_completo);

            // ==========================================
            // INFORMACIÓN DEL LIBRO
            // ==========================================

            const titulo_libro =
                prestamo?.Titulo ||
                'Libro no disponible';

            // ==========================================
            // NÚMERO DE CONTROL
            // ==========================================

            const numero_control =
                prestamo?.Numero_Control ||
                'Sin registro';

            // ==========================================
            // FECHAS
            // ==========================================

            const fecha_creacion =
                formatear_fecha(
                    adeudo.Fecha_Creacion
                );

            const fecha_resolucion =
                adeudo.Fecha_Resolucion
                    ? formatear_fecha(
                        adeudo.Fecha_Resolucion
                    )
                    : '<span class="text-muted">Pendiente</span>';

            // ==========================================
            // ESTADO
            // ==========================================

            const estado_badge =
                obtener_badge_estado(
                    adeudo.Estado
                );

            // ==========================================
            // CREAR FILA
            // ==========================================

            const fila =
                document.createElement('tr');

            fila.innerHTML = `

                <!-- ID -->
                <td class="pl-4 font-weight-bold text-muted">

                    #${escape_html(
                        adeudo.Id_Adeudo
                    )}

                </td>

                <!-- ALUMNO -->
                <td>

                    <div class="d-flex align-items-center">

                        <div
                            class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-2 font-weight-bold"
                            style="
                                width: 32px;
                                height: 32px;
                                font-size: 0.75rem;
                            "
                        >
                            ${escape_html(iniciales)}
                        </div>

                        <div>

                            <span class="font-weight-bold">

                                ${escape_html(
                                    nombre_completo
                                )}

                            </span>

                            <br>

                            <small class="text-muted">

                                ${escape_html(
                                    numero_control
                                )}

                            </small>

                        </div>

                    </div>

                </td>

                <!-- PRÉSTAMO / LIBRO -->
                <td>

                    <span class="badge badge-light border">

                        #${escape_html(
                            adeudo.Id_Prestamo
                        )}

                    </span>

                    <br>

                    <strong>

                        ${escape_html(
                            titulo_libro
                        )}

                    </strong>

                </td>

                <!-- TIPO -->
                <td>

                    <span class="badge badge-light border">

                        ${escape_html(
                            adeudo.Tipo ||
                            'Sin tipo'
                        )}

                    </span>

                </td>

                <!-- DESCRIPCIÓN -->
                <td>

                    <span>

                        ${escape_html(
                            adeudo.Descripcion ||
                            'Sin descripción'
                        )}

                    </span>

                </td>

                <!-- FECHA CREACIÓN -->
                <td>

                    ${fecha_creacion}

                </td>

                <!-- ESTADO -->
                <td>

                    ${estado_badge}

                </td>

                <!-- FECHA RESOLUCIÓN -->
                <td>

                    ${fecha_resolucion}

                </td>

                <!-- ACCIONES -->
                <td>

                    <div class="d-flex">

                        ${
                            adeudo.Estado === 'PENDIENTE'
                                ? `

                                    <button
                                        type="button"
                                        class="btn btn-success btn-sm mr-1"
                                        onclick="resolver_adeudo(${adeudo.Id_Adeudo})"
                                        title="Resolver adeudo"
                                    >

                                        <i class="fa-solid fa-check"></i>

                                    </button>

                                `
                                : ''
                        }

                        ${
                            adeudo.Estado !== 'RESUELTO'
                                ? `

                                    <button
                                        type="button"
                                        class="btn btn-danger btn-sm"
                                        onclick="eliminar_adeudo(${adeudo.Id_Adeudo})"
                                        title="Eliminar adeudo"
                                    >

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                `
                                : ''
                        }

                    </div>

                </td>

            `;

            tabla_adeudos.appendChild(fila);

        });

        actualizar_total();
        actualizar_paginacion();
    }

    // ==========================================
    // OBTENER INICIALES
    // ==========================================

    function obtener_iniciales(nombre) {

        if (!nombre) {
            return 'NA';
        }

        const partes =
            nombre
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        return partes
            .slice(0, 2)
            .map(
                parte =>
                    parte
                        .charAt(0)
                        .toUpperCase()
            )
            .join('');
    }

    // ==========================================
    // BADGE DE ESTADO
    // ==========================================

    function obtener_badge_estado(estado) {

        switch (estado) {

            case 'PENDIENTE':

                return `
                    <span class="badge badge-warning">

                        <i class="fa-solid fa-triangle-exclamation mr-1"></i>

                        Pendiente

                    </span>
                `;

            case 'RESUELTO':

                return `
                    <span class="badge badge-success">

                        <i class="fa-solid fa-check mr-1"></i>

                        Resuelto

                    </span>
                `;

            default:

                return `
                    <span class="badge badge-secondary">

                        ${escape_html(
                            estado ||
                            'Desconocido'
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

            return `
                <span class="text-muted">
                    No registrada
                </span>
            `;
        }

        const fecha_objeto =
            new Date(fecha);

        if (
            isNaN(
                fecha_objeto.getTime()
            )
        ) {

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

        if (total_adeudos) {

            total_adeudos.textContent =
                `Total registrados: ${adeudos_filtrados.length}`;

        }
    }

// ==========================================
// BÚSQUEDA Y FILTROS
// ==========================================
function aplicar_filtros() {

    const termino =
        buscar_adeudo
            ? buscar_adeudo.value
                .trim()
                .toLowerCase()
            : '';

    const estado =
        filtro_estado
            ? filtro_estado.value
            : '';

    adeudos_filtrados =
        adeudos.filter(adeudo => {

            const prestamo =
                adeudo.prestamo;

            // ==========================================
            // ID DEL ADEUDO
            // ==========================================
            const id_adeudo =
                String(
                    adeudo.Id_Adeudo ?? ''
                ).toLowerCase();

            // ==========================================
            // ID DEL PRÉSTAMO
            // ==========================================
            const id_prestamo =
                String(
                    adeudo.Id_Prestamo ?? ''
                ).toLowerCase();

            // ==========================================
            // NÚMERO DE CONTROL
            // ==========================================
            const numero_control =
                String(
                    prestamo?.Numero_Control ?? ''
                ).toLowerCase();

            // ==========================================
            // NOMBRE DEL ALUMNO
            // ==========================================
            const alumno =
                prestamo
                    ? `${prestamo.Nombre ?? ''} ${prestamo.Apellido_Paterno ?? ''} ${prestamo.Apellido_Materno ?? ''}`
                        .trim()
                        .toLowerCase()
                    : '';

            // ==========================================
            // LIBRO
            // ==========================================
            const libro =
                String(
                    prestamo?.Titulo ?? ''
                ).toLowerCase();

            // ==========================================
            // TIPO DE ADEUDO
            // ==========================================
            const tipo =
                String(
                    adeudo.Tipo ?? ''
                ).toLowerCase();

            // ==========================================
            // DESCRIPCIÓN
            // ==========================================
            const descripcion =
                String(
                    adeudo.Descripcion ?? ''
                ).toLowerCase();

            // ==========================================
            // ESTADO
            // ==========================================
            const estado_adeudo =
                String(
                    adeudo.Estado ?? ''
                ).toLowerCase();

            // ==========================================
            // COINCIDENCIA DE BÚSQUEDA
            // ==========================================
            const coincide_busqueda =
                !termino ||

                // ID del adeudo
                id_adeudo.includes(termino) ||

                // ID del préstamo
                id_prestamo.includes(termino) ||

                // Número de control
                numero_control.includes(termino) ||

                // Nombre del alumno
                alumno.includes(termino) ||

                // Título del libro
                libro.includes(termino) ||

                // Tipo de adeudo
                tipo.includes(termino) ||

                // Descripción
                descripcion.includes(termino) ||

                // Estado
                estado_adeudo.includes(termino);

            // ==========================================
            // FILTRO POR ESTADO
            // ==========================================
            const coincide_estado =
                !estado ||
                adeudo.Estado === estado;

            return (
                coincide_busqueda &&
                coincide_estado
            );
        });

    // Regresar a la primera página
    pagina_actual = 1;

    // Actualizar tabla
    renderizar_tabla();
}

    // ==========================================
    // LIMPIAR FILTROS
    // ==========================================

    function limpiar_filtros() {

        if (buscar_adeudo) {

            modal_manager.establecer_valor(
                'buscar_adeudo',
                ''
            );

        }

        if (filtro_estado) {

            modal_manager.establecer_valor(
                'filtro_estado',
                ''
            );

        }

        adeudos_filtrados =
            [...adeudos];

        pagina_actual = 1;

        renderizar_tabla();
    }

    // ==========================================
    // PAGINACIÓN
    // ==========================================

    function actualizar_paginacion() {

        const total_registros =
            adeudos_filtrados.length;

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
                        adeudos_filtrados.length /
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
    // BÚSQUEDA AUTOMÁTICA
    // ==========================================

    if (buscar_adeudo) {

        buscar_adeudo.addEventListener(
            'input',
            aplicar_filtros
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
    // LIMPIAR
    // ==========================================

    if (btn_limpiar) {

        btn_limpiar.addEventListener(
            'click',
            limpiar_filtros
        );

    }

    // ==========================================
    // NUEVO ADEUDO
    // ==========================================

    if (btn_nuevo_adeudo) {

        btn_nuevo_adeudo.addEventListener(
            'click',
            async () => {

                modal_manager.abrir_con_formulario(
                    'modal_nuevo_adeudo',
                    'form_nuevo_adeudo'
                );

                await cargar_prestamos_para_adeudo();

            }
        );

    }

    // ==========================================
    // CARGAR PRÉSTAMOS PARA NUEVO ADEUDO
    // ==========================================

    async function cargar_prestamos_para_adeudo() {

        const select =
            document.getElementById(
                'nuevo_id_prestamo'
            );

        if (!select) return;

        try {

            select.innerHTML = `
                <option value="">
                    Cargando préstamos...
                </option>
            `;

            const respuesta =
                await fetch(
                    `${API_URL}/prestamos`
                );

            if (!respuesta.ok) {

                throw new Error(
                    'No fue posible obtener los préstamos'
                );

            }

            const resultado =
                await respuesta.json();

            if (!resultado.success) {

                throw new Error(
                    resultado.mensaje ||
                    'Error al obtener préstamos'
                );

            }

            const lista_prestamos =
                resultado.data || [];

            select.innerHTML = `
                <option value="">
                    Seleccionar préstamo...
                </option>
            `;

            lista_prestamos.forEach(
                prestamo => {

                    const opcion =
                        document.createElement(
                            'option'
                        );

                    opcion.value =
                        prestamo.Id_Prestamo;

                    const alumno =
                        `${prestamo.Nombre ?? ''} ${prestamo.Apellido_Paterno ?? ''} ${prestamo.Apellido_Materno ?? ''}`
                            .trim();

                    const libro =
                        prestamo.Titulo ||
                        'Libro sin título';

                    const control =
                        prestamo.Numero_Control ||
                        'Sin control';

                    opcion.textContent =
                        `#${prestamo.Id_Prestamo} - ${control} - ${alumno} - ${libro}`;

                    select.appendChild(
                        opcion
                    );

                }
            );

        } catch (error) {

            console.error(
                'Error al cargar préstamos:',
                error
            );

            select.innerHTML = `
                <option value="">
                    Error al cargar préstamos
                </option>
            `;

            mostrar_error(
                error.message
            );

        }
    }

    // ==========================================
    // CREAR ADEUDO
    // ==========================================

    const form_nuevo_adeudo =
        document.getElementById(
            'form_nuevo_adeudo'
        );

    if (form_nuevo_adeudo) {

        form_nuevo_adeudo.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                // ==========================================
                // OBTENER DATOS
                // ==========================================

                const id_prestamo =
                    modal_manager.obtener_valor(
                        'nuevo_id_prestamo'
                    );

                const tipo =
                    modal_manager.obtener_valor(
                        'nuevo_tipo'
                    );

                const descripcion =
                    modal_manager.obtener_valor(
                        'nuevo_descripcion'
                    );

                // ==========================================
                // VALIDACIONES
                // ==========================================

                if (!id_prestamo) {

                    mostrar_advertencia(
                        'Selecciona un préstamo'
                    );

                    return;

                }

                if (!tipo) {

                    mostrar_advertencia(
                        'Selecciona el tipo de adeudo'
                    );

                    return;

                }

                if (
                    !descripcion ||
                    !descripcion.trim()
                ) {

                    mostrar_advertencia(
                        'Escribe la descripción del adeudo'
                    );

                    return;

                }

                // ==========================================
                // USUARIO DE SESIÓN
                // ==========================================

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

                // ==========================================
                // DATOS
                // ==========================================

                const data = {

                    Id_Prestamo:
                        Number(id_prestamo),

                    Tipo:
                        tipo,

                    Descripcion:
                        descripcion.trim(),

                    Id_Usuario:
                        Number(id_usuario)

                };

                try {

                    modal_manager.bloquear_boton(
                        'btn_guardar_nuevo',
                        'Guardando...'
                    );

                    // ==========================================
                    // ENVIAR AL BACKEND
                    // ==========================================

                    const respuesta =
                        await fetch(
                            `${API_URL}/adeudos`,
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

                    if (
                        !respuesta.ok ||
                        !resultado.success
                    ) {

                        throw new Error(
                            resultado.mensaje ||
                            'No fue posible crear el adeudo'
                        );

                    }

                    // ==========================================
                    // CERRAR MODAL
                    // ==========================================

                    modal_manager.cerrar_con_formulario(
                        'modal_nuevo_adeudo',
                        'form_nuevo_adeudo'
                    );

                    // ==========================================
                    // MENSAJE
                    // ==========================================

                    mostrar_exito(
                        'Adeudo creado correctamente'
                    );

                    // ==========================================
                    // RECARGAR
                    // ==========================================

                    await cargar_adeudos();

                } catch (error) {

                    console.error(
                        'Error al crear adeudo:',
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
    // RESOLVER ADEUDO
    // ==========================================

    window.resolver_adeudo =
        async function (id) {

            // ==========================================
            // USUARIO
            // ==========================================

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

            // ==========================================
            // CONFIRMAR
            // ==========================================

            const confirmar =
                await confirmar_accion(
                    '¿Resolver adeudo?',
                    'El adeudo se marcará como resuelto.'
                );

            if (!confirmar) return;

            try {

                const respuesta =
                    await fetch(
                        `${API_URL}/adeudos/${id}/resolver`,
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

                if (
                    !respuesta.ok ||
                    !resultado.success
                ) {

                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible resolver el adeudo'
                    );

                }

                mostrar_exito(
                    'Adeudo resuelto correctamente'
                );

                await cargar_adeudos();

            } catch (error) {

                console.error(
                    'Error al resolver adeudo:',
                    error
                );

                mostrar_error(
                    error.message
                );

            }

        };

    // ==========================================
    // ELIMINAR ADEUDO
    // ==========================================

    window.eliminar_adeudo =
        async function (id) {

            // ==========================================
            // USUARIO
            // ==========================================

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

            // ==========================================
            // CONFIRMAR
            // ==========================================

            const confirmar =
                await confirmar_accion(
                    '¿Eliminar adeudo?',
                    'Esta acción eliminará el adeudo permanentemente.'
                );

            if (!confirmar) return;

            try {

                const respuesta =
                    await fetch(
                        `${API_URL}/adeudos/${id}`,
                        {
                            method: 'DELETE',

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

                if (
                    !respuesta.ok ||
                    !resultado.success
                ) {

                    throw new Error(
                        resultado.mensaje ||
                        'No fue posible eliminar el adeudo'
                    );

                }

                mostrar_exito(
                    'Adeudo eliminado correctamente'
                );

                await cargar_adeudos();

            } catch (error) {

                console.error(
                    'Error al eliminar adeudo:',
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

            return JSON.parse(
                usuario
            );

        } catch (error) {

            console.error(
                'Error al obtener usuario:',
                error
            );

            return null;

        }
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

        if (
            valor === null ||
            valor === undefined
        ) {

            return '';

        }

        return String(valor)
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );
    }

    // ==========================================
    // INICIALIZAR
    // ==========================================

    cargar_adeudos();

});