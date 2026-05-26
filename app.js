// ── State ───────────────────────────────────────────────────────
let tasks = [];
let currentFilter = 'all';

const STORAGE_KEY = 'zaio_todo_tasks';

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── Task operations ─────────────────────────────────────────────
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({ id: Date.now(), text: trimmed, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// ── Filter ──────────────────────────────────────────────────────
function getFiltered() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

// ── Render ──────────────────────────────────────────────────────
function render() {
  const list     = document.querySelector('#task-list');
  const empty    = document.querySelector('#empty-state');
  const filtered = getFiltered();

  // Stats
  const doneCount   = tasks.filter(t => t.completed).length;
  const activeCount = tasks.length - doneCount;
  document.querySelector('#stat-active').textContent = activeCount;
  document.querySelector('#stat-done').textContent   = doneCount;
  document.querySelector('#stat-total').textContent  = tasks.length;

  // Empty state
  if (filtered.length === 0) {
    list.style.display  = 'none';
    empty.style.display = 'block';
  } else {
    list.style.display  = 'flex';
    empty.style.display = 'none';
  }

  // Build list items
  list.innerHTML = '';
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="check-btn" aria-label="mark complete">
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="1.5,6 4.5,9.5 10.5,2.5" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <button class="delete-btn" aria-label="delete task">✕</button>
    `;

    li.querySelector('.check-btn').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    list.appendChild(li);
  });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event listeners ─────────────────────────────────────────────
document.querySelector('#add-btn').addEventListener('click', () => {
  const input = document.querySelector('#task-input');
  addTask(input.value);
  input.value = '';
  input.focus();
});

document.querySelector('#task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTask(e.target.value);
    e.target.value = '';
  }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

document.querySelector('#clear-completed').addEventListener('click', clearCompleted);

// ── Init ────────────────────────────────────────────────────────
loadTasks();
render();
