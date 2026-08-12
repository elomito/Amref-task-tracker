# Mini Task Tracker

A lightweight task management application built with Django and vanilla JavaScript.

## Features

- **Create Tasks** - Add new tasks with title and description
- **Edit Tasks** - Update existing tasks with a unified form interface
- **Delete Tasks** - Remove tasks
- **Status Tracking** - Organize tasks with three status levels:
  - To Do
  - In Progress
  - Done
- **Real-time Updates** - Immediate feedback after actions
- **CSRF Protection** - Secure API requests with Django's CSRF tokens

## Tech Stack

### Backend
- **Django 6.1** - Python web framework
- **Django REST Framework** - RESTful API development
- **Django CORS Headers** - Handle cross-origin requests

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JavaScript
- **HTML5** - Semantic markup
- **CSS3** - Modern styling

### Database
- **SQLite** - Default Django database

## Project Structure

```
amrefproject/
├── backend/                    # API endpoints and models
│   ├── models.py              # Task model definition
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API viewsets
│   ├── urls.py                # API routing
│   └── migrations/            # Database migrations
├── frontend/                  # Web interface
│   ├── templates/
│   │   └── frontend/
│   │       └── index.html     # Main application template
│   ├── static/
│   │   └── frontend/
│   │       ├── app.js         # Main JavaScript logic
│   │       └── styles.css     # Styling
│   ├── views.py               # Frontend view (serves index.html)
│   └── urls.py                # Frontend routing
├── settings.py                # Django configuration
├── urls.py                    # Main URL routing
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
└── db.sqlite3                 # SQLite database
```

## Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Amref-task-tracker
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   cd amrefproject
   pip install -r requirements.txt
   ```

4. **Apply database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```
   
   The application will be available at `http://localhost:8000`

## How to Use

### Accessing the Application

Navigate to `http://localhost:8000/` in your browser.

### Creating a Task

1. In the **New Task** section:
   - Enter a task title (required)
   - Optionally add a description
   - Select a status from the dropdown (defaults to "To Do")
2. Click **Add Task**

### Editing a Task

1. In the **Tasks** section, click **Update** on the task
2. The form changes to edit mode
3. Modify the title, description, or status
4. Click **Save Changes** to update or **Cancel** to discard

### Deleting a Task

1. In the **Tasks** section, click **Delete** on the task
2. Confirm the deletion in the popup
3. The task is removed

### Status Management

Tasks have three status levels:
- **To Do** - Not started
- **In Progress** - In progress
- **Done** - Completed

## API Endpoints

The application provides the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/` | List all tasks |
| POST | `/api/tasks/` | Create a new task |
| GET | `/api/tasks/{id}/` | Retrieve a specific task |
| PATCH | `/api/tasks/{id}/` | Update a task (partial) |
| DELETE | `/api/tasks/{id}/` | Delete a task |

### Example API Requests

**Create a task:**
```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{
    "title": "Write Documentation",
    "description": "Complete API documentation",
    "status": "To Do"
  }'
```

**Update a task:**
```bash
curl -X PATCH http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{
    "status": "In Progress"
  }'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:8000/api/tasks/1/ \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN"
```

## Troubleshooting

### "Port 8000 already in use"
If port 8000 is already in use, specify a different port:
```bash
python manage.py runserver 8000
```

### "ModuleNotFoundError: No module named 'django'"
Make sure you've:
1. Activated your virtual environment
2. Installed requirements with `pip install -r requirements.txt`

### "Bad Request (400)" when updating tasks
Ensure you're:
- Including the CSRF token in the request headers
- Sending valid status values (must be "To Do", "In Progress", or "Done")
- Including the `Content-Type: application/json` header

## Development Notes

### Unified Form Interface
The application uses a single form for both creating and editing tasks, which provides a consistent user experience and reduces code duplication.

### CSRF Protection
All API requests require Django's CSRF token for security. The token is automatically extracted from cookies and included in request headers.

### Database
The project uses SQLite by default. To switch to PostgreSQL or MySQL, update the `DATABASES` configuration in `settings.py`.

## Future Enhancements

- Task filtering and search
- Task categories/tags
- Task due dates
- Task priority levels
- User authentication
- Task comments/notes
- Export tasks to CSV/PDF

## License

MIT
