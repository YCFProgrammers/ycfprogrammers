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
const firebaseConfig = {
    apiKey: "AIzaSyAPGfI248M3JM12_UC9n8pSc3EQdgnxyp8", // <-- Tus credenciales
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

// Crea instancias de proveedores sociales (ya los tenías)
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();


document.addEventListener('DOMContentLoaded', () => {
    // Asumiendo que tienes estos elementos en tu login.html o register.html original
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    // Si tienes confirmación de password
    const confirmPasswordInput = document.getElementById('confirm-password');
    // Si tienes un campo de nombre para registro por email
     const nameInput = document.getElementById('fullName'); // Ajusta el ID si es diferente
    // Asumiendo que tienes botones específicos para Email/Password
    const emailRegisterBtn = document.getElementById('emailRegisterBtn'); // Botón de Registro por Email/Password
    const emailLoginBtn = document.getElementById('emailLoginBtn');   // Botón de Login por Email/Password


    // Botones de proveedores sociales (ya los tenías)
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const githubSignInBtn = document.getElementById('githubSignInBtn');

    // Divs para mensajes (puedes tener uno solo o varios, ajusta según tu HTML)
    // Usaremos 'authMessageDiv' para mensajes generales de auth (login, register, errores)
    // y 'verificationMessageDiv' específicamente para el mensaje de verificación enviado
    const authMessageDiv = document.getElementById('authMessage') || document.getElementById('loginMessage') || document.getElementById('registerMessage'); // Usa el que tengas
    const verificationMessageDiv = document.getElementById('verificationMessage') || document.createElement('div'); // Crear uno si no existe


     // Asegúrate de que el div de mensajes de verificación exista en algún lugar o se cree dinámicamente
     if(!document.getElementById('verificationMessage')) {
         if(authMessageDiv.parentNode) {
             authMessageDiv.parentNode.insertBefore(verificationMessageDiv, authMessageDiv.nextSibling);
              verificationMessageDiv.id = 'verificationMessage';
              verificationMessageDiv.className = 'message'; // Aplica tus estilos .message
         }
     }


    // -------- ¡NUEVO! Funcionalidad para el botón de Registro por Email/Password --------
    if (emailRegisterBtn) {
        emailRegisterBtn.addEventListener('click', async (event) => {
            event.preventDefault(); // Previene la recarga del formulario

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            // Validar confirmación de password si existe
             const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : password;
             // Obtener nombre si existe
             const fullName = nameInput ? nameInput.value.trim() : '';


            authMessageDiv.textContent = '';
            authMessageDiv.className = 'message';
            verificationMessageDiv.textContent = ''; // Limpiar mensaje de verificación

            if (!email || !password) {
                 authMessageDiv.textContent = 'Por favor, ingresa correo y contraseña.';
                 authMessageDiv.classList.add('error');
                 return;
            }

             if (confirmPasswordInput && password !== confirmPassword) {
                 authMessageDiv.textContent = 'Las contraseñas no coinciden.';
                 authMessageDiv.classList.add('error');
                 return;
             }


            authMessageDiv.textContent = 'Registrando usuario...';
            authMessageDiv.classList.add('info');

            try {
                // Crea el usuario con email y contraseña en Firebase
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                console.log('Usuario registrado por Email/Password:', user);

                // --- ¡NUEVO! Envía el correo de verificación después del registro ---
                await user.sendEmailVerification();
                console.log('Correo de verificación enviado a:', user.email);

                authMessageDiv.textContent = 'Registro exitoso.';
                authMessageDiv.classList.remove('info');
                authMessageDiv.classList.add('success');

                verificationMessageDiv.textContent = `Se ha enviado un correo de verificación a ${user.email}. Por favor, revisa tu bandeja de entrada.`;
                 verificationMessageDiv.className = 'message info'; // Estilo info para el mensaje de verificación


                // Opcional: Actualizar el perfil con el nombre si se proporcionó
                if(fullName && user.displayName !== fullName) {
                     await user.updateProfile({ displayName: fullName });
                     console.log('Nombre de perfil actualizado:', fullName);
                     // Nota: updateProfile no afecta user.emailVerified
                }


                // No redirigimos automáticamente aquí; esperamos a que verifique el email o a un login futuro.
                // La redirección al dashboard debe basarse en user.emailVerified y si el usuario intenta acceder a contenido restringido.


            } catch (error) {
                console.error("Error en el registro por Email/Password:", error);
                 authMessageDiv.textContent = `Error en el registro: ${error.message}`;
                 authMessageDiv.classList.remove('info');
                 authMessageDiv.classList.add('error');

                // Manejar errores específicos de registro
                 if (error.code === 'auth/email-already-in-use') {
                     authMessageDiv.textContent = 'Error: El correo electrónico ya está registrado.';
                 } else if (error.code === 'auth/weak-password') {
                     authMessageDiv.textContent = 'Error: La contraseña es demasiado débil.';
                 } else if (error.code === 'auth/invalid-email') {
                      authMessageDiv.textContent = 'Error: Formato de correo inválido.';
                 }
            }
        });
    }

     // -------- ¡NUEVO! Funcionalidad para el botón de Login por Email/Password --------
     if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', async (event) => {
            event.preventDefault(); // Previene la recarga del formulario

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            authMessageDiv.textContent = '';
            authMessageDiv.className = 'message';
            verificationMessageDiv.textContent = ''; // Limpiar mensaje de verificación


            if (!email || !password) {
                 authMessageDiv.textContent = 'Por favor, ingresa correo y contraseña.';
                 authMessageDiv.classList.add('error');
                 return;
            }

            authMessageDiv.textContent = 'Iniciando sesión...';
            authMessageDiv.classList.add('info');

            try {
                // Intenta iniciar sesión con email y contraseña
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                console.log('Usuario logueado por Email/Password:', user);

                // La redirección al dashboard se maneja en el listener onAuthStateChanged
                 authMessageDiv.textContent = 'Login exitoso.';
                 authMessageDiv.classList.remove('info');
                 authMessageDiv.classList.add('success');

                 // En el dashboard o en otra página, puedes verificar user.emailVerified
                 // para mostrar un mensaje o restringir funciones si el correo no está verificado.
                 if (!user.emailVerified) {
                      verificationMessageDiv.textContent = `Tu correo (${user.email}) no ha sido verificado. Algunas funciones podrían estar limitadas. Revisa tu bandeja de entrada para el enlace de verificación.`;
                      verificationMessageDiv.className = 'message warning'; // Puedes añadir un estilo 'warning'
                 }


            } catch (error) {
                console.error("Error en el login por Email/Password:", error);
                authMessageDiv.textContent = `Error al iniciar sesión: ${error.message}`;
                authMessageDiv.classList.remove('info');
                authMessageDiv.classList.add('error');

                // Manejar errores específicos de login
                 if (error.code === 'auth/user-not-found') {
                      authMessageDiv.textContent = 'Error: Usuario no encontrado.';
                 } else if (error.code === 'auth/wrong-password') {
                      authMessageDiv.textContent = 'Error: Contraseña incorrecta.';
                 } else if (error.code === 'auth/invalid-email') {
                      authMessageDiv.textContent = 'Error: Formato de correo inválido.';
                 } else if (error.code === 'auth/user-disabled') {
                     authMessageDiv.textContent = 'Error: El usuario ha sido deshabilitado.';
                 }
            }
        });
    }


    // -------- Funcionalidad para los botones de proveedores sociales (ya los tenías) --------
    // (El código para googleSignInBtn y githubSignInBtn permanece igual que en tu script anterior)
     if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => { /* ... tu código existing de Google Sign-In ... */ });
     }
      if (githubSignInBtn) {
        githubSignInBtn.addEventListener('click', async () => { /* ... tu código existing de GitHub Sign-In ... */ });
     }
     // Nota: Los logins por proveedores sociales (Google, GitHub) no requieren verificación de correo adicional en Firebase,
     // ya que el proveedor ya verificó la identidad del usuario.


    // -------- Listener para estado de autenticación (Maneja sesiones existentes y redirección automática) --------
    // Este listener se activa para CUALQUIER método de autenticación exitoso.
    auth.onAuthStateChanged((user) => {
        // Limpia mensajes de verificación anteriores al cambiar de estado o cargar
         verificationMessageDiv.textContent = '';
         verificationMessageDiv.className = 'message';


        if (user) {
            // El usuario está logueado (por Email/Password, Google, GitHub, etc.)
            console.log('Estado de autenticación: Usuario logueado', user);

            // Si el usuario está logueado, podemos verificar si su correo está verificado
            // Esto es útil si usas login/registro por Email/Password
             if (user.providerData && user.providerData[0].providerId === 'password' && !user.emailVerified) {
                 console.warn("El correo del usuario logueado con Email/Password no está verificado.");
                 // Puedes mostrar un mensaje persistente en el dashboard o login
                  // verificationMessageDiv.textContent = `Tu correo (${user.email}) no ha sido verificado. Algunas funciones podrían estar limitadas.`;
                  // verificationMessageDiv.className = 'message warning';

                 // Opcional: No redirigir a menos que el correo esté verificado
                 // if (!user.emailVerified) {
                 //     console.log("Correo no verificado, quedándose en login o redirigiendo a una página de 'verifica tu email'");
                 //      // window.location.href = 'verify-email.html'; // Ejemplo
                 //     return; // Detiene la redirección al dashboard
                 // }
             }


            const currentPage = window.location.pathname.split('/').pop();

            // Si el usuario está logueado Y la página actual es login.html, redirigir
            // Nota: Si implementaste la restricción por email verificado arriba,
            // esta redirección solo ocurrirá si el email está verificado (si usas Email/Password)
            if (currentPage === 'login.html' || currentPage === '') {
                 console.log('Usuario logueado en la página de login, redirigiendo a dashboard...');
                 // Redirige
                 window.location.href = 'dashboard.html';
            }
             // Si está logueado y NO está en login.html (es decir, está en dashboard u otra página),
             // aquí puedes asegurarte de que tenga acceso o mostrar contenido
             else if (currentPage === 'dashboard.html') {
                  // Opcional: Asegúrate de que el mensaje de bienvenida y cerrar sesión estén visibles en dashboard
                  // Esto ya lo maneja el script del dashboard si está separado.
                   // Si el script del dashboard es el mismo, asegúrate de que los elementos existen.
             }


        } else {
            // No hay usuario logueado
            console.log('Estado de autenticación: No hay usuario logueado.');

            // Asegúrate de que los botones de login/registro sean visibles si no está logueado
            if(googleSignInBtn) googleSignInBtn.style.display = 'block';
            if(githubSignInBtn) githubSignInBtn.style.display = 'block';
             if(emailRegisterBtn) emailRegisterBtn.style.display = 'block'; // Asegura visible si existe
             if(emailLoginBtn) emailLoginBtn.style.display = 'block';     // Asegura visible si existe
             if(authMessageDiv) authMessageDiv.textContent = ''; // Limpia mensaje de auth
             if(authMessageDiv) authMessageDiv.className = 'message';


             // Si no hay usuario logueado y NO estamos en la página de login, redirigir a login.html
             const currentPage = window.location.pathname.split('/').pop();
              if (currentPage !== 'login.html' && currentPage !== '' && currentPage !== 'register.html') { // También comprueba que no estemos ya en register.html
                  console.log('No hay usuario logueado y no estamos en login/register, redirigiendo a login...');
                  window.location.href = 'login.html'; // Redirigir a login si no está logueado en otras páginas
              }
            // Si no hay usuario logueado y estamos en login.html o register.html, nos quedamos.

        }
    });
});



