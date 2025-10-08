// =================================================================
// SCRIPT.JS - CÓDIGO PRINCIPAL CONSOLIDADO Y CORREGIDO
// =================================================================

// --- IMPORTACIONES (SIEMPRE AL PRINCIPIO DEL ARCHIVO) ---
// Importa las funciones para cargar las "páginas" dinámicas.
// Asegúrate de que los archivos auth.js y dashboard/dashboard.js existan.
import { loadLoginPage } from './auth.js';
import { loadDashboardPage } from './dashboard/dashboard.js';


// --- INICIALIZACIÓN PRINCIPAL (UN SOLO DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', function() {

    // --- CONFIGURACIÓN DE FIREBASE ---
    const firebaseConfig = {
      apiKey: "AIzaSyDqt-7Sm73TcZRR7BaxB6Id_32dt8AKTrs",
      authDomain: "nextluxe-innovations-llc.firebaseapp.com",
      projectId: "nextluxe-innovations-llc",
      storageBucket: "nextluxe-innovations-llc.appspot.com",
      messagingSenderId: "148643193583",
      appId: "1:148643193583:web:585023b9a18e2f6215f11a",
      measurementId: "G-KNGL2NS6S8"
    };
    // Descomenta las siguientes líneas cuando estés listo para usar Firebase
    // import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
    // const app = initializeApp(firebaseConfig );
    console.log("Configuración de Firebase lista para ser inicializada.");


    // --- INICIALIZACIÓN DE MÓDULOS DE LA PÁGINA ---
    initializeNavbar();
    initializeScrollAnimations();
    initializeTimelineCarousel();
    initializeActionButtons();

});


// =================================================================
// --- FUNCIONES DE INICIALIZACIÓN (Llamadas desde DOMContentLoaded) ---
// =================================================================

/**
 * Inicializa toda la lógica de la barra de navegación (scroll, menú móvil, smooth scroll).
 */
function initializeNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

/**
 * Inicializa las animaciones de entrada con ScrollReveal.
 */
function initializeScrollAnimations() {
    if (typeof ScrollReveal === 'undefined') {
        console.error("ScrollReveal no está cargado.");
        return;
    }
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 1000,
        delay: 100,
        reset: false
    });

    sr.reveal('.hero-title, .hero-subtitle, .btn-primary', { delay: 200, origin: 'top' });
    sr.reveal('.section-title', { origin: 'left' });
    sr.reveal('.panel-title', { origin: 'left', distance: '50px' });
    sr.reveal('.panel-image', { origin: 'right', distance: '50px', delay: 100 });
    sr.reveal('.panel-description', { origin: 'bottom', distance: '50px', delay: 200 });
    sr.reveal('.panel-feature', { origin: 'bottom', distance: '50px', interval: 150, delay: 300 });
    sr.reveal('.stat-item', { interval: 150 });
    sr.reveal('.founder-flip-card', { interval: 150, scale: 0.95 });
    sr.reveal('.certifications-section .logos-container img', { interval: 100 });
    sr.reveal('.potm-image', { origin: 'left' });
    sr.reveal('.potm-details', { origin: 'right', delay: 100 });
    sr.reveal('.timeline-carousel', { scale: 0.95 });
    sr.reveal('.vision-card', { interval: 150 });
    sr.reveal('.futuristic-item', { interval: 150 });
    sr.reveal('.event-card', { interval: 150 });
    sr.reveal('.investors-content', { scale: 0.9 });
    sr.reveal('.footer-about, .footer-links, .footer-contact', { interval: 150, origin: 'top' });
}

/**
 * Inicializa la lógica del carrusel de la sección "Nuestra Evolución".
 */
function initializeTimelineCarousel() {
    const navButtons = document.querySelectorAll('.nav-year');
    if (navButtons.length === 0) return;

    const slides = document.querySelectorAll('.carousel-slide');
    const images = document.querySelectorAll('.carousel-img');
    const progressBar = document.querySelector('.nav-line-progress');

    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if(progressBar) {
                const progressPercentage = (index / (navButtons.length - 1)) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
            slides.forEach(slide => slide.classList.toggle('active', slide.id === targetId));
            images.forEach(img => img.classList.toggle('active', img.getAttribute('data-year') === targetId));
        });
    });
}

/**
 * Asigna los eventos a los botones de acción "Portal" y "Dashboard".
 */
function initializeActionButtons() {
    const portalButton = document.getElementById('login-investor-btn-nav');
    const dashboardButton = document.getElementById('dashboard-btn-nav');

    if (portalButton) {
        portalButton.addEventListener('click', () => {
            // El botón "Portal" siempre intenta cargar la página de login
            loadLoginPage();
        });
    }

    if (dashboardButton) {
        dashboardButton.addEventListener('click', () => {
            // El botón "Dashboard" debería verificar si el usuario está logueado.
            // Por ahora, para probar, también cargará el login.
            // En el futuro, aquí iría: if (userIsLoggedIn) { loadDashboardPage(); } else { loadLoginPage(); }
            alert("Funcionalidad de Dashboard en desarrollo. Redirigiendo al login para probar.");
            loadLoginPage();
        });
    }
}
