let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let editIndex = -1;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (btn) {
      btn.textContent = document.body.classList.contains('dark') ? "🌞" : "🌙";
  }
}

function loadTheme() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  const savedTheme = localStorage.getItem('colorTheme') || 'default';
  document.body.setAttribute('data-theme', savedTheme);
  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.value = savedTheme;
  }
  updateThemeIcon();
}

function formatDateDMY(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return '-';
  return `${String(d.getDate()).padStart(2, '0')}:${String(d.getMonth() + 1).padStart(2, '0')}:${d.getFullYear()}`;
}

function addOrUpdateTask() {
  const name = document.getElementById('taskName').value.trim();
  const start = document.getElementById('startDate').value;
  const due = document.getElementById('dueDate').value;
  const priority = document.getElementById('priority').value;

  if (!name) {
    alert("Please enter a task name.");
    return;
  }
  
  const now = new Date();
  const lastEditedTimestamp = now.toISOString();

  if (editIndex > -1) {
    tasks[editIndex].name = name;
    tasks[editIndex].startDate = start;
    tasks[editIndex].dueDate = due;
    tasks[editIndex].priority = priority;
    tasks[editIndex].lastEdited = `Just now`;
    tasks[editIndex].lastEditedTimestamp = lastEditedTimestamp;
    editIndex = -1;
    document.getElementById('addBtn').textContent = 'Add Task';
  } else {
    const task = {
      name,
      startDate: start,
      dueDate: due,
      priority,
      status: "Pending",
      completed: false,
      lastEdited: `Just now`,
      lastEditedTimestamp: lastEditedTimestamp,
    };
    tasks.push(task);
  }

  saveTasks();
  clearForm();
  renderTasks();
}

function clearForm() {
  document.getElementById('taskName').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('priority').value = 'Medium';
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById('taskName').value = task.name;
  document.getElementById('startDate').value = task.startDate;
  document.getElementById('dueDate').value = task.dueDate;
  document.getElementById('priority').value = task.priority;
  document.getElementById('addBtn').textContent = 'Update Task';
  editIndex = index;
}

function daysLeft(dueDate) {
  if (!dueDate) return "";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} days` : "Overdue";
}

function setTaskStatus(idx, status) {
  tasks[idx].status = status;
  tasks[idx].completed = (status === "Completed");
  const now = new Date();
  tasks[idx].lastEdited = `Just now`;
  tasks[idx].lastEditedTimestamp = now.toISOString();
  saveTasks();
  renderTasks();
}

function toggleComplete(idx) {
  tasks[idx].completed = !tasks[idx].completed;
  tasks[idx].status = tasks[idx].completed ? "Completed" : "Pending";
  const now = new Date();
  tasks[idx].lastEdited = `Just now`;
  tasks[idx].lastEditedTimestamp = now.toISOString();
  saveTasks();
  renderTasks();
}

function removeTask(idx) {
  if (confirm("Delete this task?")) {
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
  }
}

function updateCounter() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const ongoing = tasks.filter(t => t.status === "Ongoing").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  document.getElementById('taskCounter').innerHTML =
    `Total: ${total} | <span class="status-completed">Completed: ${completed}</span> | <span class="status-ongoing">Ongoing: ${ongoing}</span> | <span class="status-pending">Pending: ${pending}</span>`;
}

function displayTodayDate() {
  const todayElement = document.getElementById('todayDate');
  const now = new Date();
  todayElement.textContent = `Today: ${formatDateDMY(now.toISOString())}`;
}

function timeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) {
    return 'Just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day(s) ago`;
}

function setupEvents() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.onclick = toggleDarkMode;
  }
  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.onchange = function () {
      const theme = this.value;
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('colorTheme', theme);
    };
  }
}

function renderTasks() {
  const tableBody = document.getElementById('taskTableBody');
  const filter = document.getElementById('filterStatus').value;
  const search = document.getElementById('searchInput').value.toLowerCase();
  tableBody.innerHTML = '';

  tasks.forEach((task, index) => {
    if ((filter !== 'All' && task.status !== filter) || (search && !task.name.toLowerCase().includes(search))) {
      return;
    }

    const priorityClass = task.priority.toLowerCase() + '-priority';
    const row = document.createElement('tr');
    row.classList.add('status-' + task.status.toLowerCase());

    row.innerHTML = `
      <td class="${task.completed ? 'completed' : ''}">${task.name}</td>
      <td>${formatDateDMY(task.startDate)}</td>
      <td>${formatDateDMY(task.dueDate)}</td>
      <td class="${priorityClass}">${task.priority}</td>
      <td>
        <div class="status-toggle">
          <button class="status-btn" onclick="setTaskStatus(${index}, 'Pending')" ${task.status === 'Pending' ? 'disabled' : ''}>Pending</button>
          <button class="status-btn" onclick="setTaskStatus(${index}, 'Ongoing')" ${task.status === 'Ongoing' ? 'disabled' : ''}>Ongoing</button>
          <button class="status-btn" onclick="setTaskStatus(${index}, 'Completed')" ${task.status === 'Completed' ? 'disabled' : ''}>Completed</button>
        </div>
      </td>
      <td>${daysLeft(task.dueDate)}</td>
      <td class="last-edited">${timeAgo(task.lastEditedTimestamp)}</td>
      <td class="actions">
        <button class="edit" onclick="editTask(${index})">✏️ Edit</button>
        <button class="${task.completed ? 'mark-incomplete' : 'mark-complete'}" onclick="toggleComplete(${index})">
          ${task.completed ? "Mark Incomplete" : "Mark Complete"}
        </button>
        <button onclick="removeTask(${index})">🗑</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateCounter();
}

window.onload = function () {
  loadTheme();
  renderTasks();
  setupEvents();
  displayTodayDate();
};