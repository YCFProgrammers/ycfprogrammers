//Menu Desplegable
function toggleDropdown() {
    document.getElementById("categoriesDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropdown-button')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// TODO: REEMPLAZA ESTE OBJETO con la configuración de tu proyecto Firebase
// que copiaste del Paso 1 en la configuración original de Firebase.
// Ya has puesto tus credenciales reales aquí.
const firebaseConfig = {
    apiKey: "AIzaSyAPGfI248M3JM12_UC9n8pSc3EQdgnxyp8",
    authDomain: "coding-study-group.firebaseapp.com",
    projectId: "coding-study-group",
    storageBucket: "coding-study-group.firebasestorage.app",
    messagingSenderId: "758696967653",
    appId: "1:758696967653:web:14a25dec60cf2cf05e830c",
    measurementId: "G-M39CBKCHXX"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Obtén la instancia de autenticación
const auth = firebase.auth();

// Crea una instancia del proveedor de autenticación de Google
const googleProvider = new firebase.auth.GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    // -------- Funcionalidad para el botón de Google Sign-In --------
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const loginMessageDiv = document.getElementById('loginMessage'); // Mantenemos este div para mensajes

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            // Limpiar mensajes anteriores
            loginMessageDiv.textContent = '';
            loginMessageDiv.className = 'message'; // Reset classes

            // Mostrar un mensaje de "procesando" (opcional)
            loginMessageDiv.textContent = 'Abriendo ventana de Google...';
            // Podrías añadir un estilo 'info' en tu CSS para este estado
            loginMessageDiv.classList.add('info');


            try {
                // Abre la ventana emergente de Google Sign-In
                const result = await auth.signInWithPopup(googleProvider);
                // El objeto 'result' contiene información sobre el usuario autenticado y el token de acceso de Google
                const user = result.user;

                // Si tiene éxito, el usuario ya está logueado en Firebase
                loginMessageDiv.textContent = 'Inicio de sesión con Google exitoso. ¡Bienvenido!';
                loginMessageDiv.classList.remove('info');
                loginMessageDiv.classList.add('success');

                console.log('Usuario logueado con Google:', user);
                // Puedes acceder a info específica de Google como el token de acceso si lo necesitas para otras APIs de Google
                // const credential = result.credential;
                // const googleAccessToken = credential.accessToken;


                // --- Redirección después del login exitoso con el popup ---
                // Usamos setTimeout para que el usuario alcance a ver el mensaje de éxito
                setTimeout(() => {
                     window.location.href = 'dashboard.html'; // Redirige a la página del dashboard
                }, 1500); // Espera 1.5 segundos antes de redirigir
                // --- Fin Redirección ---

            } catch (error) {
                // Si ocurre un error
                loginMessageDiv.textContent = `Error al iniciar sesión con Google: ${error.message}`;
                 loginMessageDiv.classList.remove('info');
                 loginMessageDiv.classList.add('error');

                console.error('Código de error de Firebase Google Sign-In:', error.code);
                console.error('Mensaje de error de Firebase Google Sign-In:', error.message);

                // Puedes manejar errores específicos de Firebase
                if (error.code === 'auth/popup-closed-by-user') {
                     loginMessageDiv.textContent = 'Error: Ventana de Google cerrada por el usuario.';
                } else if (error.code === 'auth/cancelled-popup-request') {
                    loginMessageDiv.textContent = 'Error: Ya había una ventana de Google abierta.';
                } else if (error.code === 'auth/auth-domain-config-required') {
                     loginMessageDiv.textContent = 'Error: El dominio actual no está autorizado. Añádelo en la consola de Firebase.';
                }
                 // Añade más condiciones 'else if' para otros errores si es necesario
            }
        });
    }

    // -------- Listener para estado de autenticación (Maneja sesiones existentes y redirección automática) --------
    auth.onAuthStateChanged((user) => {
        // Verifica si el usuario está logueado
        if (user) {
            console.log('Estado de autenticación: Usuario logueado', user);

            // --- Redirección si ya está logueado y está en la página de login ---
            // Obtenemos el nombre del archivo HTML actual
            const currentPage = window.location.pathname.split('/').pop();
            // Añadimos una comprobación para asegurar que solo redirigimos desde login.html
            if (currentPage === 'login.html' || currentPage === '') { // Considera la raíz si login.html es la página por defecto
                 console.log('Usuario logueado en la página de login, redirigiendo a dashboard...');
                 // Redirige inmediatamente si ya está logueado y visita login.html
                 window.location.href = 'dashboard.html';
            }
            // Si el usuario está logueado pero NO está en login.html, no hacemos nada aquí.
            // --- Fin Redirección automática ---

        } else {
            // No hay usuario logueado
            console.log('Estado de autenticación: No hay usuario logueado.');
            // Si no hay usuario logueado y NO estamos en la página de login, podríamos redirigir a login.html
            // (Esta parte es opcional y depende de tu flujo de aplicación general)
            const currentPage = window.location.pathname.split('/').pop();
             if (currentPage !== 'login.html' && currentPage !== '') {
                 console.log('No hay usuario logueado y no estamos en login, redirigiendo a login...');
                 // window.location.href = 'login.html'; // Descomentar si quieres forzar la redirección a login si no está logueado en otras páginas
             }
            // Si no hay usuario logueado y estamos en login.html, nos quedamos en login.html (esto ya sucede por defecto)
        }
    });
});

// -------- Funcionalidad para el registro de usuario --------
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita el envío normal del formulario

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Las contraseñas no coinciden.';
            registerMessage.className = 'message error';
            return;
        }
    });
});



