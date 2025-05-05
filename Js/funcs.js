// ==============================================
// Configuración Inicial de Firebase
// ==============================================
const firebaseConfig = {
    apiKey: "AIzaSyAPGfI248M3JM12_UC9n8pSc3EQdgnxyp8",
    authDomain: "coding-study-group.firebaseapp.com",
    projectId: "coding-study-group",
    storageBucket: "coding-study-group.firebasestorage.app",
    messagingSenderId: "758696967653",
    appId: "1:758696967653:web:14a25dec60cf2cf05e830c",
    measurementId: "G-M39CBKCHXX"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ==============================================
// Módulo de Notificaciones
// ==============================================
const Notifications = {
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ==============================================
// Módulo de Loaders
// ==============================================
const Loaders = {
    show(container) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Cargando...</p>
        `;
        container.appendChild(loader);
        return loader;
    },
    
    hide(loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 300);
    }
};

// ==============================================
// Módulo de Validación
// ==============================================
const Validators = {
    form(formElement) {
        let isValid = true;
        const inputs = formElement.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                isValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });
        
        return isValid;
    },
    
    setupCharacterCounter(textarea, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        
        textarea.addEventListener('input', () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} caracteres restantes`;
            counter.style.color = remaining < 20 ? 'var(--danger-color)' : 'var(--text-muted)';
        });
    }
};

// ==============================================
// Módulo de Filtrado y Búsqueda
// ==============================================
const Search = {
    liveFilter(inputId, containerId, itemSelector) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        
        input.addEventListener('input', () => {
            const searchTerm = input.value.toLowerCase();
            const items = container.querySelectorAll(itemSelector);
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
};

// ==============================================
// Módulo de Drag and Drop
// ==============================================
const FileUpload = {
    setupDropzone(dropzoneId, callback) {
        const dropzone = document.getElementById(dropzoneId);
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.unhighlight, false);
        });
        
        dropzone.addEventListener('drop', this.handleDrop(callback), false);
    },
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    highlight(e) {
        e.currentTarget.classList.add('highlight');
    },
    
    unhighlight(e) {
        e.currentTarget.classList.remove('highlight');
    },
    
    handleDrop(callback) {
        return function(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            callback(files);
        }
    },
    
    async uploadFile(file, path) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
        
        try {
            const snapshot = await fileRef.put(file);
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("Error al subir archivo:", error);
            Notifications.showToast('Error al subir archivo', 'error');
            return null;
        }
    }
};

// ==============================================
// Módulo de Interfaz de Usuario
// ==============================================
const UI = {
    copyToClipboard(text, successMessage = 'Copiado!') {
        navigator.clipboard.writeText(text).then(() => {
            Notifications.showToast(successMessage, 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            Notifications.showToast('Error al copiar', 'error');
        });
    },
    
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        const footer = modal.querySelector('.modal-footer');
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = btn.class || 'btn';
            button.addEventListener('click', () => {
                btn.action();
                if (btn.close !== false) modal.remove();
            });
            footer.appendChild(button);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        
        document.body.appendChild(modal);
        return modal;
    },
    
    setupInactivityTimer(timeoutMinutes, callback) {
        let timeout;
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        function resetTimer() {
            clearTimeout(timeout);
            timeout = setTimeout(callback, timeoutMs);
        }
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetTimer);
        });
        
        resetTimer();
    }
};

// ==============================================
// Módulo de Gráficos
// ==============================================
const Charts = {
    renderProjectChart(canvasId, projectData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completados', 'En progreso', 'Pendientes'],
                datasets: [{
                    data: [
                        projectData.completed,
                        projectData.inProgress,
                        projectData.pending
                    ],
                    backgroundColor: [
                        'var(--success-color)',
                        'var(--warning-color)',
                        'var(--danger-color)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
};

// ==============================================
// Módulo de Proyectos
// ==============================================
const Projects = {
    async create(projectData) {
        try {
            const docRef = await db.collection('projects').add({
                ...projectData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                members: [auth.currentUser.uid]
            });
            return docRef.id;
        } catch (error) {
            console.error("Error al crear proyecto:", error);
            throw error;
        }
    },
    
    async getAll(userId) {
        try {
            const snapshot = await db.collection('projects')
                .where('members', 'array-contains', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error al obtener proyectos:", error);
            throw error;
        }
    },
    
    async update(projectId, updates) {
        try {
            await db.collection('projects').doc(projectId).update(updates);
        } catch (error) {
            console.error("Error al actualizar proyecto:", error);
            throw error;
        }
    },
    
    async delete(projectId) {
        try {
            await db.collection('projects').doc(projectId).delete();
        } catch (error) {
            console.error("Error al eliminar proyecto:", error);
            throw error;
        }
    }
};

// ==============================================
// Módulo de Tareas
// ==============================================
const Tasks = {
    async create(taskData) {
        try {
            const docRef = await db.collection('tasks').add({
                ...taskData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                createdBy: auth.currentUser.uid
            });
            return docRef.id;
        } catch (error) {
            console.error("Error al crear tarea:", error);
            throw error;
        }
    },
    
    async getByProject(projectId) {
        try {
            const snapshot = await db.collection('tasks')
                .where('projectId', '==', projectId)
                .orderBy('dueDate')
                .get();
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error al obtener tareas:", error);
            throw error;
        }
    },
    
    async update(taskId, updates) {
        try {
            await db.collection('tasks').doc(taskId).update(updates);
        } catch (error) {
            console.error("Error al actualizar tarea:", error);
            throw error;
        }
    }
};

// ==============================================
// Inicialización de la Aplicación
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    auth.onAuthStateChanged(user => {
        if (!user) window.location.href = 'login.html';
        
        // Cargar datos del dashboard
        loadDashboard(user.uid);
    });
    
    // Configurar temporizador de inactividad (15 minutos)
    UI.setupInactivityTimer(15, () => {
        auth.signOut();
        window.location.href = 'login.html?timeout=true';
    });
});

async function loadDashboard(userId) {
    const loader = Loaders.show(document.getElementById('dashboardContainer'));
    
    try {
        // Cargar proyectos
        const projects = await Projects.getAll(userId);
        renderProjects(projects);
        
        // Configurar búsqueda
        Search.liveFilter('searchInput', 'projectsGrid', '.project-card');
        
        // Configurar eventos
        setupEventListeners();
        
    } catch (error) {
        Notifications.showToast('Error al cargar el dashboard', 'error');
    } finally {
        Loaders.hide(loader);
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projectsGrid');
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No tienes proyectos aún</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <h3>${project.name}</h3>
                <div class="project-actions">
                    <button class="project-action-btn edit-btn" data-id="${project.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="project-action-btn delete-btn" data-id="${project.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-footer">
                <div class="project-members">
                    <div class="member-avatar">${project.members.length}</div>
                </div>
                <div class="project-date">
                    ${project.createdAt?.toDate().toLocaleDateString()}
                </div>
            </div>
        `;
        container.appendChild(projectCard);
    });
}

function setupEventListeners() {
    // Crear nuevo proyecto
    document.getElementById('newProjectBtn').addEventListener('click', () => {
        UI.createModal('Nuevo Proyecto', `
            <form id="createProjectForm">
                <div class="form-group">
                    <label>Nombre del Proyecto</label>
                    <input type="text" id="projectName" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="projectDescription" required></textarea>
                </div>
            </form>
        `, [
            {
                text: 'Cancelar',
                action: () => console.log('Cancelado')
            },
            {
                text: 'Crear',
                class: 'btn-primary',
                action: async () => {
                    const form = document.getElementById('createProjectForm');
                    if (Validators.form(form)) {
                        try {
                            await Projects.create({
                                name: document.getElementById('projectName').value,
                                description: document.getElementById('projectDescription').value
                            });
                            Notifications.showToast('Proyecto creado con éxito', 'success');
                            loadDashboard(auth.currentUser.uid);
                        } catch (error) {
                            Notifications.showToast('Error al crear proyecto', 'error');
                        }
                    }
                }
            }
        ]);
    });
    
    // Delegación de eventos para botones de proyectos
    document.getElementById('projectsGrid').addEventListener('click', (e) => {
        const projectId = e.target.closest('button')?.dataset.id;
        if (!projectId) return;
        
        if (e.target.closest('.edit-btn')) {
            editProject(projectId);
        } else if (e.target.closest('.delete-btn')) {
            deleteProject(projectId);
        }
    });
}

async function editProject(projectId) {
    try {
        const projectDoc = await db.collection('projects').doc(projectId).get();
        const project = projectDoc.data();
        
        UI.createModal('Editar Proyecto', `
            <form id="editProjectForm">
                <div class="form-group">
                    <label>Nombre del Proyecto</label>
                    <input type="text" id="editProjectName" value="${project.name}" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="editProjectDescription" required>${project.description}</textarea>
                </div>
            </form>
        `, [
            {
                text: 'Cancelar',
                action: () => console.log('Cancelado')
            },
            {
                text: 'Guardar',
                class: 'btn-primary',
                action: async () => {
                    const form = document.getElementById('editProjectForm');
                    if (Validators.form(form)) {
                        try {
                            await Projects.update(projectId, {
                                name: document.getElementById('editProjectName').value,
                                description: document.getElementById('editProjectDescription').value
                            });
                            Notifications.showToast('Proyecto actualizado', 'success');
                            loadDashboard(auth.currentUser.uid);
                        } catch (error) {
                            Notifications.showToast('Error al actualizar proyecto', 'error');
                        }
                    }
                }
            }
        ]);
    } catch (error) {
        Notifications.showToast('Error al cargar proyecto', 'error');
    }
}

async function deleteProject(projectId) {
    UI.createModal('Confirmar Eliminación', `
        <p>¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.</p>
    `, [
        {
            text: 'Cancelar',
            action: () => console.log('Cancelado')
        },
        {
            text: 'Eliminar',
            class: 'btn-danger',
            action: async () => {
                try {
                    await Projects.delete(projectId);
                    Notifications.showToast('Proyecto eliminado', 'success');
                    loadDashboard(auth.currentUser.uid);
                } catch (error) {
                    Notifications.showToast('Error al eliminar proyecto', 'error');
                }
            }
        }
    ]);
}

// ==============================================
// Exportar módulos para uso global (si es necesario)
// ==============================================
window.App = {
    Notifications,
    Loaders,
    Validators,
    Search,
    FileUpload,
    UI,
    Charts,
    Projects,
    Tasks,
    auth,
    db
};