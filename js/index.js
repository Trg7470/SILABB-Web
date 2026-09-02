document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const nombre_usuario = document.getElementById('nombre_usuario');
    const password = document.getElementById('password');
    const password_toggle = document.getElementById('passwordToggle');

    const submit_button = form?.querySelector('.signin-button');
    const success_message = document.getElementById('successMessage');

    const nombre_usuario_error = document.getElementById('nombreUsuarioError');
    const password_error = document.getElementById('passwordError');

    if (!form || !nombre_usuario || !password) {
        console.error('No se encontraron los elementos necesarios del formulario.');
        return;
    }

    // ==========================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================

    password_toggle?.addEventListener('click', () => {

        const mostrar = password.type === 'password';

        password.type = mostrar ? 'text' : 'password';

        password_toggle
            .querySelector('.eye-show')
            ?.classList.toggle('show', !mostrar);

        password_toggle
            .querySelector('.eye-hide')
            ?.classList.toggle('show', mostrar);

        password.focus();
    });

    // ==========================================
    // EVENTOS DE CAMPOS
    // ==========================================

    nombre_usuario.addEventListener('input', () => {
        limpiar_error(nombre_usuario, nombre_usuario_error);
    });

    password.addEventListener('input', () => {
        limpiar_error(password, password_error);
    });

    nombre_usuario.addEventListener('blur', validar_nombre_usuario);
    password.addEventListener('blur', validar_password);

    // ==========================================
    // ENVÍO DEL FORMULARIO
    // ==========================================

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        limpiar_todos_los_errores();

        const nombre_usuario_valido = validar_nombre_usuario();
        const password_valida = validar_password();

        if (!nombre_usuario_valido || !password_valida) {

            form.style.animation = 'shake 0.5s ease-in-out';

            form.addEventListener('animationend', () => {
                form.style.animation = '';
            }, {
                once: true
            });

            return;
        }

        await iniciar_sesion();
    });

    // ==========================================
    // RECUPERAR CONTRASEÑA
    // ==========================================

    document.querySelector('.forgot-password')?.addEventListener('click', (e) => {

        e.preventDefault();

        mostrar_notificacion(
            'La recuperación de contraseña estará disponible próximamente.',
            'info'
        );
    });

    // ==========================================
    // ESTATUS DEL ALUMNO
    // ==========================================

    document.querySelector('.signup-link')?.addEventListener('click', (e) => {

        e.preventDefault();

        window.location.href = '/pages/alumnos/status.html';
    });

    // ==========================================
    // VALIDAR NOMBRE DE USUARIO
    // ==========================================

    function validar_nombre_usuario() {

        const valor = nombre_usuario.value.trim();

        if (!valor) {

            mostrar_error(
                nombre_usuario,
                nombre_usuario_error,
                'Ingresa tu nombre de usuario.'
            );

            return false;
        }

        return true;
    }

    // ==========================================
    // VALIDAR CONTRASEÑA
    // ==========================================

    function validar_password() {

        const valor = password.value;

        if (!valor) {

            mostrar_error(
                password,
                password_error,
                'Ingresa tu contraseña.'
            );

            return false;
        }

        return true;
    }

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    async function iniciar_sesion() {
        submit_button?.classList.add('loading');
        submit_button?.setAttribute('disabled', 'true');
        try {
            const respuesta = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    Usuario: nombre_usuario.value.trim(),
                    Password: password.value
                })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {

                throw new Error(
                    resultado.message ||
                    'Usuario o contraseña incorrectos.'
                );
            }

            if (!resultado.token) {

                throw new Error(
                    'El servidor no devolvió el token de autenticación.'
                );
            }

            // ==========================================
            // GUARDAR SESIÓN
            // ==========================================

            sessionStorage.setItem(
                'token',
                resultado.token
            );

            if (resultado.usuario) {

                sessionStorage.setItem(
                    'usuario',
                    JSON.stringify(resultado.usuario)
                );
            }

            mostrar_exito();

            // ==========================================
            // REDIRECCIÓN
            // ==========================================


        } catch (error) {

            console.error('Error al iniciar sesión:', error);

            mostrar_notificacion(
                error.message ||
                'No fue posible iniciar sesión.',
                'error'
            );

        } finally {

            submit_button?.classList.remove('loading');
            submit_button?.removeAttribute('disabled');
             setTimeout(() => {

                window.location.href =
                    '/pages/dashboard/dashboard_u.html';

            }, 1000);
        }
    }

    // ==========================================
    // MOSTRAR ERROR
    // ==========================================

    function mostrar_error(campo, elemento, mensaje) {

        campo.classList.add('error');

        if (elemento) {

            elemento.textContent = mensaje;
            elemento.classList.add('show');
        }
    }

    // ==========================================
    // LIMPIAR ERROR
    // ==========================================

    function limpiar_error(campo, elemento) {

        campo.classList.remove('error');

        if (elemento) {

            elemento.textContent = '';
            elemento.classList.remove('show');
        }
    }

    // ==========================================
    // LIMPIAR TODOS LOS ERRORES
    // ==========================================

    function limpiar_todos_los_errores() {

        limpiar_error(
            nombre_usuario,
            nombre_usuario_error
        );

        limpiar_error(
            password,
            password_error
        );
    }

    // ==========================================
    // MOSTRAR ÉXITO
    // ==========================================

    function mostrar_exito() {

        form.style.transition = 'all 0.3s ease';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-20px)';

        setTimeout(() => {

            form.style.display = 'none';

            if (success_message) {

                success_message.classList.add('show');

                const titulo = success_message.querySelector('h3');
                const texto = success_message.querySelector('p');

                if (titulo) {
                    titulo.textContent = '¡Bienvenido a SILABB!';
                }

                if (texto) {
                    texto.textContent = 'Iniciando sesión...';
                }
            }

        }, 300);
    }

    // ==========================================
    // MOSTRAR NOTIFICACIÓN
    // ==========================================

    function mostrar_notificacion(mensaje, tipo = 'info') {

        const anterior = form.querySelector('.notification');

        if (anterior) {
            anterior.remove();
        }

        const colores = {

            error: {
                fondo: 'rgba(239, 68, 68, 0.1)',
                borde: 'rgba(239, 68, 68, 0.3)',
                texto: '#ef4444'
            },

            info: {
                fondo: 'rgba(6, 182, 212, 0.1)',
                borde: 'rgba(6, 182, 212, 0.3)',
                texto: '#06b6d4'
            },

            success: {
                fondo: 'rgba(34, 197, 94, 0.1)',
                borde: 'rgba(34, 197, 94, 0.3)',
                texto: '#22c55e'
            }
        };

        const color = colores[tipo] || colores.info;

        const notificacion = document.createElement('div');

        notificacion.className = `notification ${tipo}`;

        notificacion.setAttribute(
            'role',
            tipo === 'error' ? 'alert' : 'status'
        );

        notificacion.textContent = mensaje;

        notificacion.style.cssText = `
            background:${color.fondo};
            border:1px solid ${color.borde};
            border-radius:12px;
            padding:12px 16px;
            margin-top:16px;
            color:${color.texto};
            text-align:center;
            font-size:14px;
            animation:slideIn 0.3s ease;
        `;

        form.appendChild(notificacion);

        setTimeout(() => {

            notificacion.style.animation =
                'slideOut 0.3s ease';

            notificacion.addEventListener(
                'animationend',
                () => notificacion.remove(),
                { once: true }
            );

        }, 3000);
    }
});