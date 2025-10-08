// Contenido de dashboard/dashboard.js

// --- IMPORTACIONES ---
// (Aquí podrías importar funciones de Firebase para obtener datos del dashboard)

// --- FUNCIÓN PARA CARGAR EL DASHBOARD (EXPORTADA) ---
export async function loadDashboardPage() {
    if (document.querySelector('.dashboard-container')) return; // Evita duplicados

    try {
        // Cargar CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'dashboard/dashboard.css';
        cssLink.id = 'dashboard-css';
        document.head.appendChild(cssLink);

        // Cargar HTML
        const response = await fetch('dashboard/dashboard.html');
        if (!response.ok) throw new Error('No se pudo cargar dashboard.html');
        const html = await response.text();
        
        // Crear contenedor y añadirlo
        const container = document.createElement('div');
        container.id = 'dashboard-page-container';
        container.innerHTML = html;
        document.body.appendChild(container);

        // Inicializar la lógica interna del dashboard
        initializeDashboardInternals();

        // Animar la entrada
        setTimeout(() => {
            document.querySelector('.dashboard-container').style.opacity = '1';
        }, 50);

    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
    }
}

// --- LÓGICA INTERNA DEL DASHBOARD ---
function initializeDashboardInternals() {
    const router = {
        'overview': { path: 'dashboard/views/overview.html', title: 'Visión General' },
        'properties': { path: 'dashboard/views/properties.html', title: 'Mis Propiedades' },
        'profile': { path: 'dashboard/views/profile.html', title: 'Mi Perfil' }
    };

    async function loadView(viewName) {
        // ... (la función loadView que ya tenías)
    }

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadView(viewName);
        });
    });

    // Cargar vista inicial
    loadView('overview');

    // Lógica de Logout
    document.getElementById('dashboard-logout-btn').addEventListener('click', () => {
        alert('Cerrando sesión...');
        document.getElementById('dashboard-page-container').remove();
        document.getElementById('dashboard-css').remove();
    });
}
