document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const submitButton = form?.querySelector('.signin-button');
    const successMessage = document.getElementById('successMessage');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    if (!form) return;

    passwordToggle?.addEventListener('click', () => {
        const mostrar = password.type === 'password';
        password.type = mostrar ? 'text' : 'password';
        passwordToggle.querySelector('.eye-show')?.classList.toggle('show', !mostrar);
        passwordToggle.querySelector('.eye-hide')?.classList.toggle('show', mostrar);
        password.focus();
    });

    email.addEventListener('input', () => limpiarError(email, emailError));
    password.addEventListener('input', () => limpiarError(password, passwordError));

    email.addEventListener('blur', () => validarEmail());
    password.addEventListener('blur', () => validarPassword());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        limpiarTodosLosErrores();

        const emailValido = validarEmail();
        const passwordValida = validarPassword();

        if (!emailValido || !passwordValida) {
            form.style.animation = 'shake 0.5s ease-in-out';
            form.addEventListener('animationend', () => {
                form.style.animation = '';
            }, { once: true });
            return;
        }

        await iniciarSesion();
    });

    document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarNotificacion('La recuperación de contraseña estará disponible próximamente.', 'info');
    });

    document.querySelector('.signup-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = "pages/alumnos/status.html";
    });

    function validarEmail() {
        const valor = email.value.trim();

        if (!valor) {
            mostrarError(email, emailError, 'Ingresa tu correo electrónico.');
            return false;
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(valor)) {
            mostrarError(email, emailError, 'Ingresa un correo electrónico válido.');
            return false;
        }

        return true;
    }

    function validarPassword() {
        const valor = password.value;

        if (!valor) {
            mostrarError(password, passwordError, 'Ingresa tu contraseña.');
            return false;
        }

        return true;
    }

    async function iniciarSesion() {
        submitButton?.classList.add('loading');
        submitButton?.setAttribute('disabled', 'true');

        try {
            const respuesta = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value
                })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.message || 'Correo o contraseña incorrectos.');
            }

            if (!resultado.token) {
                throw new Error('El servidor no devolvió el token de autenticación.');
            }

            sessionStorage.setItem('token', resultado.token);

            if (resultado.usuario) {
                sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            }

            mostrarExito();

            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);

        } catch (error) {
            mostrarNotificacion(
                error.message || 'No fue posible iniciar sesión.',
                'error'
            );
        } finally {
            submitButton?.classList.remove('loading');
            submitButton?.removeAttribute('disabled');
        }
    }

    function mostrarError(campo, elemento, mensaje) {
        campo.classList.add('error');

        if (elemento) {
            elemento.textContent = mensaje;
            elemento.classList.add('show');
        }
    }

    function limpiarError(campo, elemento) {
        campo.classList.remove('error');

        if (elemento) {
            elemento.textContent = '';
            elemento.classList.remove('show');
        }
    }

    function limpiarTodosLosErrores() {
        limpiarError(email, emailError);
        limpiarError(password, passwordError);
    }

    function mostrarExito() {
        form.style.transition = 'all 0.3s ease';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            form.style.display = 'none';

            if (successMessage) {
                successMessage.classList.add('show');

                const titulo = successMessage.querySelector('h3');
                const texto = successMessage.querySelector('p');

                if (titulo) titulo.textContent = '¡Bienvenido a SILABB!';
                if (texto) texto.textContent = 'Iniciando sesión...';
            }
        }, 300);
    }

    function mostrarNotificacion(mensaje, tipo = 'info') {
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
            notificacion.style.animation = 'slideOut 0.3s ease';

            notificacion.addEventListener(
                'animationend',
                () => notificacion.remove(),
                { once: true }
            );
        }, 3000);
    }
});