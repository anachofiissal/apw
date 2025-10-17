// ===========================
// VARIABLES GLOBALES
// ===========================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const statusDiv = document.getElementById('status');

let db;

// ===========================
// INICIALIZAR INDEXEDDB
// ===========================
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasks-db', 1);

    request.onerror = () => reject('No se pudo abrir la base de datos');
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// ===========================
// GUARDAR O ACTUALIZAR TAREA
// ===========================
function saveTask(task) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const request = store.put(task); // put guarda o actualiza
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error guardando la tarea');
  });
}

// ===========================
// ELIMINAR TAREA
// ===========================
function deleteTask(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error eliminando la tarea');
  });
}

// ===========================
// OBTENER TODAS LAS TAREAS
// ===========================
function getTasks() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error leyendo tareas');
  });
}

// ===========================
// MOSTRAR TAREAS EN EL DOM
// ===========================
async function displayTasks() {
  const tasks = await getTasks();
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');

    // Texto de la tarea
    const span = document.createElement('span');
    span.textContent = task.title;
    if (task.completed) span.classList.add('completed');
    li.appendChild(span);

    // Contenedor de botones
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '5px';

    // Completar
    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✔';
    completeBtn.title = 'Completar';
    completeBtn.addEventListener('click', async () => {
      task.completed = !task.completed;
      await saveTask(task);
      displayTasks();
    });
    btnContainer.appendChild(completeBtn);

    // Editar
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Editar';
    editBtn.addEventListener('click', async () => {
      const newText = prompt('Edita la tarea:', task.title);
      if (newText && newText.trim() !== '') {
        task.title = newText.trim();
        await saveTask(task);
        displayTasks();
      }
    });
    btnContainer.appendChild(editBtn);

    // Eliminar
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', async () => {
      await deleteTask(task.id);
      displayTasks();
    });
    btnContainer.appendChild(deleteBtn);

    li.appendChild(btnContainer);
    taskList.appendChild(li);
  });
}

// ===========================
// AGREGAR NUEVA TAREA
// ===========================
addTaskBtn.addEventListener('click', async () => {
  const title = taskInput.value.trim();
  if (!title) return;

  const task = {
    title,
    completed: false,
    created: new Date().toISOString()
  };

  await saveTask(task);
  taskInput.value = '';
  displayTasks();
});

// ===========================
// ONLINE / OFFLINE
// ===========================
function updateOnlineStatus() {
  if (navigator.onLine) {
    statusDiv.textContent = '🟢 Online';
    statusDiv.style.color = 'green';
  } else {
    statusDiv.textContent = '🔴 Offline';
    statusDiv.style.color = 'red';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// ===========================
// INICIALIZAR APP
// ===========================
window.addEventListener('load', async () => {
  await initDB();
  displayTasks();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('✅ Service Worker registrado', reg))
      .catch(err => console.error('❌ Error registrando Service Worker', err));
  });
}

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Permiso de notificaciones otorgado ✅');
  } else {
    console.log('Permiso de notificaciones denegado ❌');
  }
}

// Llamar la función al cargar la app o con un botón
requestNotificationPermission();
async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) return;

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BPZf7O-25BUFwch65YM45zLHZr-u6I8xOLeR0PFIOZVKbfGR1w_t29vG3UQdcnolp_LXDMry54aoACDOMpV_Jzw ')
  });

  console.log('Suscripción Push:', subscription);
  // En una app real, aquí enviarías esta suscripción a tu backend
}

// Convertir la clave VAPID de base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Llamar al suscriptor
subscribeUserToPush();
