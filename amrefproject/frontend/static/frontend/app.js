const API_URL = "/api/tasks/";
const STATUS_CHOICES = ["To Do", "In Progress", "Done"];

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

function createSelect(value) {
  const select = document.createElement("select");
  for (const choice of STATUS_CHOICES) {
    const option = document.createElement("option");
    option.value = choice;
    option.textContent = choice;
    if (choice === value) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  return select;
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const info = document.createElement("div");
  info.className = "task-info";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = task.title;
  titleInput.className = "task-title";

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "Description";
  const descriptionInput = document.createElement("textarea");
  descriptionInput.value = task.description;
  descriptionInput.className = "task-description";

  info.appendChild(titleLabel);
  info.appendChild(titleInput);
  info.appendChild(descriptionLabel);
  info.appendChild(descriptionInput);

  const controls = document.createElement("div");
  controls.className = "status-form";

  const select = createSelect(task.status);
  select.className = "task-status";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Save";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-btn";

  saveButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    if (!title) {
      showMessage("Title is required.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          title,
          description: descriptionInput.value.trim(),
          status: select.value,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        showMessage(data.detail || "Could not update task.", "error");
        return;
      }
      showMessage("Task updated.", "success");
      await loadTasks();
    } catch (error) {
      showMessage("Could not reach backend API.", "error");
    }
  });

  deleteButton.addEventListener("click", async () => {
    if (!confirm("Delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
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

  controls.appendChild(select);
  controls.appendChild(saveButton);
  controls.appendChild(deleteButton);

  li.appendChild(info);
  li.appendChild(controls);
  return li;
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
      setStatus("No tasks yet — add one above.");
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

async function createTask(event) {
  event.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const status = document.getElementById("status").value;

  if (!title) {
    showMessage("Title is required.", "error");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ title, description, status }),
    });

    if (!response.ok) {
      const data = await response.json();
      showMessage(data.detail || "Could not create task.", "error");
      return;
    }

    showMessage("Task created.", "success");
    document.getElementById("new-task-form").reset();
    await loadTasks();
  } catch (error) {
    showMessage("Could not reach backend API.", "error");
  }
}

function setupForm() {
  document.getElementById("new-task-form").addEventListener("submit", createTask);
}

function setupStatusOptions() {
  const statusSelect = document.getElementById("status");
  statusSelect.innerHTML = "";
  for (const status of STATUS_CHOICES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setupStatusOptions();
  setupForm();
  loadTasks();
});
