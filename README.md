# Deepslate Agendum - Frontend Web Application

Deepslate Agendum is a task and workspace management application designed to help users organize their tasks, subtasks, and workspaces efficiently. This repository contains the frontend code for the application, built using React.

## Features

- **User Authentication**: Login, logout, and signup functionality.
- **Task Management**: Create, update, delete, and view tasks.
- **Subtask Management**: Add subtasks to tasks with dependency tracking.
- **Workspace Management**: Create, delete, and switch between workspaces.
- **Responsive Design**: Optimized for both light and dark themes.
- **API Integration**: Communicates with a backend API for data persistence.

## Tech Stack

- **Frontend**: React, CSS
- **Backend API**: Axios for HTTP requests
- **Styling**: Custom CSS with support for light and dark themes

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Deepslate-Agendum/frontend-web
   cd frontend-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at the displayed URL

### Environment Variables

Ensure the backend API is running and accessible. Update the `API_BASE` variable in `src\App.jsx` and `src\utils\api.js` if the backend URL differs.

## Project Structure

```
frontend-web/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   ├── css/                # Stylesheets
│   ├── utils/              # Utility functions (e.g., API calls)
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   └── index.js            # Entry point
├── README.md               # Project documentation
└── package.json            # Project dependencies and scripts
```

## Key Components

- **TaskModal**: Modal for creating or editing tasks.
- **TaskList**: Displays a list of tasks.
- **TaskDetails**: Shows detailed information about a task.
- **SubtaskModal**: Modal for creating subtasks.
- **TaskItem**: Represents a single task in the list.

## API Endpoints

The application communicates with the backend API for user authentication, task, and workspace management. Below are the key endpoints:

- **User Authentication**:
  - `POST /user/login`: Login
  - `POST /user/create`: Signup
- **Task Management**:
  - `GET /task/`: Fetch tasks
  - `POST /task/create`: Create a task
  - `PUT /task/update`: Update a task
  - `DELETE /task/delete`: Delete a task
- **Workspace Management**:
  - `GET /workspace/`: Fetch workspaces
  - `POST /workspace/create`: Create a workspace
  - `DELETE /workspace/delete`: Delete a workspace

