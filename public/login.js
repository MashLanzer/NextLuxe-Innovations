// Contenido de login.js

// Importa las funciones de Firebase que necesitarás
// (Asegúrate de que tu script principal ya haya inicializado Firebase)
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Obtiene la instancia de autenticación
const auth = getAuth( );

// Función principal que se ejecuta cuando el HTML del login se carga
export function initializeLogin() {
    const form = document.getElementById('auth-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        // Lógica de inicio de sesión
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Usuario ha iniciado sesión correctamente
                console.log('Usuario autenticado:', userCredential.user);
                alert('¡Inicio de sesión exitoso!');
                
                // Aquí iría la lógica para cerrar el login y mostrar el dashboard
                document.getElementById('login-page-container').remove();
            })
            .catch((error) => {
                console.error('Error de autenticación:', error.code, error.message);
                alert(`Error: ${error.message}`);
            });
    });

    // Aquí puedes añadir la lógica para "Regístrate" y "Olvidé mi contraseña"
}
