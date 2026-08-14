/* ============================================================
   MY TASKS — To-Do List App
   Vanilla JavaScript | localStorage persistence
   ============================================================ */

/* ---------- Global State ---------- */
let tasks = [];                 // Array of task objects (the "database")
let currentFilter = "all";      // "all" | "active" | "completed"
let currentSearch = "";         // current search query
let editingTaskId = null;       // id of the task currently being edited (or null)
let pendingDeleteId = null;     // id of the task awaiting delete confirmation

/* ---------- DOM References ---------- */
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const totalCountEl = document.getElementById("totalCount");
const completedCountEl = document.getElementById("completedCount");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const currentDateEl = document.getElementById("currentDate");
const toastContainer = document.getElementById("toastContainer");
const filterBtns = document.querySelectorAll(".filter-btn");
const confirmModal = document.getElementById("confirmModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

/* ============================================================
   LOCAL STORAGE HELPERS
   ============================================================ */

// Save the current tasks array to localStorage
function saveTasks() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Load tasks from localStorage into the `tasks` array
function loadTasks() {
  const stored = localStorage.getItem("myTasks");
  tasks = stored ? JSON.parse(stored) : [];
}

/* ============================================================
   TASK CRUD OPERATIONS
   ============================================================ */

// Add a new task from the input field
function addTask() {
  const title = taskInput.value.trim();

  // Prevent empty tasks
  if (title === "") {
    showToast("Please enter a task title.", "error");
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),                      // simple unique id
    title: title,
    priority: prioritySelect.value,      // "Low" | "Medium" | "High"
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask); // add newest task to the top
  saveTasks();
  renderTasks();
  updateProgress();

  taskInput.value = "";
  taskInput.focus();
  showToast("Task added successfully!", "success");
}

// Toggle a task's completed status
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
  updateProgress();

  showToast(
    task.completed ? "Task marked as completed!" : "Task restored to active.",
    "success"
  );
}

// Enter edit mode for a task (re-renders that task as an editable form)
function editTask(id) {
  editingTaskId = id;
  renderTasks();

  // Focus the edit input once it's rendered
  const editInput = document.querySelector(`[data-edit-input="${id}"]`);
  if (editInput) {
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  }
}

// Save changes made while editing a task
function saveEditedTask(id) {
  const editInput = document.querySelector(`[data-edit-input="${id}"]`);
  const editPriority = document.querySelector(`[data-edit-priority="${id}"]`);
  if (!editInput) return;

  const newTitle = editInput.value.trim();
  if (newTitle === "") {
    showToast("Task title cannot be empty.", "error");
    return;
  }

  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.title = newTitle;
  if (editPriority) task.priority = editPriority.value;

  editingTaskId = null;
  saveTasks();
  renderTasks();
  updateProgress();
  showToast("Task updated successfully!", "success");
}

// Cancel editing without saving changes
function cancelEdit() {
  editingTaskId = null;
  renderTasks();
}

// Show the confirmation modal before deleting
function requestDeleteTask(id) {
  pendingDeleteId = id;
  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
}

// Actually delete the task (called after confirmation)
function deleteTask(id) {
  const taskEl = document.querySelector(`[data-task-id="${id}"]`);

  const finishDelete = () => {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
    updateProgress();
    showToast("Task deleted.", "success");
  };

  // Animate removal before actually removing from the array.
  // A fallback timeout guarantees the task is still removed even if the
  // animationend event doesn't fire (e.g. reduced-motion settings).
  if (taskEl) {
    let done = false;
    const runOnce = () => {
      if (done) return;
      done = true;
      finishDelete();
    };
    taskEl.classList.add("task-removing");
    taskEl.addEventListener("animationend", runOnce, { once: true });
    setTimeout(runOnce, 350);
  } else {
    finishDelete();
  }
}

// Remove all completed tasks
function clearCompleted() {
  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) {
    showToast("No completed tasks to clear.", "error");
    return;
  }
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
  updateProgress();
  showToast("Completed tasks cleared!", "success");
}

/* ============================================================
   FILTERING & SEARCHING
   ============================================================ */

// Return tasks filtered by the current status filter (all/active/completed)
function filterTasks(taskArray) {
  if (currentFilter === "active") return taskArray.filter((t) => !t.completed);
  if (currentFilter === "completed") return taskArray.filter((t) => t.completed);
  return taskArray;
}

// Return tasks matching the current search query (by title)
function searchTasks(taskArray) {
  if (currentSearch.trim() === "") return taskArray;
  const query = currentSearch.toLowerCase();
  return taskArray.filter((t) => t.title.toLowerCase().includes(query));
}

/* ============================================================
   RENDERING
   ============================================================ */

// Priority badge styling helper
function getPriorityStyles(priority) {
  switch (priority) {
    case "High":
      return {
        badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
        dot: "bg-red-500",
      };
    case "Medium":
      return {
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    default: // Low
      return {
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
        dot: "bg-emerald-500",
      };
  }
}

// Format an ISO date string into a friendly "created at" label
function formatCreatedAt(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Build the HTML for a single task card (view mode or edit mode)
function buildTaskCard(task) {
  const { badge, dot } = getPriorityStyles(task.priority);

  // ---- EDIT MODE ----
  if (editingTaskId === task.id) {
    return `
      <li data-task-id="${task.id}" class="task-entering glass rounded-2xl p-4 shadow-md">
        <div class="flex flex-col gap-3">
          <input
            type="text"
            data-edit-input="${task.id}"
            value="${escapeHtml(task.title)}"
            maxlength="120"
            class="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div class="flex flex-wrap items-center gap-2">
            <select data-edit-priority="${task.id}" class="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
              <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
              <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
              <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
            </select>
            <button data-action="save-edit" data-id="${task.id}" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all duration-200">
              <i class="fa-solid fa-check mr-1"></i>Save
            </button>
            <button data-action="cancel-edit" class="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white font-semibold text-sm hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-200">
              Cancel
            </button>
          </div>
        </div>
      </li>
    `;
  }

  // ---- VIEW MODE ----
  return `
    <li data-task-id="${task.id}" class="task-entering group bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200">
      <div class="flex items-start gap-3">
        <button
          data-action="toggle"
          data-id="${task.id}"
          aria-label="${task.completed ? "Mark task as active" : "Mark task as completed"}"
          class="mt-0.5 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? "bg-emerald-500 border-emerald-500"
              : "border-slate-400 dark:border-white/40 hover:border-indigo-500"
          }"
        >
          ${task.completed ? '<i class="fa-solid fa-check text-white text-xs"></i>' : ""}
        </button>

        <div class="flex-1 min-w-0">
          <p class="font-medium text-slate-800 dark:text-white break-words ${
            task.completed ? "line-through text-slate-400 dark:text-white/40" : ""
          }">${escapeHtml(task.title)}</p>
          <div class="flex flex-wrap items-center gap-2 mt-1.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge}">
              <span class="w-1.5 h-1.5 rounded-full ${dot}"></span>${task.priority}
            </span>
            <span class="text-xs text-slate-500 dark:text-white/50">
              <i class="fa-regular fa-clock mr-1"></i>${formatCreatedAt(task.createdAt)}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button data-action="edit" data-id="${task.id}" aria-label="Edit task" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-200">
            <i class="fa-solid fa-pen text-sm"></i>
          </button>
          <button data-action="delete" data-id="${task.id}" aria-label="Delete task" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200">
            <i class="fa-solid fa-trash text-sm"></i>
          </button>
        </div>
      </div>
    </li>
  `;
}

// Escape HTML to avoid injection issues when rendering task titles
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Main render function: applies filter + search, then draws the task list
function renderTasks() {
  let visibleTasks = filterTasks(tasks);
  visibleTasks = searchTasks(visibleTasks);

  if (visibleTasks.length === 0) {
    taskList.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.classList.add("flex");
  } else {
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");
    taskList.innerHTML = visibleTasks.map(buildTaskCard).join("");
  }

  updateCounts();
}

/* ============================================================
   COUNTS & PROGRESS
   ============================================================ */

function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  updateCounts();
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const isSuccess = type === "success";

  toast.className = `animate-fade-in flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
    isSuccess ? "bg-emerald-500" : "bg-red-500"
  }`;
  toast.innerHTML = `
    <i class="fa-solid ${isSuccess ? "fa-circle-check" : "fa-circle-exclamation"}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    let removed = false;
    const removeOnce = () => {
      if (removed) return;
      removed = true;
      toast.remove();
    };
    toast.classList.add("task-removing");
    toast.addEventListener("animationend", removeOnce, { once: true });
    setTimeout(removeOnce, 350);
  }, 2500);
}

/* ============================================================
   THEME (DARK / LIGHT MODE)
   ============================================================ */

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    document.documentElement.classList.remove("dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("themePreference", newTheme);
}

function loadTheme() {
  const saved = localStorage.getItem("themePreference");
  if (saved) {
    applyTheme(saved);
  } else {
    // Respect system preference on first visit
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
}

/* ============================================================
   FILTER BUTTON STYLING
   ============================================================ */

function updateFilterButtonStyles() {
  filterBtns.forEach((btn) => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    btn.className = `filter-btn flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-white text-indigo-600 shadow-md"
        : "bg-white/20 dark:bg-white/5 text-white dark:text-white/80 hover:bg-white/30 dark:hover:bg-white/10"
    }`;
  });
}

/* ============================================================
   CURRENT DATE DISPLAY
   ============================================================ */

function displayCurrentDate() {
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

// Add task via button click
addTaskBtn.addEventListener("click", addTask);

// Add task via Enter key
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Search box
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  renderTasks();
});

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    updateFilterButtonStyles();
    renderTasks();
  });
});

// Clear completed
clearCompletedBtn.addEventListener("click", clearCompleted);

// Theme toggle
themeToggle.addEventListener("click", toggleTheme);

// Event delegation for task list actions (toggle, edit, delete, save, cancel)
taskList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);

  if (action === "toggle") toggleTask(id);
  else if (action === "edit") editTask(id);
  else if (action === "delete") requestDeleteTask(id);
  else if (action === "save-edit") saveEditedTask(id);
  else if (action === "cancel-edit") cancelEdit();
});

// Allow pressing Enter to save an edit, Escape to cancel
taskList.addEventListener("keydown", (e) => {
  if (e.target.matches("[data-edit-input]")) {
    const id = Number(e.target.dataset.editInput);
    if (e.key === "Enter") saveEditedTask(id);
    if (e.key === "Escape") cancelEdit();
  }
});

// Delete confirmation modal buttons
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteId !== null) {
    deleteTask(pendingDeleteId);
    pendingDeleteId = null;
  }
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
});

cancelDeleteBtn.addEventListener("click", () => {
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
});

// Close modal when clicking the backdrop
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    pendingDeleteId = null;
    confirmModal.classList.add("hidden");
    confirmModal.classList.remove("flex");
  }
});

/* ============================================================
   INITIALIZATION
   ============================================================ */

function init() {
  loadTheme();
  displayCurrentDate();
  loadTasks();
  renderTasks();
  updateProgress();
  updateFilterButtonStyles();
}

document.addEventListener("DOMContentLoaded", init);