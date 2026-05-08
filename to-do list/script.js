// DOM element references
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("add-button");
const ul = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

// Current active filter – persisted in localStorage to survive page reloads
let currentFilter = loadFilter() || "active";
let tasks = [];

/**
 * Loads tasks from localStorage.
 * @returns {Array} Array of task objects
 */
function loadTasks() {
  const stored = localStorage.getItem("tasks");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Persists tasks array to localStorage.
 */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Loads saved filter from localStorage.
 * @returns {string|null} The saved filter value or null
 */
function loadFilter() {
  return localStorage.getItem("currentFilter");
}

/**
 * Saves current filter to localStorage.
 * @param {string} filter - "all", "active", or "completed"
 */
function saveFilter(filter) {
  localStorage.setItem("currentFilter", filter);
}

/**
 * Creates a unique ID for a new task.
 * Uses timestamp + random suffix to avoid collisions during rapid additions.
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

/**
 * Creates a DOM list item for a given task.
 * Does NOT append it to the document.
 * @param {Object} task - Task object with id, text, completed
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("done-checkbox");
  checkbox.checked = task.completed;

  const span = document.createElement("span");
  span.textContent = task.text;

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Редактировать";
  btnEdit.classList.add("edit-btn");

  const btnDelete = document.createElement("button");
  btnDelete.textContent = "Удалить";
  btnDelete.classList.add("delete-btn");

  li.append(checkbox, span, btnEdit, btnDelete);
  return li;
}

/**
 * Completely rebuilds the task-list DOM for the given filter.
 * For "all" filter, tasks are sorted so incomplete ones appear first.
 * @param {string} filter - "all", "active", or "completed"
 */
function renderTasks(filter) {
  ul.innerHTML = "";

  let tasksToRender = tasks;

  // Filter tasks based on current filter type
  if (filter === "active") {
    tasksToRender = tasks.filter((task) => !task.completed);
  } else if (filter === "completed") {
    tasksToRender = tasks.filter((task) => task.completed);
  }

  // For "all" filter, sort to show active tasks on top
  if (filter === "all") {
    tasksToRender = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }

  tasksToRender.forEach((task) => {
    const li = createTaskElement(task);
    ul.appendChild(li);
  });
}

/**
 * Adds a new task based on the input field value.
 * Prevents multiple rapid submissions and switches filter away from "completed".
 */
function addTask() {
  // Guard against empty or whitespace-only input
  const text = taskInput.value.trim();
  if (text === "") return;

  // Prevent double submission by temporarily disabling the button
  if (addButton.disabled) return;
  addButton.disabled = true;

  const newTask = {
    id: generateId(),
    text: text,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  taskInput.value = "";

  // If we are viewing completed tasks, switch to "active" so the new task is visible
  if (currentFilter === "completed") {
    currentFilter = "active";
    saveFilter(currentFilter);
    setActiveFilterButton(currentFilter);
    renderTasks(currentFilter);
  } else {
    // For "all" and "active" filters, insert the new task into the DOM directly
    const li = createTaskElement(newTask);
    if (currentFilter === "all") {
      // For "all", maintain sort order: incomplete first
      const firstCompleted = ul.querySelector("li .done-checkbox:checked");
      if (firstCompleted) {
        ul.insertBefore(li, firstCompleted.parentNode);
      } else {
        ul.appendChild(li);
      }
    } else {
      // "active" filter: just append to the end
      ul.appendChild(li);
    }
  }

  addButton.disabled = false;
}

// Event listeners
addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

/**
 * Delegated event handler for task list interactions:
 * - Delete a task
 * - Toggle completion
 * - Inline editing
 */
ul.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const taskId = li.dataset.id;
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return;

  // --- Delete task ---
  if (e.target.classList.contains("delete-btn")) {
    tasks.splice(taskIndex, 1);
    saveTasks();
    li.remove();
    return;
  }

  // --- Toggle completion ---
  if (e.target.classList.contains("done-checkbox")) {
    tasks[taskIndex].completed = e.target.checked;
    saveTasks();

    // If filtering by active/completed, re-render the whole list
    // because the task's visibility may change.
    if (currentFilter === "active" || currentFilter === "completed") {
      renderTasks(currentFilter);
    }
    // For "all" filter, no re-render needed; sorting handled by existing order
    return;
  }

  // --- Inline editing ---
  if (e.target.classList.contains("edit-btn")) {
    const btnEdit = e.target;

    if (btnEdit.textContent === "Редактировать") {
      // Switch to edit mode: replace span with input
      const span = li.querySelector("span");
      const input = document.createElement("input");
      input.type = "text";
      input.value = span.textContent;
      input.classList.add("edit-input");

      li.replaceChild(input, span);
      btnEdit.textContent = "Сохранить";

      // Focus the input and place cursor at the end
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);

      // Allow saving by pressing Enter
      const enterHandler = (ev) => {
        if (ev.key === "Enter") {
          btnEdit.click();
        }
      };
      input.addEventListener("keydown", enterHandler);

      // Save reference to the handler to remove it later if needed (optional)
      input._enterHandler = enterHandler;
    } else {
      // Save mode: update task text and switch back to view
      const input = li.querySelector("input.edit-input");
      if (!input) return;

      const newText = input.value.trim() || "Пусто";
      tasks[taskIndex].text = newText;
      saveTasks();

      const span = document.createElement("span");
      span.textContent = newText;
      li.replaceChild(span, input);
      btnEdit.textContent = "Редактировать";
    }
    return;
  }
});

/**
 * Updates the visual state of filter buttons and their aria attributes.
 * @param {string} filterType - "all", "active", or "completed"
 */
function setActiveFilterButton(filterType) {
  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.type === filterType;
    btn.classList.toggle("active-filter", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });
}

// Filter button listeners
filterButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const newFilter = e.target.dataset.type;
    if (newFilter === currentFilter) return;

    currentFilter = newFilter;
    saveFilter(currentFilter);
    setActiveFilterButton(currentFilter);
    renderTasks(currentFilter);
  });
});

/**
 * Initialization: load data, set UI state, render tasks for the saved filter.
 */
function init() {
  tasks = loadTasks();
  setActiveFilterButton(currentFilter);
  renderTasks(currentFilter);
}

init();
