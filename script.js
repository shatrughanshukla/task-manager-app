const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const pendingTasksDiv = document.getElementById("pending-tasks");
const completedTasksDiv = document.getElementById("completed-tasks");
const filterPriority = document.getElementById("filter-priority");
const filterStatus = document.getElementById("filter-status");
const filterDueSoon = document.getElementById("filter-due-soon");


let tasks = [];
let editTaskId = null;

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function renderTasks() {
  const priority = filterPriority.value;
  const status = filterStatus.value;
  const dueSoon = filterDueSoon.classList.contains("active");
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 7);

  let filtered = tasks.filter((task) => {
    let match = true;
    if (priority !== "all" && task.priority !== priority) match = false;
    if (status !== "all" && task.status !== status) match = false;
    if (dueSoon) {
      const due = new Date(task.dueDate);
      if (due < now || due > soon) match = false;
    }
    return match;
  });

  const pending = filtered.filter((t) => t.status === "pending");
  const completed = filtered.filter((t) => t.status === "completed");

  pendingTasksDiv.innerHTML = "";
  pending.forEach((task) => {
    pendingTasksDiv.appendChild(createTaskCard(task));
  });

  completedTasksDiv.innerHTML = "";
  completed.forEach((task) => {
    completedTasksDiv.appendChild(createTaskCard(task, true));
  });
}


function createTaskCard(task, isCompleted = false) {
  const card = document.createElement("div");
  card.className = `task-card ${task.priority} ${
    isCompleted ? "completed" : ""
  }`;

  card.innerHTML = `
        <strong>${task.title}</strong>
        <div>${task.description}</div>
        <div>Due: ${task.dueDate}</div>
        <div>Priority: ${
          task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        }</div>
    `;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  if (!isCompleted) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => startEditTask(task.id);
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteTask(task.id);
    actions.appendChild(deleteBtn);

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Mark as Completed";
    completeBtn.className = "complete";
    completeBtn.onclick = () => completeTask(task.id);
    actions.appendChild(completeBtn);
  } else {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteTask(task.id);
    actions.appendChild(deleteBtn);
  }

  card.appendChild(actions);
  return card;
}


function handleFormSubmit(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;
  if (!title || !description || !dueDate || !priority) return;
  if (editTaskId) {
    const idx = tasks.findIndex((t) => t.id === editTaskId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], title, description, dueDate, priority };
    }
    editTaskId = null;
    taskForm.querySelector('button[type="submit"]').textContent = "Add Task";
  } else {
    tasks.push({
      id: generateId(),
      title,
      description,
      dueDate,
      priority,
      status: "pending",
    });
  }
  saveTasks();
  renderTasks();
  taskForm.reset();
}

taskForm.addEventListener("submit", handleFormSubmit);


function startEditTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  titleInput.value = task.title;
  descInput.value = task.description;
  dueDateInput.value = task.dueDate;
  priorityInput.value = task.priority;
  editTaskId = id;
  taskForm.querySelector('button[type="submit"]').textContent = "Update Task";
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function completeTask(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx].status = "completed";
  }
  saveTasks();
  renderTasks();
}

filterPriority.addEventListener("change", renderTasks);
filterStatus.addEventListener("change", renderTasks);
filterDueSoon.addEventListener("click", function () {
  this.classList.toggle("active");
  renderTasks();
});

loadTasks();
renderTasks();
