const todos = [];
let nextId = 1;
let mode = 'add';
let editingId = null;

const elements = {
  input: document.getElementById('todoText'),
  list: document.getElementById('list-items'),
  button: document.getElementById('AddUpdateClick'),
  alert: document.getElementById('Alert'),
  count: document.getElementById('count'),
  form: document.getElementById('todoForm')
};

function showAlert(message, type = 'info') {
  elements.alert.textContent = message;
  elements.alert.className = `alert alert-${type}`;
  
  if (message) {
    elements.alert.classList.add('show');
    setTimeout(() => {
      elements.alert.classList.remove('show');
    }, 3000);
  } else {
    elements.alert.classList.remove('show');
  }
}

function setMode(newMode) {
  mode = newMode;
  const isUpdate = mode === 'update';
  elements.button.textContent = isUpdate ? 'Update' : 'Add';
  elements.button.className = isUpdate ? 'btn-update' : 'btn-add';
  elements.form.classList.toggle('is-editing', isUpdate);
}

function render() {
  elements.list.innerHTML = '';

  if (todos.length === 0) {
    elements.count.innerHTML = '';
    elements.list.innerHTML = `
      <li class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">No tasks yet</p>
        <p class="empty-subtext">Start by adding your first task above</p>
      </li>
    `;
  } else {
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.done ? ' is-completed' : ''}${editingId === todo.id ? ' is-editing' : ''}`;
      li.setAttribute('data-id', todo.id);
      li.style.animation = 'slideIn 0.3s ease-out';

      li.innerHTML = `
        <label class="todo-checkbox">
          <input type="checkbox" class="checkbox-input" ${todo.done ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="todo-content">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <span class="todo-meta">Just now</span>
        </div>
        <div class="todo-actions">
          <button class="btn-icon btn-edit" ${todo.done ? 'disabled' : ''} aria-label="Edit task">✏️</button>
          <button class="btn-icon btn-delete" aria-label="Delete task">🗑️</button>
        </div>
      `;

      elements.list.appendChild(li);
    });

    const total = todos.length;
    const completed = todos.filter(t => t.done).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    elements.count.innerHTML = `<strong>${active}</strong> active · <strong>${completed}</strong> completed · <strong>${total}</strong> total${total > 0 ? ` · <span class="completion-rate">${rate}% complete</span>` : ''}`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = elements.input.value.trim();

  if (!text) {
    showAlert('Please enter a task', 'warning');
    return;
  }

  if (mode === 'update') {
    const todo = todos.find(t => t.id === editingId);
    if (todo) {
      todo.text = text;
      showAlert('Task updated!', 'success');
      editingId = null;
      setMode('add');
    }
  } else {
    if (todos.some(t => t.text.toLowerCase() === text.toLowerCase())) {
      showAlert('That task already exists', 'error');
      return;
    }
    todos.push({ id: nextId++, text, done: false });
    showAlert('Task added!', 'success');
  }

  elements.input.value = '';
  render();
});

elements.list.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (!li) return;

  const id = parseInt(li.getAttribute('data-id'));
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  if (e.target.classList.contains('checkbox-input') || e.target.classList.contains('checkmark')) {
    todo.done = !todo.done;
    showAlert(todo.done ? 'Task completed!' : 'Task reopened', 'success');
    if (editingId === id) {
      editingId = null;
      elements.input.value = '';
      setMode('add');
    }
    render();
  } else if (e.target.closest('.btn-edit')) {
    if (!todo.done) {
      editingId = id;
      elements.input.value = todo.text;
      elements.input.focus();
      setMode('update');
      render();
    }
  } else if (e.target.closest('.btn-delete')) {
    const idx = todos.findIndex(t => t.id === id);
    todos.splice(idx, 1);
    showAlert('Task deleted', 'success');
    render();
  }
});

render();