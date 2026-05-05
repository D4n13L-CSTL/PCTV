// ─── Configuración de la API ──────────────────────────────────────────────────
const API_BASE = '/api/v1/auth';

// ─── Gestión de sesión ────────────────────────────────────────────────────────

function saveSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
}

function getCurrentUser() {
    const raw = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

// ─── Login ────────────────────────────────────────────────────────────────────

async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }

    const btn = document.getElementById('doLoginBtn');
    const originalText = btn?.innerHTML;
    if (btn) {
        btn.innerHTML  = '<i class="fas fa-spinner fa-spin mr-2"></i> Verificando...';
        btn.disabled   = true;
    }

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Credenciales incorrectas.');
        }

        // data.user = { id, username, email, full_name }
        saveSession(data.user);
        showToast(`¡Bienvenido, ${data.user.full_name}!`, 'success');
        setTimeout(() => { window.location.href = '/index'; }, 1500);

    } catch (err) {
        showToast(err.message || 'Error al iniciar sesión', 'error');
        const pwdInput = document.getElementById('loginPassword');
        if (pwdInput) {
            pwdInput.value = '';
            pwdInput.classList.add('border-red-500');
            setTimeout(() => pwdInput.classList.remove('border-red-500'), 2000);
        }
    } finally {
        if (btn) {
            btn.innerHTML = originalText || '<i class="fas fa-arrow-right-to-bracket mr-2"></i> Acceder al sistema';
            btn.disabled  = false;
        }
    }
}

// ─── Registro ─────────────────────────────────────────────────────────────────

async function handleRegister() {
    const full_name = document.getElementById('regName').value.trim();
    const username  = document.getElementById('regUsername').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;
    const confirm   = document.getElementById('regConfirmPassword').value;
    const terms     = document.getElementById('termsCheck').checked;

    // Validaciones
    if (!full_name || !username || !email || !password || !confirm) {
        showToast('Todos los campos son obligatorios', 'error');
        return;
    }
    if (password !== confirm) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    if (!terms) {
        showToast('Debes aceptar los términos y condiciones', 'warning');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Ingresa un correo electrónico válido', 'error');
        return;
    }

    const btn = document.getElementById('doRegisterBtn');
    const originalText = btn?.innerHTML;
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Registrando...';
        btn.disabled  = true;
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Error en el registro. Intenta de nuevo.');
        }

        // Limpiar campos
        ['regName', 'regUsername', 'regEmail', 'regPassword', 'regConfirmPassword']
            .forEach(id => { document.getElementById(id).value = ''; });
        document.getElementById('termsCheck').checked = false;

        showToast('¡Cuenta creada exitosamente! Ahora inicia sesión.', 'success');

        // Cambiar al tab de login y precargar el email
        document.getElementById('tabLogin').click();
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').focus();

    } catch (err) {
        showToast(err.message || 'No se pudo conectar con el servidor.', 'error');
    } finally {
        if (btn) {
            btn.innerHTML = originalText || '<i class="fas fa-user-plus mr-2"></i> Registrar cuenta';
            btn.disabled  = false;
        }
    }
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

async function handlePasswordReset() {
    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        showToast('Ingresa tu correo electrónico', 'error');
        return;
    }

    const btn = document.getElementById('btnResetPass');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
    btn.disabled  = true;

    try {
        const res = await fetch(`${API_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        // Siempre mostramos mensaje neutro (el backend no revela si el email existe)
        await Swal.fire({
            icon: 'success',
            title: 'Solicitud procesada',
            text: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña en breve.',
            confirmButtonColor: '#4f46e5'
        });

        toggleResetView(false);

    } catch (err) {
        showToast('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled  = false;
    }
}

// ─── Verificar sesión existente ───────────────────────────────────────────────

function checkExistingSession() {
    if (isAuthenticated()) {
        window.location.href = '/core/';
    }
}

// ─── Logout (exportado para uso externo) ─────────────────────────────────────

function logout() {
    clearSession();
    showToast('Sesión cerrada correctamente', 'info');
    setTimeout(() => { window.location.href = '/'; }, 1000);
}

// ─── Toast / Alertas ─────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            background: type === 'error' ? '#fff5f5' : '#ffffff'
        });
    } else {
        alert(message);
    }
}

// ─── Navegación de tabs ───────────────────────────────────────────────────────

function setupTabs() {
    const tabLogin    = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm   = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetView   = document.getElementById('passwordResetView');

    if (!tabLogin || !tabRegister) return;

    function activateTab(active, inactive, showEl, hideEls) {
        active.classList.add('border-indigo-600', 'text-indigo-700', 'bg-indigo-50/50');
        active.classList.remove('border-transparent', 'text-gray-500');
        inactive.classList.remove('border-indigo-600', 'text-indigo-700', 'bg-indigo-50/50');
        inactive.classList.add('border-transparent', 'text-gray-500');
        showEl.classList.remove('hidden');
        hideEls.forEach(el => el.classList.add('hidden'));
        // Restaurar tabs
        [tabLogin, tabRegister].forEach(t => {
            t.style.opacity = '1';
            t.style.pointerEvents = 'auto';
        });
    }

    tabLogin.addEventListener('click', () =>
        activateTab(tabLogin, tabRegister, loginForm, [registerForm, resetView])
    );

    tabRegister.addEventListener('click', () =>
        activateTab(tabRegister, tabLogin, registerForm, [loginForm, resetView])
    );
}

function toggleResetView(show) {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetView    = document.getElementById('passwordResetView');
    const tabLogin     = document.getElementById('tabLogin');
    const tabRegister  = document.getElementById('tabRegister');

    if (show) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        resetView.classList.remove('hidden');
        [tabLogin, tabRegister].forEach(t => {
            t.style.opacity = '0.4';
            t.style.pointerEvents = 'none';
        });
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        resetView.classList.add('hidden');
        [tabLogin, tabRegister].forEach(t => {
            t.style.opacity = '1';
            t.style.pointerEvents = 'auto';
        });
        const forgotEmail = document.getElementById('forgotEmail');
        if (forgotEmail) forgotEmail.value = '';
    }
}

// ─── Inicialización ───────────────────────────────────────────────────────────

function init() {
   // checkExistingSession();
    setupTabs();

    // Botones principales
    document.getElementById('doLoginBtn')   ?.addEventListener('click', handleLogin);
    document.getElementById('doRegisterBtn')?.addEventListener('click', handleRegister);

    // Link "¿Olvidaste tu contraseña?"
    document.getElementById('resetEmail')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleResetView(true);
    });

    // Enter para enviar
    document.getElementById('loginPassword')      ?.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });
    document.getElementById('regPassword')         ?.addEventListener('keypress', e => { if (e.key === 'Enter') handleRegister(); });
    document.getElementById('regConfirmPassword')  ?.addEventListener('keypress', e => { if (e.key === 'Enter') handleRegister(); });
    document.getElementById('forgotEmail')         ?.addEventListener('keypress', e => { if (e.key === 'Enter') handlePasswordReset(); });
}

// API pública
window.auth = {
    login:           handleLogin,
    logout:          logout,
    register:        handleRegister,
    getUser:         getCurrentUser,
    isAuthenticated: isAuthenticated,
    clearSession:    clearSession,
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}