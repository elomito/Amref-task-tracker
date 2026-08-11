import requests
from django.conf import settings
from django.contrib import messages
from django.shortcuts import redirect, render

# The frontend never touches the database directly — it always goes through
# the backend's HTTP API, the same way a JS frontend would with fetch().
# The only difference is these HTTP calls happen in Python on the server
# instead of in the browser.
API_URL = "http://127.0.0.1:8000/api/tasks/"

STATUS_CHOICES = ["To Do", "In Progress", "Done"]


def index(request):
    """List all tasks. Fetches from the backend API over HTTP."""
    try:
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status()
        tasks = response.json()
    except requests.RequestException:
        tasks = []
        messages.error(request, "Could not reach the backend API. Is it running?")

    return render(
        request,
        "frontend/index.html",
        {"tasks": tasks, "status_choices": STATUS_CHOICES},
    )


def create_task(request):
    """Handle the 'new task' form submission via POST to the API."""
    if request.method != "POST":
        return redirect("index")

    title = request.POST.get("title", "").strip()
    description = request.POST.get("description", "").strip()
    status = request.POST.get("status", "To Do")

    if not title:
        messages.error(request, "Title is required.")
        return redirect("index")

    try:
        response = requests.post(
            API_URL,
            json={"title": title, "description": description, "status": status},
            timeout=5,
        )
        if not response.ok:
            errors = response.json()
            messages.error(request, f"Could not create task: {errors}")
    except requests.RequestException:
        messages.error(request, "Could not reach the backend API.")

    return redirect("index")


def update_task_status(request, task_id):
    """Handle a status-change form submission via PATCH to the API."""
    if request.method != "POST":
        return redirect("index")

    status = request.POST.get("status")
    try:
        response = requests.patch(
            f"{API_URL}{task_id}/", json={"status": status}, timeout=5
        )
        if not response.ok:
            messages.error(request, "Could not update task.")
    except requests.RequestException:
        messages.error(request, "Could not reach the backend API.")

    return redirect("index")


def delete_task(request, task_id):
    """Handle a delete form submission via DELETE to the API."""
    if request.method != "POST":
        return redirect("index")

    try:
        response = requests.delete(f"{API_URL}{task_id}/", timeout=5)
        if not response.ok:
            messages.error(request, "Could not delete task.")
    except requests.RequestException:
        messages.error(request, "Could not reach the backend API.")

    return redirect("index")
