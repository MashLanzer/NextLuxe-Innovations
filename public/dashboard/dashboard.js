// Contenido de dashboard/dashboard.js

// El "Router" del Dashboard
const router = {
    'overview': {
        path: 'dashboard/views/overview.html',
        title: 'Visión General'
    },
    'properties': {
        path: 'dashboard/views/properties.html',
        title: 'Mis Propiedades'
    },
    'profile': {
        path: 'dashboard/views/profile.html',
        title: 'Mi Perfil'
    }
};

// Función para cargar una vista específica
async function loadView(viewName) {
    const view = router[viewName];
    if (!view) {
        console.error(`La vista "${viewName}" no existe.`);
        return;
    }

    try {
        const response = await fetch(view.path);
        if (!response.ok) throw new Error(`No se pudo cargar ${view.path}`);
        const html = await response.text();

        // Actualizar el contenido y el título
        document.getElementById('dashboard-view-content').innerHTML = html;
        document.getElementById('dashboard-view-title').textContent = view.title;

        // Aquí podrías llamar a funciones específicas para cada vista
        // ej: if (viewName === 'overview') { loadOverviewCharts(); }

    } catch (error) {
        console.error('Error al cargar la vista:', error);
    }
}

// Función principal que se ejecuta cuando el dashboard se carga
export function initializeDashboard() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    // Cargar la vista inicial (overview)
    loadView('overview');

    // Añadir listeners a los botones de navegación
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            
            // Actualizar el estado activo
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Cargar la nueva vista
            loadView(viewName);
        });
    });

    // Lógica del botón de logout
    const logoutButton = document.getElementById('dashboard-logout-btn');
    logoutButton.addEventListener('click', () => {
        // Aquí iría la lógica de Firebase para cerrar sesión
        // import { getAuth, signOut } from "firebase/auth";
        // const auth = getAuth();
        // signOut(auth).then(() => { ... });
        
        alert('Cerrando sesión...');
        document.querySelector('.dashboard-container').remove(); // Cierra el dashboard
    });
}
