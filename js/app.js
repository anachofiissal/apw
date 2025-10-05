const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Cargar tareas desde localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks.forEach(task => addTaskToDOM(task.text, task.completed));

// Agregar nueva tarea
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTaskToDOM(taskText, false);
        tasks.push({text: taskText, completed: false});
        saveTasks();
        taskInput.value = '';
    }
});

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Agregar tarea al DOM con CRUD completo
function addTaskToDOM(taskText, completed) {
    const li = document.createElement('li');

    // Contenedor para texto
    const span = document.createElement('span');
    span.textContent = taskText;
    if (completed) span.classList.add('completed'); // ✅ Clase correcta
    li.appendChild(span);

    // Contenedor de botones
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '5px';

    // Botón completar
    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✔';
    completeBtn.title = 'Completar';
    completeBtn.addEventListener('click', () => {
        span.classList.toggle('completed'); // ✅ Aplica al <span>
        const index = tasks.findIndex(t => t.text === taskText);
        tasks[index].completed = span.classList.contains('completed');
        saveTasks();
    });
    btnContainer.appendChild(completeBtn);

    // Botón editar
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Editar';
    editBtn.addEventListener('click', () => {
        const newText = prompt('Edita la tarea:', taskText);
        if (newText && newText.trim() !== '') {
            span.textContent = newText.trim();
            const index = tasks.findIndex(t => t.text === taskText);
            tasks[index].text = newText.trim();
            saveTasks();
            taskText = newText.trim(); // actualizar referencia
        }
    });
    btnContainer.appendChild(editBtn);

    // Botón eliminar
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
        li.remove();
        tasks = tasks.filter(t => t.text !== taskText);
        saveTasks();
    });
    btnContainer.appendChild(deleteBtn);

    li.appendChild(btnContainer);
    taskList.appendChild(li);
}
