# Living Things

A full-stack web application built with Django and React.

## Project Structure

```
living-things/
├── backend/         # Django backend
│   ├── living_things/  # Django project settings
│   ├── tasks/      # Django apps
│   └── requirements.txt
└── frontend/       # React frontend
    ├── src/        # React source code
    └── public/     # Static files
```

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- MySQL

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend server will run on http://localhost:8000

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The frontend development server will run on http://localhost:3000

## Development

- Frontend development server includes hot-reloading
- Backend development server includes auto-reloading