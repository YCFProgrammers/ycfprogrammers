// TODO: REEMPLAZA ESTE OBJETO con la configuración de tu proyecto Firebase
// Es la misma configuración que usaste en login.html
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
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements - Ajustados para los IDs de tu nuevo HTML
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const signOutBtn = document.getElementById('signOutBtn'); // Botón Cerrar Sesión

// Elementos de estadísticas
const projectsCount = document.getElementById('projectsCount');
const tasksCount = document.getElementById('tasksCount'); // Placeholder, necesita datos reales
const teamsCount = document.getElementById('teamsCount'); // Placeholder, necesita datos reales
const deadlinesCount = document.getElementById('deadlinesCount'); // Placeholder, necesita datos reales

// Elementos de la sección de proyectos
const projectsGrid = document.getElementById('projectsGrid'); // Contenedor de las tarjetas de proyecto
const newProjectBtn = document.getElementById('newProjectBtn'); // Botón para abrir el modal

// Elementos del Modal de Nuevo Proyecto
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');
const projectForm = document.getElementById('projectForm');
// Campos del formulario dentro del modal - Usan IDs locales del modal
const modalProjectNameInput = projectForm.querySelector('#projectName'); // Asegúrate de que los IDs dentro del modal sean únicos o selecciona desde el formulario
const modalProjectDescriptionInput = projectForm.querySelector('#projectDescription');
const modalProjectTeamSelect = projectForm.querySelector('#projectTeam'); // Si usas un select
const modalProjectDeadlineInput = projectForm.querySelector('#projectDeadline'); // Si usas un input de fecha

// --- Variables globales ---
let currentUser = null; // Para almacenar el usuario actual

// --- Manejo del Modal ---
if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
        if (projectModal) {
            projectModal.style.display = 'flex'; // Usa flex para centrar
            projectForm.reset(); // Limpiar formulario al abrir
             // Opcional: Enfocar el primer campo al abrir
            if(modalProjectNameInput) modalProjectNameInput.focus();
        }
    });
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (projectModal) {
            projectModal.style.display = 'none';
        }
    });
}

if (cancelProjectBtn) {
    cancelProjectBtn.addEventListener('click', () => {
         if (projectModal) {
            projectModal.style.display = 'none';
        }
    });
}

// Cerrar modal haciendo clic fuera de él
window.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        projectModal.style.display = 'none';
    }
});


// --- Manejo del Formulario de Creación de Proyecto ---
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir envío tradicional del formulario

        if (!currentUser) {
             console.error('Error: Intentando crear proyecto sin usuario autenticado.');
            // Opcional: Redirigir a login si esto ocurre (aunque onAuthStateChanged ya debería manejarlo)
            // window.location.href = 'login.html';
            alert('Debes iniciar sesión para crear proyectos.'); // Alerta simple
            return;
        }

        // Obtener valores de los campos del modal
        const projectName = modalProjectNameInput.value.trim();
        const projectDescription = modalProjectDescriptionInput.value.trim();
        const projectTeam = modalProjectTeamSelect ? modalProjectTeamSelect.value : ''; // Obtener valor del select si existe
        const projectDeadline = modalProjectDeadlineInput ? modalProjectDeadlineInput.value : ''; // Obtener valor de la fecha si existe

        // Validar campos básicos
        if (!projectName || !projectDescription) {
            alert('Por favor, ingresa el nombre y la descripción del proyecto.');
            return;
        }

        // Puedes añadir validación adicional para fecha, equipo, etc.

        // Deshabilitar botón temporalmente y mostrar estado (opcional)
         const submitButton = projectForm.querySelector('button[type="submit"]');
         submitButton.disabled = true;
         submitButton.textContent = 'Creando...';


        try {
            // Añade un nuevo documento a la colección 'projects' en Firestore
            await db.collection('projects').add({
                name: projectName,
                description: projectDescription,
                team: projectTeam, // Guardar equipo si existe
                deadline: projectDeadline, // Guardar fecha límite si existe
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Marca de tiempo del servidor
                ownerId: currentUser.uid, // Asociar al usuario logueado
                status: 'active' // Estado inicial del proyecto
            });

            console.log("Proyecto creado exitosamente por el usuario:", currentUser.uid);

            // Cerrar el modal y limpiar el formulario
            projectModal.style.display = 'none';
            projectForm.reset();
             alert('Proyecto creado exitosamente!'); // Alerta de éxito

            // La lista de proyectos se actualizará automáticamente gracias al listener onSnapshot


        } catch (error) {
            console.error("Error al crear el proyecto:", error);
            alert('Error al crear el proyecto: ' + error.message);


        } finally {
             // Volver a habilitar el botón
             submitButton.disabled = false;
             submitButton.textContent = 'Crear Proyecto';
        }
    });
}

// --- Cargar y mostrar proyectos del usuario (en tiempo real con onSnapshot) ---
function loadUserProjects(userId) {
    if (!userId) {
        projectsGrid.innerHTML = '<p>Error al cargar proyectos: Usuario no identificado.</p>';
        projectsCount.textContent = '0';
        console.error("loadUserProjects llamado sin userId.");
        return;
    }

    // Limpia el mensaje inicial si existe
    const initialMessage = projectsGrid.querySelector('p');
    if(initialMessage && initialMessage.textContent === 'No tienes proyectos aún. ¡Crea uno para empezar!') {
         projectsGrid.innerHTML = '';
    }


    // Usa onSnapshot para obtener actualizaciones en tiempo real
    db.collection('projects')
      .where('ownerId', '==', userId) // Filtra por el ID del usuario actual
      .orderBy('createdAt', 'desc') // Ordena por fecha de creación (más recientes primero)
      // Removido .limit(4) para cargar todos, puedes añadirlo de nuevo si quieres limitar
      .onSnapshot((querySnapshot) => {
          // Esta función se ejecuta:
          // 1. Cuando te suscribes por primera vez.
          // 2. Cada vez que hay un cambio en los documentos que coinciden con la consulta (añadido, modificado, eliminado).

          projectsGrid.innerHTML = ''; // Limpia la lista actual de proyectos mostrados
          projectsCount.textContent = querySnapshot.size; // Actualiza el conteo de estadísticas

          if (querySnapshot.empty) {
              projectsGrid.innerHTML = '<p>No tienes proyectos aún. ¡Crea uno para empezar!</p>';
               projectsCount.textContent = '0';
              return;
          }

          // Itera sobre los documentos y crea el HTML para cada tarjeta
          querySnapshot.forEach((doc) => {
              const project = doc.data();
               const projectId = doc.id; // El ID del documento en Firestore es útil para futuras acciones (editar, eliminar)

              // Formatear la fecha (Firestore Timestamp a Date)
              const projectDate = project.createdAt ? project.createdAt.toDate().toLocaleDateString() : 'Fecha desconocida';
              // Opcional: Formatear fecha límite si existe
              const projectDeadlineDate = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Sin fecha límite';


              const projectCard = document.createElement('div');
              projectCard.className = 'project-card';
               // Opcional: Añadir borde de color según el estado o el equipo
               // projectCard.style.borderLeftColor = project.team === 'team1' ? 'var(--info-color)' : 'var(--warning-color)';


              projectCard.innerHTML = `
                  <div class="project-header">
                      <h3 class="project-title">${project.name || 'Proyecto sin nombre'}</h3>
                      <div class="project-actions">
                          <button class="project-action-btn edit-btn" data-id="${projectId}"><i class="fas fa-edit"></i></button>
                          <button class="project-action-btn delete-btn" data-id="${projectId}"><i class="fas fa-trash-alt"></i></button>
                      </div>
                  </div>
                  <p class="project-description">${project.description || 'Sin descripción.'}</p>
                  <div class="project-footer">
                       <div class="project-details-extra">
                           ${project.team ? `<i class="fas fa-users"></i> ${project.team}` : ''}
                           ${project.deadline ? `<i class="fas fa-calendar-alt" style="margin-left: 10px;"></i> ${projectDeadlineDate}` : ''}
                       </div>
                      <div class="project-date"><i class="fas fa-clock"></i> ${projectDate}</div>
                  </div>
              `;

              projectsGrid.appendChild(projectCard);
          });

           // Opcional: Añadir listeners a los botones de editar/eliminar después de que se crean las tarjetas
           // projectsGrid.querySelectorAll('.delete-btn').forEach(button => {
           //     button.addEventListener('click', () => {
           //         const projectIdToDelete = button.dataset.id;
           //         deleteProject(projectIdToDelete); // Implementar función deleteProject
           //     });
           // });
            // ... similar para botones de editar
            console.log(`Proyectos cargados/actualizados: ${querySnapshot.size}`);

      }, (error) => {
          // Maneja errores al escuchar los cambios
          console.error("Error al escuchar proyectos:", error);
          projectsGrid.innerHTML = '<p>Error al cargar los proyectos. Intenta nuevamente.</p>';
           projectsCount.textContent = '-'; // Indica error en el conteo
      });
}

// --- Cargar y mostrar tareas del usuario (MOCK - NECESITA DATOS REALES) ---
function loadUserTasks(userId) {
    // TODO: Implementar carga de tareas reales desde Firestore
    // Necesitarías una colección 'tasks' con un campo 'ownerId' y reglas de seguridad.
    console.log("loadUserTasks: Mock data cargada.");
    tasksCount.textContent = 'X'; // Mostrar un placeholder o conteo real
     // Limpiar lista existente si es necesario y añadir tareas reales si las cargas
     // taskList.innerHTML = ''; // Limpiar lista mock


    // Ejemplo de cómo sería una consulta a Firestore (si tuvieras una colección 'tasks'):
    /*
    db.collection('tasks')
      .where('ownerId', '==', userId)
      // .where('status', '==', 'pending') // Si tienes estado de tarea
      .orderBy('dueDate', 'asc') // Si tienes fecha límite para tareas
      .onSnapshot(querySnapshot => {
           tasksCount.textContent = querySnapshot.size; // Actualiza el conteo de tareas
           taskList.innerHTML = ''; // Limpia la lista
           if(querySnapshot.empty) {
               taskList.innerHTML = '<li>No tienes tareas pendientes.</li>';
               return;
           }
           querySnapshot.forEach(doc => {
               const task = doc.data();
               // Crea y añade el HTML para cada tarea similar a como se hace con proyectos
               const taskItem = document.createElement('li');
               taskItem.className = 'task-item';
               // ... construye el innerHTML ...
               taskList.appendChild(taskItem);
           });
      }, error => {
          console.error("Error loading tasks:", error);
           tasksCount.textContent = '-';
            taskList.innerHTML = '<li>Error al cargar tareas.</li>';
      });
     */

    // Por ahora, mantenemos los elementos mock en el HTML o los limpiamos si quieres
}

// --- Cargar y mostrar actividad reciente (MOCK - NECESITA DATOS REALES) ---
function loadRecentActivity(userId) {
     // TODO: Implementar carga de actividad real desde Firestore
     // Esto podría ser más complejo, requiriendo una colección 'activity' o 'notifications'
     // o agregando eventos de actividad cuando se crean/modifican proyectos/tareas.
    console.log("loadRecentActivity: Mock data cargada.");
    // Limpiar lista existente si es necesario y añadir actividad real si la cargas
    // activityList.innerHTML = ''; // Limpiar lista mock

    // Ejemplo: Mantener un elemento mock o añadir más si los defines
     // Si quieres eliminar los mocks y que solo muestre algo si cargas datos reales,
     // elimina los <li> mock del HTML y el código mock de esta función.

}


// --- Cargar otros contadores de estadísticas (MOCK / NECESITA DATOS REALES) ---
// Los contadores de estadísticas (tasksCount, teamsCount, deadlinesCount)
// necesitan cargar datos reales de Firestore o donde sea que los almacenes.
// Por ahora, solo projectsCount se actualiza automáticamente con loadUserProjects.
// Tendrías que hacer consultas similares para contar tareas pendientes, equipos a los que perteneces, etc.
// Esto implica tener esas colecciones y campos definidos en tu base de datos y reglas de seguridad.


// --- Manejo del estado de autenticación al cargar la página ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario está logueado
        console.log('Usuario logueado en Dashboard:', user);

        // Almacena el usuario actual globalmente
        currentUser = user;

        // Obtener información del usuario para el perfil en la sidebar
        const displayName = user.displayName || 'Usuario';
        const email = user.email;
        // Generar iniciales para el avatar
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

        // Actualizar elementos de la interfaz con información del usuario
        if (userAvatar) userAvatar.textContent = initials;
        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = email;

        // --- ¡CRUCIAL! Cargar datos del usuario después de que se autentique ---
        loadUserProjects(user.uid);
        loadUserTasks(user.uid); // Carga tareas (actualmente mock)
        loadRecentActivity(user.uid); // Carga actividad (actualmente mock)

        // Asegurarse de que el botón de cerrar sesión sea visible
        if (signOutBtn) signOutBtn.style.display = 'inline-block';


    } else {
        // No hay usuario logueado
        console.log("No hay usuario logueado en Dashboard. Redirigiendo a login.");
        currentUser = null; // Asegúrate de que currentUser sea null

        // Redirige al usuario de vuelta a la página de login si no está autenticado
        window.location.href = 'login.html';
    }
});

// --- Manejo del botón de Cerrar Sesión ---
if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
        // Opcional: Mostrar un estado de "cerrando sesión" en la interfaz
        // Por ejemplo: welcomeMessageDiv.textContent = 'Cerrando sesión...';

        try {
            // Cierra la sesión del usuario en Firebase Authentication
            await auth.signOut();
            console.log("Sesión cerrada exitosamente.");

            // Redirige al usuario a la página de login después de cerrar sesión
            window.location.href = 'login.html';


        } catch (error) {
            // Si ocurre un error al cerrar sesión
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión: " + error.message);
            // Opcional: Volver a mostrar el botón si falló
            // if (signOutBtn) signOutBtn.style.display = 'inline-block';
        }
    });
}

// --- Funciones para otras acciones (Editar, Eliminar proyecto) ---
// Si añades botones de editar/eliminar en las tarjetas de proyecto,
// necesitarías funciones como esta:

async function deleteProject(projectId) {
    if (!currentUser) {
        alert('Debes iniciar sesión para eliminar proyectos.');
        return;
    }
     if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
         return; // Cancelar si el usuario no confirma
     }
    try {
        // Elimina el documento del proyecto en Firestore
        await db.collection('projects').doc(projectId).delete();
        console.log("Proyecto eliminado con ID:", projectId);
         // La lista se actualizará automáticamente gracias a onSnapshot
         alert('Proyecto eliminado exitosamente.');

    } catch (error) {
        console.error("Error al eliminar el proyecto:", error);
         alert("Error al eliminar el proyecto: " + error.message);
    }
}


// ... implementar funciones similares para editar si es necesario