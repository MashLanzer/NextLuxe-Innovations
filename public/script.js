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
    sr.reveal('.about-content-glass', { duration: 1000, origin: 'bottom', distance: '100px', scale: 0.9 });
    sr.reveal('.properties-grid .property-card-placeholder', { interval: 200 });
    sr.reveal('.footer-about, .footer-links, .footer-contact', { interval: 200 });

        // ... (código de ScrollReveal existente)
    sr.reveal('.properties-grid .property-card-placeholder', { interval: 200 });

    // AÑADIR ESTAS LÍNEAS
 
    sr.reveal('.founder-flip-card', { interval: 200, origin: 'bottom' });

    sr.reveal('.footer-about, .footer-links, .footer-contact', { interval: 200 });

// Animación Coreografiada para el Mosaico
sr.reveal('.panel-title', { origin: 'left', distance: '50px', duration: 800 });
sr.reveal('.panel-image', { origin: 'right', distance: '50px', duration: 1000 });
sr.reveal('.panel-description', { origin: 'bottom', distance: '50px', duration: 1000, delay: 200 });
sr.reveal('.panel-feature', { origin: 'bottom', distance: '50px', interval: 200, duration: 600, delay: 400 });


});

// ===== Lógica para el Nuevo Carrusel de Hitos Sofisticado =====
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-year');
    const slides = document.querySelectorAll('.carousel-slide');
    const images = document.querySelectorAll('.carousel-img');
    const progressBar = document.querySelector('.nav-line-progress');

    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            // 1. Actualizar botones
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. Actualizar barra de progreso
            const progressPercentage = (index / (navButtons.length - 1)) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // 3. Actualizar slides de contenido
            slides.forEach(slide => {
                slide.classList.toggle('active', slide.id === targetId);
            });

            // 4. Actualizar imágenes
            images.forEach(img => {
                img.classList.toggle('active', img.getAttribute('data-year') === targetId);
            });
        });
    });
});


// ===== Lógica para el Modal de Login (ACTUALIZADA) =====
const loginModal = document.getElementById('login-modal');
const openModalBtns = document.querySelectorAll('#login-investor-btn, #login-investor-btn-nav'); // Selecciona ambos botones
const closeModalBtn = document.querySelector('.modal-close');

openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
});


closeModalBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Cierra el modal si se hace clic fuera del contenido
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Lógica de Firebase para el login (ejemplo)
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Aquí iría la lógica de autenticación con Firebase
    // import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
    // const auth = getAuth();
    // signInWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     console.log("Usuario autenticado:", userCredential.user);
    //     loginModal.style.display = 'none';
    //     // Aquí mostrarías las secciones VIP
    //   })
    //   .catch((error) => {
    //     alert("Error de autenticación: " + error.message);
    //   });
    
    console.log("Intentando iniciar sesión con:", email, password);
    alert("Funcionalidad de login en desarrollo. Conectando a Firebase...");
});
