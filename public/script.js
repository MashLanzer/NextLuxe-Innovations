// Importar Firebase y sus funciones
import { auth, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, doc, setDoc, getDoc, updateDoc, GoogleAuthProvider, signInWithPopup } from './firebase-config.js';

import { countryList, cityListByCountry } from './data.js';

// --- AÑADE ESTAS NUEVAS IMPORTACIONES DE STORAGE ---
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// --- AÑADE ESTA LÍNEA DEBAJO DE LAS IMPORTACIONES ---
const googleProvider = new GoogleAuthProvider();

// ============================================= 
// VARIABLES GLOBALES Y ESTADO DE LA APLICACIÓN
// ============================================= 
let currentStep = 1;
let profileSetupData = {};
let selectedInterests = [];
let selectedPhoto = null;

// Estado de la aplicación
const appState = {
    currentScreen: 'login',
    isLoading: false,
    userData: {}
};

// ============================================= 
// ELEMENTOS DEL DOM
// ============================================= 
const elements = {
    // Pantallas principales
    loginScreen: document.getElementById('loginScreen'),
    profileSetupScreen: document.getElementById('profileSetupScreen'),
    completionScreen: document.getElementById('completionScreen'),
    mainMenuScreen: document.getElementById('mainMenuScreen'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    
    // Formularios de autenticación
    loginForm: document.getElementById('loginFormElement'),
    registerForm: document.getElementById('registerFormElement'),
    forgotPasswordForm: document.getElementById('forgotPasswordFormElement'),
    
    // Contenedores de formularios
    loginFormContainer: document.getElementById('loginForm'),
    registerFormContainer: document.getElementById('registerForm'),
    forgotPasswordFormContainer: document.getElementById('forgotPasswordForm'),
    
    // Botones de navegación entre formularios
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    backToLogin: document.getElementById('backToLogin'),
    
    // Setup de perfil
    setupSteps: document.querySelectorAll('.setup-step'),
    progressSteps: document.querySelectorAll('.progress-step'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    completeBtn: document.getElementById('completeBtn'),
    
    // Formulario de información básica
    setupName: document.getElementById('setupName'),
    setupBio: document.getElementById('setupBio'),
    setupAge: document.getElementById('setupAge'),
    setupGender: document.getElementById('setupGender'),
    setupCountry: document.getElementById('setupCountry'),
    setupCity: document.getElementById('setupCity'),
    
    // Foto de perfil
    photoInput: document.getElementById('photoInput'),
    photoPreview: document.getElementById('photoPreview'),
    selectPhotoBtn: document.getElementById('selectPhotoBtn'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    
// Intereses (con los nuevos elementos)
interestsGrid: document.getElementById('interestsGrid'),
interestSearchInput: document.getElementById('interestSearchInput'),
interestCounter: document.getElementById('interestCounter'),
counterProgressBar: document.getElementById('counterProgressBar'),
noResultsMessage: document.getElementById('noResultsMessage'),
    
    // Privacidad
    privacyCards: document.querySelectorAll('.privacy-card'),
    privacyRadios: document.querySelectorAll('input[name="privacy"]'),
    
    // Pantalla de completado
    profileSummary: document.getElementById('profileSummary'),
    continueToApp: document.getElementById('continueToApp')
};

// ============================================= 
// DATOS DE INTERESES
// ============================================= 
const interestsData = [
    { id: 'technology', name: 'Tecnología', icon: 'fas fa-laptop-code' },
    { id: 'music', name: 'Música', icon: 'fas fa-music' },
    { id: 'sports', name: 'Deportes', icon: 'fas fa-futbol' },
    { id: 'travel', name: 'Viajes', icon: 'fas fa-plane' },
    { id: 'food', name: 'Comida', icon: 'fas fa-utensils' },
    { id: 'art', name: 'Arte', icon: 'fas fa-palette' },
    { id: 'books', name: 'Libros', icon: 'fas fa-book' },
    { id: 'movies', name: 'Películas', icon: 'fas fa-film' },
    { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' },
    { id: 'fitness', name: 'Fitness', icon: 'fas fa-dumbbell' },
    { id: 'photography', name: 'Fotografía', icon: 'fas fa-camera' },
    { id: 'nature', name: 'Naturaleza', icon: 'fas fa-leaf' },
    { id: 'fashion', name: 'Moda', icon: 'fas fa-tshirt' },
    { id: 'science', name: 'Ciencia', icon: 'fas fa-flask' },
    { id: 'business', name: 'Negocios', icon: 'fas fa-briefcase' },
    { id: 'education', name: 'Educación', icon: 'fas fa-graduation-cap' }
];

// ============================================= 
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================= 
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generateInterests();
    populateCountries();
});

function initializeApp() {
    // Verificar estado de autenticación
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Usuario autenticado
            appState.userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            };
            
            try {
                // Cargar datos del perfil desde Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    profileSetupData = { ...userData };
                    
                    // Si el perfil está completo, redirigir a la app principal
                    if (userData.completedAt) {
                        showToast('info', 'Sesión activa', 'Ya tienes una sesión iniciada');
                        // Aquí podrías redirigir a la página principal de la app
                        // window.location.href = '/dashboard.html';
                        return;
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error);
            }
        } else {
            // Usuario no autenticado
            appState.userData = {};
            profileSetupData = {};
        }
    });
    
    // Mostrar la pantalla de login por defecto
    showScreen('login');
    
    // Configurar el primer paso del setup
    currentStep = 1;
    updateProgressIndicator();
    
    console.log('Aplicación Secretos inicializada');
}

// ============================================= 
// GESTIÓN DE PANTALLAS
// ============================================= 
function showScreen(screenName) {
    // Ocultar todas las pantallas
    elements.loginScreen.classList.remove('visible');
    elements.profileSetupScreen.classList.remove('active');
    elements.completionScreen.classList.remove('active');
    elements.mainMenuScreen.classList.remove('active');
    
    // Mostrar la pantalla solicitada
    switch(screenName) {
        case 'login':
            elements.loginScreen.classList.add('visible');
            break;
        case 'profileSetup':
            elements.profileSetupScreen.classList.add('active');
            break;
        case 'completion':
            elements.completionScreen.classList.add('active');
            break;
            case 'mainMenu': // <-- AÑADE ESTE NUEVO CASO
            elements.mainMenuScreen.classList.add('active');
            break;
    }
    
    appState.currentScreen = screenName;
}

// ============================================= 
// EVENT LISTENERS
// ============================================= 
function setupEventListeners() {
    // Navegación entre formularios de autenticación
    if (elements.showRegister) {
        elements.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('register');
        });
    }
    
    if (elements.showLogin) {
        elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
    if (elements.forgotPasswordLink) {
        elements.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('forgotPassword');
        });
    }
    
    if (elements.backToLogin) {
        elements.backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
// --- AÑADE ESTE BLOQUE PARA LA BÚSQUEDA DE INTERESES ---
if (elements.interestSearchInput) {
    elements.interestSearchInput.addEventListener('input', handleInterestSearch);
}

    // Formularios de autenticación
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.forgotPasswordForm) {
        elements.forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Navegación del setup de perfil
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', nextStep);
    }
    
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', prevStep);
    }
    
    if (elements.completeBtn) {
        elements.completeBtn.addEventListener('click', completeProfile);
    }
    
    // Foto de perfil
    // En script.js, dentro de setupEventListeners()

// --- REEMPLAZA LA SECCIÓN DE "FOTO DE PERFIL" CON ESTO ---
const selectFileBtn = document.getElementById('selectFileBtn');
const photoInput = document.getElementById('photoInput');
const removePhotoBtnModern = document.getElementById('removePhotoBtnModern');
const uploadArea = document.getElementById('uploadArea');
const generateAvatarBtn = document.getElementById('generateAvatarBtn');

// Botón para seleccionar archivo
if (selectFileBtn && photoInput) {
    selectFileBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoSelection);
}

// Botón para remover foto
if (removePhotoBtnModern) {
    removePhotoBtnModern.addEventListener('click', removePhoto);
}

// Lógica para Arrastrar y Soltar (Drag and Drop)
if (uploadArea) {
    // Prevenir comportamientos por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Resaltar el área al arrastrar un archivo sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        }, false);
    });

    // Quitar el resaltado al salir del área
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        }, false);
    });

    // Manejar el archivo soltado
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            // Simular el evento 'change' del input con el archivo soltado
            photoInput.files = files;
            const event = new Event('change', { bubbles: true });
            photoInput.dispatchEvent(event);
        }
    }, false);
}

// Botón para generar avatar
if (generateAvatarBtn) {
    generateAvatarBtn.addEventListener('click', handleGenerateAvatar);
}
// --- FIN DE LA SECCIÓN A REEMPLAZAR ---


    const registerPasswordInput = document.getElementById('registerPassword');
if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', validatePasswordStrength);
}

// --- AÑADE ESTAS LÍNEAS PARA LOS BOTONES DE GOOGLE ---
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleLogin);
    }
    // --- FIN DE LAS LÍNEAS A AÑADIR ---

    
    // Privacidad
    elements.privacyCards.forEach(card => {
        card.addEventListener('click', () => {
            selectPrivacyOption(card);
        });
    });
    
    // Botón continuar a la app
    if (elements.continueToApp) {
        elements.continueToApp.addEventListener('click', () => {
            // Aquí navegarías a la página principal de la aplicación
            showToast('success', '¡Bienvenido!', 'Redirigiendo a la aplicación principal...');
            setTimeout(() => {
                window.location.href = '/app'; // Cambiar por la URL de tu aplicación principal
            }, 2000);
        });
    }
    
    // Toggle de contraseñas
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });


     // --- AÑADIDO: Lógica para activar el campo de ciudad ---
    // Dentro de setupEventListeners(), REEMPLAZA el listener anterior de setupCountry

if (elements.setupCountry) {
    elements.setupCountry.addEventListener('change', (e) => {
        const countryCode = e.target.value;
        if (countryCode) {
            // Si se selecciona un país, poblamos las ciudades correspondientes
            populateCities(countryCode);
        } else {
            // Si se deselecciona, desactivamos y reseteamos el selector de ciudad
            const citySelect = elements.setupCity;
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Primero elige un país</option>';
        }
    });
}


// En script.js, dentro de la función setupEventListeners()

// --- AÑADE ESTE BLOQUE PARA EL CONTADOR DE LA BIOGRAFÍA ---
const bioTextarea = document.getElementById('setupBio');
const bioCharCounter = document.getElementById('bioCharCounter');

if (bioTextarea && bioCharCounter) {
    bioTextarea.addEventListener('input', () => {
        const maxLength = 150;
        const currentLength = bioTextarea.value.length;
        bioCharCounter.textContent = `${currentLength} / ${maxLength}`;
        
        // Opcional: cambiar color si se pasa del límite
        if (currentLength > maxLength) {
            bioCharCounter.style.color = 'var(--danger-color)';
            bioTextarea.value = bioTextarea.value.substring(0, maxLength);
            bioCharCounter.textContent = `${maxLength} / ${maxLength}`;
        } else {
            bioCharCounter.style.color = 'var(--gray-500)';
        }
    });
}
// --- FIN DEL BLOQUE A AÑADIR ---


    
    // Validación en tiempo real
    setupRealTimeValidation();
}

// ============================================= 
// AUTENTICACIÓN
// ============================================= 
function switchAuthForm(formType) {
    // Ocultar todos los formularios
    elements.loginFormContainer.classList.remove('active');
    elements.registerFormContainer.classList.remove('active');
    elements.forgotPasswordFormContainer.classList.remove('active');
    
    // Mostrar el formulario solicitado
    switch(formType) {
        case 'login':
            elements.loginFormContainer.classList.add('active');
            break;
        case 'register':
            elements.registerFormContainer.classList.add('active');
            break;
        case 'forgotPassword':
            elements.forgotPasswordFormContainer.classList.add('active');
            break;
    }
}


// En script.js (dentro de la sección de AUTENTICACIÓN)

async function handleGoogleLogin() {
    showLoading(true); // Muestra tu overlay de carga

    try {
        // 1. Inicia el flujo de autenticación con la ventana emergente de Google
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // 2. Revisa si el usuario ya existe en tu base de datos (Firestore)
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // Guarda los datos del usuario en el estado de la app
        appState.userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL
        };
        profileSetupData = { ...profileSetupData, ...appState.userData };

        if (userDoc.exists()) {
            // --- CASO 1: EL USUARIO YA EXISTE ---
            showToast('success', `¡Hola de nuevo, ${user.displayName}!`, 'Inicio de sesión exitoso.');
            
            // Lo llevamos a la pantalla de completado, como en tu flujo de login normal
            setTimeout(() => {
                showScreen('completion');
                generateProfileSummary(); // Esta función usará los datos que acabamos de guardar
            }, 1500);

        } else {
            // --- CASO 2: ES UN USUARIO NUEVO ---
            // 3. Guarda la información básica del nuevo usuario en Firestore
            await setDoc(userDocRef, {
                username: user.displayName || 'Usuario de Google',
                email: user.email,
                profilePhotoUrl: user.photoURL || null,
                createdAt: new Date(),
                provider: 'google', // Útil para saber cómo se registró
                completedAt: null, // El perfil aún no está completo
            });

            showToast('success', '¡Cuenta creada con Google!', 'Ahora, completa tu perfil.');

            // 4. Lo enviamos al flujo de configuración de perfil
            setTimeout(() => {
                showScreen('profileSetup');
                // Pre-rellenamos el nombre en el formulario para facilitar las cosas
                if (elements.setupName) {
                    elements.setupName.value = user.displayName || '';
                }
            }, 1500);
        }

    } catch (error) {
        // Manejo de errores comunes
        let errorMessage = 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'La ventana de inicio de sesión fue cerrada.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'Ya existe una cuenta con este email, pero usando contraseña.';
        }
        showToast('error', 'Error de Autenticación', errorMessage);
        console.error("Error con el popup de Google:", error);
    } finally {
        showLoading(false); // Oculta el overlay de carga
    }
}



// --- REEMPLAZA TU FUNCIÓN handleLogin CON ESTA ---
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email) || !password) {
        showToast('error', 'Error', 'Por favor, ingresa un email y contraseña válidos.');
        return;
    }
    
    showLoading(true);
    
    try {
        // Iniciar sesión con Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        appState.userData = {
            uid: user.uid,
            email: user.email,
        };
        
        showToast('success', '¡Bienvenido de vuelta!', 'Inicio de sesión exitoso.');
        
        // Aquí deberías redirigir al usuario a la página principal de tu app
        // En lugar de ir a la pantalla de 'completion'
        setTimeout(() => {
            alert("¡Inicio de sesión exitoso! Redirigiendo a la app...");
            // window.location.href = '/dashboard.html'; // Ejemplo de redirección
            showScreen('completion'); // Mantenemos tu flujo por ahora
            generateProfileSummary();
        }, 1500);
        
    } catch (error) {
        let errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            // No damos pistas específicas por seguridad
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
        }
        showToast('error', 'Error de Inicio de Sesión', errorMessage);
        console.error("Error de Firebase al iniciar sesión:", error);
    } finally {
        showLoading(false);
    }
}


// --- REEMPLAZA TU FUNCIÓN handleRegister CON ESTA ---

// Asegúrate de haber inicializado Firebase y tener la variable 'auth' disponible.
// Por ejemplo:
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// const auth = getAuth(app ); // 'app' es tu app de Firebase inicializada

// --- REEMPLAZA TU FUNCIÓN handleRegister CON ESTA ---
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || name.length < 2) {
        showToast('error', 'Error', 'El nombre debe tener al menos 2 caracteres');
        return;
    }
    if (!validateEmail(email)) {
        showToast('error', 'Error', 'Por favor, ingresa un email válido');
        return;
    }
    if (password !== confirmPassword) {
        showToast('error', 'Error', 'Las contraseñas no coinciden');
        return;
    }
    
    showLoading(true);
    
    try {
        // 1. Crear el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Guardar información adicional (como el nombre) en Firestore
        // Se crea un documento en la colección 'users' con el ID del usuario (user.uid)
        await setDoc(doc(db, "users", user.uid), {
            username: name,
            email: user.email,
            createdAt: new Date(),
            // Puedes añadir más datos iniciales aquí
            bio: "",
            age: null,
            country: "",
            city: ""
        });

        appState.userData = {
            uid: user.uid,
            email: user.email,
            name: name
        };
        
        profileSetupData.name = name;
        profileSetupData.email = user.email;
        
        showToast('success', '¡Cuenta creada!', 'Ahora completa tu perfil');
        
        setTimeout(() => {
            showScreen('profileSetup');
            if (elements.setupName) {
                elements.setupName.value = name;
            }
        }, 1500);
        
    } catch (error) {
        let errorMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este correo electrónico ya está registrado.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
        }
        showToast('error', 'Error de Registro', errorMessage);
        console.error("Error de Firebase al registrar:", error);
    } finally {
        showLoading(false);
    }
}

// Asegúrate de que 'auth' esté disponible globalmente desde el script de inicialización
// o pásalo como parámetro si prefieres un enfoque más modular.

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    if (!validateEmail(email)) {
        showToast('error', 'Error', 'Por favor, ingresa un email válido');
        return;
    }
    
    showLoading(true);
    
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('success', 'Email enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.');
        setTimeout(() => switchAuthForm('login'), 3000);
    } catch (error) {
        let errorMessage = 'No se pudo enviar el email. Inténtalo de nuevo.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No existe una cuenta con este correo electrónico.';
        }
        showToast('error', 'Error', errorMessage);
        console.error("Error de Firebase:", error.code, error.message);
    } finally {
        showLoading(false);
    }
}


// ============================================= 
// SETUP DE PERFIL
// ============================================= 
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            currentStep++;
            updateStep();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}


// En script.js
// --- REEMPLAZA TU FUNCIÓN updateStep CON ESTA VERSIÓN FINAL Y CORRECTA ---

function updateStep() {
    // 1. Ocultar TODOS los contenedores de los pasos
    elements.setupSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    // 2. Encontrar el contenedor del paso actual usando su atributo data-step
    const currentStepElement = document.querySelector(`.setup-step[data-step="${currentStep}"]`);
    
    // 3. Mostrar SOLO el contenedor del paso actual añadiendo la clase 'active'
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // 4. Actualizar el indicador de progreso (esta función ya es correcta)
    updateProgressIndicator();
    
    // 5. Actualizar los botones de navegación (esta función ya es correcta)
    updateNavigationButtons();
}



function updateProgressIndicator() {
    elements.progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function updateNavigationButtons() {
    // Botón anterior
    if (currentStep === 1) {
        elements.prevBtn.style.display = 'none';
    } else {
        elements.prevBtn.style.display = 'flex';
    }
    
    // Botón siguiente/completar
    if (currentStep === 4) {
        elements.nextBtn.style.display = 'none';
        elements.completeBtn.style.display = 'flex';
    } else {
        elements.nextBtn.style.display = 'flex';
        elements.completeBtn.style.display = 'none';
    }
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateBasicInfo();
        case 2:
            return true; // Foto es opcional
        case 3:
            return true; // Intereses son opcionales
        case 4:
            return validatePrivacySettings();
        default:
            return true;
    }
}

function validateBasicInfo() {
    
    const age = elements.setupAge.value;
    const gender = elements.setupGender.value;
    const country = elements.setupCountry.value;
    const city = elements.setupCity.value.trim();
    
   
    
    if (!age || age < 13 || age > 120) {
        showToast('error', 'Error', 'Por favor, ingresa una edad válida');
        return false;
    }
    
    if (!gender) {
        showToast('error', 'Error', 'Por favor, selecciona tu género');
        return false;
    }
    
    if (!country) {
        showToast('error', 'Error', 'Por favor, selecciona tu país');
        return false;
    }
    
    if (!city || city.length < 2) {
        showToast('error', 'Error', 'Por favor, ingresa tu ciudad');
        return false;
    }
    
    // Guardar datos
    
    profileSetupData.bio = elements.setupBio.value.trim();
    profileSetupData.age = age;
    profileSetupData.gender = gender;
    profileSetupData.country = country;
    profileSetupData.city = city;
    
    return true;
}

function validatePrivacySettings() {
    const selectedPrivacy = document.querySelector('input[name="privacy"]:checked');
    
    if (!selectedPrivacy) {
        showToast('error', 'Error', 'Por favor, selecciona una configuración de privacidad');
        return false;
    }
    
    profileSetupData.privacy = selectedPrivacy.value;
    return true;
}

// ============================================= 
// FOTO DE PERFIL
// ============================================= 
// En script.js (puedes poner estas funciones en la sección de FOTO DE PERFIL)

// --- REEMPLAZA TU FUNCIÓN handlePhotoSelection CON ESTA ---
function handlePhotoSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('error', 'Archivo no válido', 'Por favor, selecciona una imagen.');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Archivo muy grande', 'La imagen debe pesar menos de 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const previewContainer = document.getElementById('photoPreviewModern');
        previewContainer.innerHTML = `<img src="${event.target.result}" alt="Vista previa">`;
        document.getElementById('removePhotoBtnModern').style.display = 'flex';
    };
    reader.readAsDataURL(file);
    selectedPhoto = file; // Guardamos el objeto File para subirlo después
}

// --- REEMPLAZA TU FUNCIÓN removePhoto CON ESTA ---
function removePhoto() {
    const previewContainer = document.getElementById('photoPreviewModern');
    previewContainer.innerHTML = `
        <div class="default-avatar-modern">
            <i class="fas fa-user"></i>
        </div>
    `;
    document.getElementById('removePhotoBtnModern').style.display = 'none';
    document.getElementById('photoInput').value = ''; // Limpiar el input
    selectedPhoto = null;
}

// --- AÑADE ESTA NUEVA FUNCIÓN ---
async function handleGenerateAvatar() {
    const btn = document.getElementById('generateAvatarBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        // Usamos la API de Avataaars (gratuita y sin registro)
        const randomSeed = Math.random().toString(36).substring(7);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

        // Para poder subirla, necesitamos convertir la URL a un objeto File (Blob )
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const file = new File([blob], "avatar.svg", { type: "image/svg+xml" });

        // Mostramos la vista previa
        const previewContainer = document.getElementById('photoPreviewModern');
        previewContainer.innerHTML = `<img src="${avatarUrl}" alt="Avatar generado">`;
        document.getElementById('removePhotoBtnModern').style.display = 'flex';

        // Guardamos el archivo para subirlo
        selectedPhoto = file;
        showToast('success', '¡Avatar generado!', 'Se ha creado un avatar único para ti.');

    } catch (error) {
        console.error("Error generando el avatar:", error);
        showToast('error', 'Error', 'No se pudo generar el avatar. Inténtalo de nuevo.');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}


// ============================================= 
// INTERESES (VERSIÓN MODERNA Y FUNCIONAL)
// ============================================= 

function generateInterests() {
    if (!elements.interestsGrid) return;
    
    elements.interestsGrid.innerHTML = ''; // Limpiamos la cuadrícula
    
    interestsData.forEach(interest => {
        const interestElement = document.createElement('div');
        interestElement.className = 'interest-card-modern';
        interestElement.dataset.interestId = interest.id; // Usamos data-interest-id
        interestElement.dataset.interestName = interest.name.toLowerCase(); // Para la búsqueda
        
        interestElement.innerHTML = `
            <div class="card-icon"><i class="${interest.icon}"></i></div>
            <span class="card-name">${interest.name}</span>
            <div class="card-checkmark"><i class="fas fa-check"></i></div>
        `;
        
        // El evento de click ahora llama a toggleInterest con el elemento mismo
        interestElement.addEventListener('click', () => toggleInterest(interestElement));
        
        elements.interestsGrid.appendChild(interestElement);
    });
}

function toggleInterest(interestElement) {
    const interestId = interestElement.dataset.interestId;
    const isSelected = interestElement.classList.contains('selected');
    
    if (isSelected) {
        // --- Deseleccionar interés ---
        interestElement.classList.remove('selected');
        selectedInterests = selectedInterests.filter(id => id !== interestId);
    } else {
        // --- Seleccionar interés (con límite) ---
        if (selectedInterests.length >= 10) {
            showToast('warning', 'Límite alcanzado', 'Puedes seleccionar un máximo de 10 intereses.');
            return;
        }
        interestElement.classList.add('selected');
        selectedInterests.push(interestId);
    }
    
    // Actualizamos el contador y la barra de progreso
    updateInterestCounter();
    
    // Guardamos los intereses en el objeto de datos del perfil
    profileSetupData.interests = selectedInterests;
}

// --- ¡NUEVA FUNCIÓN PARA ACTUALIZAR EL CONTADOR! ---
function updateInterestCounter() {
    const count = selectedInterests.length;
    const maxInterests = 10;

    if (elements.interestCounter) {
        elements.interestCounter.textContent = `${count}/${maxInterests}`;
    }

    if (elements.counterProgressBar) {
        const percentage = (count / maxInterests) * 100;
        elements.counterProgressBar.style.width = `${percentage}%`;
    }
}

// --- ¡NUEVA FUNCIÓN PARA LA BÚSQUEDA! ---
function handleInterestSearch() {
    const searchTerm = elements.interestSearchInput.value.toLowerCase().trim();
    const allInterests = document.querySelectorAll('.interest-card-modern');
    let visibleCount = 0;

    allInterests.forEach(card => {
        const interestName = card.dataset.interestName;
        
        if (interestName.includes(searchTerm)) {
            card.style.display = 'flex'; // 'flex' porque así están diseñadas las tarjetas
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Mostrar u ocultar el mensaje de "No hay resultados"
    if (elements.noResultsMessage) {
        if (visibleCount === 0) {
            elements.noResultsMessage.style.display = 'block';
        } else {
            elements.noResultsMessage.style.display = 'none';
        }
    }
}


// ============================================= 
// PRIVACIDAD
// ============================================= 
function selectPrivacyOption(card) {
    // Remover selección anterior
    elements.privacyCards.forEach(c => c.classList.remove('selected'));
    
    // Seleccionar nueva opción
    card.classList.add('selected');
    
    // Marcar el radio button correspondiente
    const privacy = card.dataset.privacy;
    const radio = document.getElementById(`privacy${privacy.charAt(0).toUpperCase() + privacy.slice(1)}`);
    if (radio) {
        radio.checked = true;
    }
}

// ============================================= 
// COMPLETAR PERFIL (VERSIÓN FINAL CON SUBIDA DE ARCHIVOS)
// ============================================= 
// En script.js
// --- REEMPLAZA TU FUNCIÓN completeProfile CON ESTA VERSIÓN DE DEPURACIÓN ---

async function completeProfile() {
    // 1. Validar el paso actual (privacidad)
    if (!validatePrivacySettings()) {
        return;
    }

    const completeBtn = document.getElementById('completeBtn');
    completeBtn.classList.add('loading');
    completeBtn.disabled = true;
    showLoading(true);

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('FALLO CRÍTICO: auth.currentUser es nulo o indefinido.');
        }
        const userId = currentUser.uid;

        let photoURL = profileSetupData.profilePhotoUrl || null;

        // --- INICIO DE LA ZONA DE DEPURACIÓN ---
        console.log("--- INICIANDO DEPURACIÓN DE SUBIDA DE FOTO ---");
        console.log("¿Hay una foto seleccionada? (selectedPhoto):", selectedPhoto);

        if (selectedPhoto) {
            // Verificación explícita de las variables ANTES de usarlas
            console.log("Valor de 'storage':", storage);
            console.log("Valor de 'userId':", userId);
            console.log("Valor de 'selectedPhoto.name':", selectedPhoto ? selectedPhoto.name : "selectedPhoto es nulo");

            // Guarda de seguridad redundante
            if (!storage || !userId || !selectedPhoto.name) {
                throw new Error(`¡Una variable es inválida! storage: ${!!storage}, userId: ${!!userId}, selectedPhoto.name: ${selectedPhoto ? selectedPhoto.name : 'N/A'}`);
            }

            console.log("Todo parece correcto. Intentando crear la referencia de Storage...");
            const photoRef = ref(storage, `profile_photos/${userId}/${selectedPhoto.name}`);
            console.log("Referencia de Storage creada con éxito:", photoRef);

            const uploadResult = await uploadBytes(photoRef, selectedPhoto);
            photoURL = await getDownloadURL(uploadResult.ref);
            console.log("Foto subida y URL obtenida:", photoURL);
        } else {
            console.log("No se seleccionó ninguna foto. Omitiendo subida.");
        }
        // --- FIN DE LA ZONA DE DEPURACIÓN ---

        const finalProfileData = {
            // ... (el resto de la función sigue igual)
            ...profileSetupData,
            interests: selectedInterests,
            privacy: document.querySelector('input[name="privacy"]:checked').value,
            profilePhotoUrl: photoURL,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        delete finalProfileData.name;
        delete finalProfileData.email;

        await updateDoc(doc(db, "users", userId), finalProfileData);

        profileSetupData.profilePhotoUrl = photoURL;
        profileSetupData.name = currentUser.displayName || profileSetupData.name;
        profileSetupData.email = currentUser.email;

        showToast('success', '¡Perfil completado!', 'Tu cuenta ha sido configurada exitosamente.');

        setTimeout(() => {
            showScreen('completion');
            generateProfileSummary();
        }, 1500);


            // --- INICIO DE LA MODIFICACIÓN ---
        
        // Preparamos los datos para la nueva pantalla
        const menuUsernameEl = document.getElementById('menuUsername');
        const menuProfileAvatarEl = document.getElementById('menuProfileAvatar');

        if (menuUsernameEl) {
            menuUsernameEl.textContent = currentUser.displayName || profileSetupData.name;
        }
        if (menuProfileAvatarEl) {
            // Usamos la foto recién subida o la que ya tenía, o un placeholder
// En script.js, dentro de la función completeProfile

// --- REEMPLAZA LA LÍNEA DEL AVATAR CON ESTA ---
menuProfileAvatarEl.src = photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Cpath d='M50 58.33C63.43 58.33 74.17 69.07 74.17 82.5V91.67H25.83V82.5C25.83 69.07 36.57 58.33 50 58.33Z' fill='%23bdbdbd'/%3E%3Ccircle cx='50' cy='41.67' r='16.67' fill='%23bdbdbd'/%3E%3C/svg%3E";
        }

        showToast('success', '¡Bienvenido!', 'Tu perfil ha sido configurado.');

        // 5. Transición a la NUEVA pantalla de menú
        setTimeout(() => {
            showScreen('mainMenu'); // <-- ¡EL CAMBIO CLAVE!
            // Ya no llamamos a generateProfileSummary() ni a showScreen('completion')
        }, 1500);

        // --- FIN DE LA MODIFICACIÓN ---

    } catch (error) {
        console.error('--- ERROR DETALLADO CAPTURADO ---');
        console.error(error); // Muestra el error completo en la consola
        showToast('error', 'Error Inesperado', 'No se pudo guardar tu perfil. Revisa la consola.');
          
    } finally {
        completeBtn.classList.remove('loading');
        completeBtn.disabled = false;
        showLoading(false);
    }
}


function generateProfileSummary() {
    if (!elements.profileSummary) return;
    
    const summaryData = [
        { label: 'Nombre', value: profileSetupData.name || appState.userData.name || 'Usuario Demo' },
        { label: 'Email', value: profileSetupData.email || appState.userData.email || 'demo@secretos.com' },
        { label: 'Edad', value: profileSetupData.age || 'No especificada' },
        { label: 'País', value: getCountryName(profileSetupData.country) || 'No especificado' },
        { label: 'Ciudad', value: profileSetupData.city || 'No especificada' },
        { label: 'Intereses', value: selectedInterests.length > 0 ? `${selectedInterests.length} seleccionados` : 'Ninguno' },
        { label: 'Privacidad', value: getPrivacyLabel(profileSetupData.privacy) || 'Público' }
    ];
    
    elements.profileSummary.innerHTML = `
        <h4>Resumen de tu perfil</h4>
        ${summaryData.map(item => `
            <div class="summary-item">
                <span class="summary-label">${item.label}:</span>
                <span class="summary-value">${item.value}</span>
            </div>
        `).join('')}
    `;
}

// ============================================= 
// UTILIDADES
// ============================================= 
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function togglePasswordVisibility(e) {
    const button = e.target.closest('.toggle-password');
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye-slash';
    }
}

function setupRealTimeValidation() {
    // Validación de email
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const validation = this.parentElement.querySelector('.input-validation');
            if (this.value && !validateEmail(this.value)) {
                validation.textContent = 'Email inválido';
                validation.className = 'input-validation error';
            } else {
                validation.textContent = '';
                validation.className = 'input-validation';
            }
        });
    });
    
    // Validación de contraseñas
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const validation = this.parentElement.querySelector('.input-validation');
            if (this.value.length > 0 && this.value.length < 6) {
                validation.textContent = 'Mínimo 6 caracteres';
                validation.className = 'input-validation error';
            } else {
                validation.textContent = '';
                validation.className = 'input-validation';
            }
        });
    });
}

function getCountryName(countryCode) {
    const countries = {
        'AR': 'Argentina', 'BO': 'Bolivia', 'BR': 'Brasil', 'CL': 'Chile',
        'CO': 'Colombia', 'CR': 'Costa Rica', 'CU': 'Cuba', 'EC': 'Ecuador',
        'SV': 'El Salvador', 'ES': 'España', 'GT': 'Guatemala', 'HN': 'Honduras',
        'MX': 'México', 'NI': 'Nicaragua', 'PA': 'Panamá', 'PY': 'Paraguay',
        'PE': 'Perú', 'PR': 'Puerto Rico', 'DO': 'República Dominicana',
        'UY': 'Uruguay', 'VE': 'Venezuela'
    };
    return countries[countryCode];
}

function getPrivacyLabel(privacy) {
    const labels = {
        'public': 'Público',
        'friends': 'Solo Seguidores',
        'private': 'Privado'
    };
    return labels[privacy];
}

async function simulateAuth() {
    // Simular tiempo de respuesta del servidor
    return new Promise(resolve => setTimeout(resolve, 1500));
}

function populateCountries() {
    if (!elements.setupCountry) return;

    const countrySelect = elements.setupCountry;
    
    countryList.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Añade esta nueva función en la sección de UTILIDADES

function populateCities(countryCode) {
    const citySelect = elements.setupCity;
    citySelect.innerHTML = ''; // Limpia las opciones anteriores

    const cities = cityListByCountry[countryCode];

    if (cities && cities.length > 0) {
        // Si encontramos ciudades para ese país
        citySelect.disabled = false;
        
        // Añadimos una primera opción de instrucción
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona tu ciudad";
        citySelect.appendChild(defaultOption);

        // Añadimos las ciudades de la lista
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        // Si no hay una lista de ciudades para ese país, volvemos a un campo de texto
        // (Esta es una mejora opcional pero muy útil)
        showToast('info', 'No hay lista de ciudades', 'Por favor, escribe tu ciudad manualmente.');
        
        // Reemplazamos el <select> por un <input>
        const inputWrapper = citySelect.parentElement;
        const newCityInput = document.createElement('input');
        newCityInput.type = 'text';
        newCityInput.id = 'setupCity';
        newCityInput.placeholder = 'Escribe tu ciudad';
        newCityInput.required = true;
        
        inputWrapper.replaceChild(newCityInput, citySelect);
        elements.setupCity = newCityInput; // Actualizamos la referencia en nuestro objeto de elementos
    }
}


// ============================================= 
// LOADING Y NOTIFICACIONES
// ============================================= 
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
    appState.isLoading = show;
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar event listener para cerrar
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Agregar al contenedor
    elements.toastContainer.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (toast && toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }
}

// ============================================= 
// ESTILOS ADICIONALES PARA ANIMACIONES
// ============================================= 
const additionalStyles = `
@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
`;

// Agregar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

console.log('Aplicación Secretos - Registro y Perfil cargada correctamente');

// REEMPLAZA LA FUNCIÓN ANTERIOR CON ESTA
function validatePasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const container = document.getElementById('password-strength-container');
    const segments = document.querySelectorAll('.strength-meter-bar .bar-segment');
    const strengthText = document.getElementById('strength-text');
    
    // Elementos de la lista de criterios en el tooltip
    const checks = {
        length: document.getElementById('length-check'),
        uppercase: document.getElementById('uppercase-check'),
        number: document.getElementById('number-check'),
        special: document.getElementById('special-check')
    };

    // Hacer visible el medidor si hay texto
    if (password.length > 0) {
        container.classList.add('visible');
    } else {
        container.classList.remove('visible');
    }

    let score = 0;
    
    // Validar criterios y actualizar la lista del tooltip
    if (password.length >= 8) {
        score++;
        checks.length.classList.add('valid');
        checks.length.querySelector('i').className = 'fas fa-check-circle';
    } else {
        checks.length.classList.remove('valid');
        checks.length.querySelector('i').className = 'fas fa-times-circle';
    }

    if (/[A-Z]/.test(password)) {
        score++;
        checks.uppercase.classList.add('valid');
        checks.uppercase.querySelector('i').className = 'fas fa-check-circle';
    } else {
        checks.uppercase.classList.remove('valid');
        checks.uppercase.querySelector('i').className = 'fas fa-times-circle';
    }

    if (/[0-9]/.test(password)) {
        score++;
        checks.number.classList.add('valid');
        checks.number.querySelector('i').className = 'fas fa-check-circle';
    } else {
        checks.number.classList.remove('valid');
        checks.number.querySelector('i').className = 'fas fa-times-circle';
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
        checks.special.classList.add('valid');
        checks.special.querySelector('i').className = 'fas fa-check-circle';
    } else {
        checks.special.classList.remove('valid');
        checks.special.querySelector('i').className = 'fas fa-times-circle';
    }

    // Actualizar texto y colores de la barra
    const textMap = ['Muy Débil', 'Débil', 'Buena', 'Fuerte', 'Muy Fuerte'];
    const colorMap = ['strength-weak', 'strength-weak', 'strength-medium', 'strength-good', 'strength-strong'];
    const colorHexMap = ['#ef4444', '#ef4444', '#f97316', '#facc15', '#4ade80'];

    strengthText.textContent = textMap[score] || 'Muy Débil';
    strengthText.style.color = colorHexMap[score] || '#ef4444';

    segments.forEach((segment, index) => {
        segment.className = 'bar-segment'; // Reset class
        if (index < score) {
            segment.classList.add(colorMap[score]);
        }
    });
}