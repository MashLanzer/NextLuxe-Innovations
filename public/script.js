// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {

    // ===== Configuración de Firebase =====
    // Las credenciales ya están aquí, listas para usarse.
    const firebaseConfig = {
      apiKey: "AIzaSyDqt-7Sm73TcZRR7BaxB6Id_32dt8AKTrs",
      authDomain: "nextluxe-innovations-llc.firebaseapp.com",
      projectId: "nextluxe-innovations-llc",
      storageBucket: "nextluxe-innovations-llc.appspot.com", // Corregido: .appspot.com es lo común
      messagingSenderId: "148643193583",
      appId: "1:148643193583:web:585023b9a18e2f6215f11a",
      measurementId: "G-KNGL2NS6S8"
    };

    // Inicializar Firebase (descomentar cuando se importen las funciones)
    // import { initializeApp } from "firebase/app";
    // const app = initializeApp(firebaseConfig);
    console.log("Configuración de Firebase lista.");


    // ===== Menú de Navegación Móvil =====
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ===== Estilo de Navbar al hacer Scroll =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ===== Smooth Scroll para Enlaces Internos =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // ===== Animaciones con ScrollReveal =====
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 2000,
        delay: 200,
        reset: false // Las animaciones solo ocurren una vez
    });

    // Aplicar animaciones a elementos específicos
    sr.reveal('.hero-title, .hero-subtitle, .btn-primary', { delay: 400, origin: 'top' });
    sr.reveal('.section-title', { origin: 'left' });
    sr.reveal('.about-image', { origin: 'left', distance: '80px' });
    sr.reveal('.about-text', { origin: 'right', distance: '80px' });
    sr.reveal('.properties-grid .property-card-placeholder', { interval: 200 });
    sr.reveal('.footer-about, .footer-links, .footer-contact', { interval: 200 });

});
