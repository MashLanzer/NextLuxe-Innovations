// Contenido del nuevo archivo auth.js

// --- IMPORTACIONES DE FIREBASE ---
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
// Importa la función para cargar el dashboard
import { loadDashboardPage } from './dashboard/dashboard.js';

// --- FUNCIÓN PARA CARGAR LA PÁGINA DE LOGIN ---
export async function loadLoginPage( ) {
    // Evita cargar el login si ya está abierto
    if (document.getElementById('login-container')) return;

    try {
        // Cargar CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'login.css';
        cssLink.id = 'login-css';
        document.head.appendChild(cssLink);

        // Cargar HTML
        const response = await fetch('login.html');
        if (!response.ok) throw new Error('No se pudo cargar login.html');
        const html = await response.text();
        
        // Crear un contenedor y añadirlo al body
        const container = document.createElement('div');
        container.id = 'login-page-container';
        container.innerHTML = html;
        document.body.appendChild(container);

        // Animar la entrada
        setTimeout(() => {
            const loginContainer = document.querySelector('.login-container');
            const loginBox = document.querySelector('.login-box');
            if (loginContainer) loginContainer.style.opacity = '1';
            if (loginBox) loginBox.style.transform = 'scale(1)';
        }, 50);

        // Inicializar la lógica del formulario
        initializeAuthForm();

    } catch (error) {
        console.error('Error al cargar la página de login:', error);
    }
}

// --- LÓGICA DEL FORMULARIO DE AUTENTICACIÓN ---
function initializeAuthForm() {
    const form = document.getElementById('auth-form');
    const auth = getAuth();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Usuario autenticado:', userCredential.user);
                alert('¡Inicio de sesión exitoso!');
                closeLoginPage();
                loadDashboardPage(); // Carga el dashboard después del login exitoso
            })
            .catch((error) => {
                alert(`Error de autenticación: ${error.message}`);
            });
    });

    // Añadir lógica para cerrar el login si se hace clic fuera
    const loginContainer = document.querySelector('.login-container');
    loginContainer.addEventListener('click', (e) => {
        if (e.target === loginContainer) {
            closeLoginPage();
        }
    });
}

// --- FUNCIÓN PARA CERRAR Y LIMPIAR LA PÁGINA DE LOGIN ---
function closeLoginPage() {
    const container = document.getElementById('login-page-container');
    const css = document.getElementById('login-css');
    if (container) container.remove();
    if (css) css.remove();
}
