const API_URL = "/api/tasks/";
const STATUS_CHOICES = ["To Do", "In Progress", "Done"];

let currentEditingTaskId = null;

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function getCSRFToken() {
  return (
    getCookie("csrftoken") ||
    document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
    ""
  );
}

function showMessage(message, type = "error") {
  const messages = document.getElementById("messages");
  messages.innerHTML = `<li class="${type}">${message}</li>`;
  setTimeout(() => {
    messages.innerHTML = "";
  }, 4000);
}

function setStatus(text) {
  document.getElementById("list-status").textContent = text;
}

function clearStatus() {
  document.getElementById("list-status").textContent = "";
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("strong");
  title.textContent = task.title;

  const description = document.createElement("p");
  description.textContent = task.description || "";

  const status = document.createElement("p");
  status.textContent = `Status: ${task.status}`;
  status.className = "task-status-label";

  info.appendChild(title);
  info.appendChild(description);
  info.appendChild(status);

  const controls = document.createElement("div");
  controls.className = "status-form";

  const updateButton = document.createElement("button");
  updateButton.type = "button";
  updateButton.textContent = "Update";
  updateButton.addEventListener("click", () => openEditForm(task));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-btn";
  deleteButton.addEventListener("click", async () => {
    if (!confirm("Delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      });

      if (!response.ok) {
        showMessage("Could not delete task.", "error");
        return;
      }
      showMessage("Task deleted.", "success");
      await loadTasks();
    } catch (error) {
      showMessage("Could not reach backend API.", "error");
    }
  });

  controls.appendChild(updateButton);
  controls.appendChild(deleteButton);

  li.appendChild(info);
  li.appendChild(controls);
  return li;
}

function openEditForm(task) {
  currentEditingTaskId = task.id;
  document.getElementById("form-title").textContent = "Edit Task";
  document.getElementById("task-id").value = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description;
  document.getElementById("task-status").value = task.status;
  document.getElementById("submit-btn").textContent = "Save Changes";
  document.getElementById("cancel-btn").classList.remove("hidden");
  document.querySelector(".task-form-section").scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  currentEditingTaskId = null;
  document.getElementById("form-title").textContent = "New Task";
  document.getElementById("task-id").value = "";
  document.getElementById("task-title").value = "";
  document.getElementById("task-description").value = "";
  document.getElementById("task-status").value = "To Do";
  document.getElementById("submit-btn").textContent = "Add Task";
  document.getElementById("cancel-btn").classList.add("hidden");
  document.getElementById("task-form").reset();
}

async function loadTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  setStatus("Loading tasks...");

  try {
    const response = await fetch(API_URL, {
      credentials: "same-origin",
    });
    if (!response.ok) {
      setStatus("Unable to load tasks.");
      showMessage("Could not fetch tasks.", "error");
      return;
    }

    const tasks = await response.json();
    list.innerHTML = "";
    if (tasks.length === 0) {
      setStatus("No tasks yet, add one above.");
      return;
    }
    clearStatus();
    for (const task of tasks) {
      list.appendChild(renderTask(task));
    }
  } catch (error) {
    setStatus("Could not load tasks.");
    showMessage("Could not reach backend API.", "error");
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const status = document.getElementById("task-status").value;

  if (!title) {
    showMessage("Title is required.", "error");
    return;
  }

  try {
    if (currentEditingTaskId) {
      // Update existing task
      const response = await fetch(`${API_URL}${currentEditingTaskId}/`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ title, description, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        showMessage(data.detail || "Could not update task.", "error");
        return;
      }

      showMessage("Task updated.", "success");
    } else {
      // Create new task
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ title, description, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        showMessage(data.detail || "Could not create task.", "error");
        return;
      }

      showMessage("Task created.", "success");
    }

    resetForm();
    await loadTasks();
  } catch (error) {
    showMessage("Could not reach backend API.", "error");
  }
}

function setupStatusOptions() {
  const statusSelect = document.getElementById("task-status");
  statusSelect.innerHTML = "";
  for (const status of STATUS_CHOICES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  }
}

function setupForm() {
  document.getElementById("task-form").addEventListener("submit", handleTaskSubmit);
  document.getElementById("cancel-btn").addEventListener("click", resetForm);
}

window.addEventListener("DOMContentLoaded", () => {
  setupStatusOptions();
  setupForm();
  loadTasks();
});
