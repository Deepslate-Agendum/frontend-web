/*
 * This file defines the main App component for the frontend application.
 * - Handles user authentication (login, logout, and signup).
 * - Manages state for tasks, workspaces, and user session.
 * - Fetches tasks and workspaces from the backend API.
 * - Provides functionality to create, update, and delete tasks and workspaces.
 * - Renders the UI for login, task management, and workspace management.
* - Supports multiple views: list view, map view, and calendar view.
 * - Displays a highlighted task that is always visible.
 * - Uses utility functions from the `api` module for backend communication.
* - Includes a dropdown for workspace selection and management.
 */

import '../css/App.css';
import { useEffect, useState, useCallback} from "react";
import TaskModal from "./components/TaskModal";
import SubtaskModal from "./components/SubtaskModal";
import TaskList from './components/TaskList';
import MapView from './components/MapView';
import CalendarView from "./components/CalendarView"; // Ensure CalendarView is imported
import { loginUser, createUser, getTasks, createTask, updateTask, getWorkspaces, createWorkspace, deleteWorkspace, deleteTask, getAllDependencies, createDependency, deleteDependency } from "./utils/api";
import { getId, getTaskDependencies } from "./utils/wrapper.js";

//const API_BASE = "http://127.0.0.1:5000"; // Backend URL

const App = () => {
  // State variables for managing tasks, workspaces, and user session
  const [mapClickPosition, setMapClickPosition] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isMemberOfWorkspace, setIsMemberOfWorkspace] = useState(true);
  const [highlightedTask, setHighlightedTask] = useState(null); // State for the highlighted task
  const [viewMode, setViewMode] = useState("list"); // State to track the current view mode
  const [preFilledTask, setPreFilledTask] = useState(null); // State for pre-filled task
  const [dependencies, setDependencies] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Fetch workspaces on initial render
  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  // Fetch tasks whenever the current workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchTasks(getId(currentWorkspace));
      fetchDependencies(getId(currentWorkspace));
    } else {
      setTasks([]);
      setDependencies([]);
    }
  }, [currentWorkspace]);

  // Update `isMemberOfWorkspace` based on fetched workspaces
  useEffect(() => {
    if (workspaces.length === 0) {
      setIsMemberOfWorkspace(false);
    } else {
      setIsMemberOfWorkspace(true);
    }
  }, [workspaces]);
  

  //Authentication Endpoints

  //Login

  // Official login
  const handleLogin = async () => {
    setLoginError(""); // Reset error
    try {
      const data = await loginUser(usernameInput, password); //api call from utils
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", usernameInput);
      localStorage.setItem("userId", getId(data.user));
      setToken(data.token);
      setUsername(usernameInput);
      setUserId(getId(data.user));
      setUsernameInput("");
      setPassword("");
      console.log("Login successful!");
    } catch (err) {
      setLoginError("Invalid credentials");
      console.error("Login failed:", err);
    }
  };


  //Logout

  const handleLogout = () => { //take away the login token
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setToken("");
    setUsername("");
    setUserId("");
    console.log("Logged out");
  };

  //SignUp (createUser)
  const createUserHandler = async () => {
    try {
      await createUser(usernameInput, password); //api call to utils
      console.log("User created successfully");
      setUsernameInput("");
      setPassword("");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  

  //Task Endpoints
  

  //Fetches tasks for the current workspace
  const fetchTasks = async () => {
    try {
      if (getId(currentWorkspace)) {
        const allTasks = await getTasks(getId(currentWorkspace)); //api call to utils
        console.log("Fetched tasks:", allTasks);
        const filteredTasks = allTasks
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };
  
  
  
  //Create Task
  const createTaskHandler = async (title, description, tags, due_date, workspace_id, dependencies = [], position = null) => {
    if (!currentWorkspace) {
      alert("Error: No workspace selected.");
      return null;
    }
  
    const x = String(position?.x ?? 0);
    const y = String(position?.y ?? 0);
    const safeDueDate = due_date ? new Date(due_date).toISOString().split("T")[0] : "";
  
    const payload = {
      name: title,
      description,
      tags,
      due_date: safeDueDate,
      workspace_id: getId(currentWorkspace),
      dependencies,
      x_location: x,
      y_location: y,
    };
  
    console.log("Creating task at:", payload);
  
    try {
      const newTask = await createTask(payload);
      setShowTaskModal(false);
      await fetchTasks(); // backend refresh
      setMapClickPosition(null); // clear for next task
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  

  // Function to handle task creation from CalendarView
  const handleCreateTaskFromCalendar = (selectedDate) => {
    const formattedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]; // Normalize to local timezone and format as YYYY-MM-DD
    setHighlightedTask(null); // Ensure no task is highlighted
    setShowTaskModal(true); // Open the TaskModal
    setPreFilledTask({
      title: "", // Ensure the title is empty for a new task
      description: "", // Ensure the description is empty for a new task
      tags: [], // Ensure no tags are pre-filled
      due_date: formattedDate, // Use the correctly normalized date
    });
  };
  
  
  
  // Update Task
  const updateTaskHandler = async (updatedData) => {
    try {
      const response = await updateTask(updatedData); //api call to utils
      fetchTasks();
      return response
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  

  
  // Delete Task
  const deleteTaskHandler = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);  //api call from utils
      fetchTasks(); //refresh task list after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getDependentTasksHandler = async (parentTaskId) => {
    try {
      return await getDependentTasks(parentTaskId);
    } catch (error) {
      return [];
    }
  };
  
  const getSubtasksHandler = async (parentTaskId) => {
    try {
      return await getSubtasks(parentTaskId);
    } catch (error) {
      return [];
    }
  };
  
  const getParentTaskHandler = async (subtaskId) => {
    try {
      return await getParentTask(subtaskId);
    } catch (error) {
      return null;
    }
  };


  //Workspace endpoints

  // Fetch Workspaces
  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces(); //api call for utils
      setWorkspaces(data.workspaces);
      if (data.workspaces.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    }
  };


  // Create Workspace
  const createWorkspaceHandler = async (name) => {
    if (!userId) {
      alert("You must be logged in to create a workspace.");
      return;
    }
    const trimmedName = name?.trim();
    if (!trimmedName) {
      alert("Workspace name required!");
      return;
    }
  
    try {
      const newWorkspace = await createWorkspace(trimmedName, userId); // use trimmedName here
      setWorkspaceName(""); // Clear the input field only after the API call
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      
      let attempts = 0;
      while (attempts < 3) {
        try {
          await fetchTasks(getId(newWorkspace)); // this requires newWorkspace to be valid
          return;
        } catch (err) {
          attempts++;
          console.error(`Attempt ${attempts} to fetch tasks failed`, err);
          if (attempts === 3) window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    }
  };
  
  

  // Delete Workspace
  const deleteWorkspaceHandler = async (workspaceId) => {
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
    try {
      await deleteWorkspace(workspaceId);
      setCurrentWorkspace(null); // Reset selected workspace
      setTasks([]);
      fetchWorkspaces();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Try again.");
    }
  };
  
  

  const handleSelectWorkspace = (ws) => {
    setCurrentWorkspace(ws);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(); // Trigger login when Enter is pressed
    }
  };

  // dependencies 
  const fetchDependencies = async (workspaceId) => {
    try {
      console.log("Fetching dependencies for workspaceId:", workspaceId);
      const data = await getAllDependencies(workspaceId); // from api.js
      setDependencies(data);
    } catch (err) {
      console.error("Error fetching dependencies:", err);
      setDependencies([]);
    }
  };

  const createDependencyHandler = async ({ dependeeId, dependentId, workspace_id, manner = "Blocking" }) => {
    try {
      await createDependency(workspace_id, dependeeId, dependentId, manner);
      await fetchDependencies(workspace_id); // refresh edges
    } catch (err) {
      console.error("createDependencyHandler failed:", err);
    }
  };

const deleteDependencyHandler = async ({ workspace_id, dependeeId, dependentId }) => {
  try {
    const all = await getAllDependencies(workspace_id);

    const match = all.find(d =>
      d.dependee === dependeeId &&
      d.dependent === dependentId
    );

    if (!match) {
      console.warn("No matching dependency found to delete.");
      return;
    }

    await deleteDependency(workspace_id, match.id);
    await fetchDependencies(workspace_id);
  } catch (err) {
    console.error("deleteDependencyHandler failed:", err);
  }
};

  
  
  const handleEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      if (window.confirm("Delete this dependency?")) {
        const [, dependeeId, dependentId] = edge.id.split("-");
        deleteDependencyHandler({
          workspace_id: getId(currentWorkspace),
          dependeeId,
          dependentId,
        });
      }
    },
    [currentWorkspace]
  );

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => (t.id || t._id?.$oid) === taskId);
    if (!task) return;
  
    // Dependencies that this task relies on (dependees)
    const blockingDependencies = dependencies.filter(d =>
      (d.dependent?.id || d.dependent?._id?.$oid || d.dependent) === taskId
    );
  
    const allDepsComplete = blockingDependencies.every(d =>
      completedTasks.has(d.dependee?.id || d.dependee?._id?.$oid || d.dependee)
    );
  
    if (!allDepsComplete) {
      alert("You cannot complete this task until all its dependencies are complete.");
      return;
    }
  
    setCompletedTasks(prev => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      return updated;
    });
  };
  
  
  


//-----------------------------------------------------------------------------------------


  // Renders the main UI for the application
  return (
    <div className={token ? "app-container" : "login-screen"}>
      {!token && (
        <div className="login-image-container">
          <h1 className="agendum-title">Agendum</h1>
          <p className="agendum-subtitle">The better productivity app</p>
          <img src="media/agendum.png" alt="Agendum Logo" className="login-image" />
          
        </div>
      )}
      {/* <h1>Deepslate Agendum</h1> */}
  
{/* Main application */}
      {token ? (
        isMemberOfWorkspace ? (
          <>
            <div className="top-right-container">
              <div className="view-buttons">
                <button onClick={() => setViewMode("list")}>List View</button>
                <button onClick={() => setViewMode("map")}>Map View</button>
                <button onClick={() => setViewMode("calendar")}>Calendar View</button>
              </div>
              <p>Welcome, <strong>{username}</strong>!</p>
              <button onClick={handleLogout}>Log Out</button>
            </div>

            {/* Custom dropdown menu */}
            <div className="custom-dropdown">
              <button className="dropdown-button">
                {currentWorkspace ? `Current Workspace: ${currentWorkspace.name}` : "Select Workspace"}
                <span className="caret">▼</span> {/* Add caret to indicate dropdown */}
              </button>
              <div className="dropdown-content">
                {workspaces.map((ws) => (
                  <div
                    key={getId(ws)}
                    className="dropdown-item"
                    onClick={() => handleSelectWorkspace(ws)} // Allow clicking anywhere on the option to switch workspaces
                  >
                    <span>{ws.name}</span>
                    <button
                      className="delete-workspace-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the workspace selection
                        if (window.confirm(`Are you sure you want to delete the workspace "${ws.name}"?`)) {
                          deleteWorkspaceHandler(getId(ws));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div
                  className="dropdown-item"
                  onClick={() => {
                    const name = prompt("Enter the name of the new workspace:");
                    if (name) {
                      setWorkspaceName(name);
                      createWorkspaceHandler(name.trim());
                    }
                  }}
                  
                >
                  <span>Create a New Workspace</span>
                </div>
              </div>
            </div>

            {/* Conditional rendering based on viewMode */}
            {viewMode === "list" && (
              <div className="task-list-container">
                <h2 className="task-list-header">Task List</h2>
                <button onClick={() => setShowTaskModal(true)} className="task-button edit">Create Task</button>
                <TaskList 
                  tasks={tasks} 
                  updateTask={updateTaskHandler} 
                  deleteTask={deleteTaskHandler}
                  workspace={currentWorkspace}
                  highlightedTask={highlightedTask} // Pass the highlighted task to TaskList
                  onTaskClick={(task) => {
                    if (window.innerWidth > 768) {
                      setHighlightedTask(task); // Update the highlighted task for desktop mode
                    } else {
                      console.log("Mobile mode: Task clicked", task); // Handle mobile-specific behavior
                    }
                  }}
                  completedTasks={completedTasks}
                  toggleTaskCompletion={toggleTaskCompletion}
                />
              </div>
            )}

            {viewMode === "map" && (
              <div className="map-view-container">
                <MapView 
                  tasks={tasks}
                  dependencies={dependencies}
                  onCreateDependency={createDependencyHandler}
                  fetchDependencies={fetchDependencies}
                  onCreateTask={createTaskHandler}
                  onUpdateTask={updateTaskHandler}
                  onTaskClick={(task) => setHighlightedTask(task)}
                  setShowTaskModal={setShowTaskModal}
                  setMapClickPosition={setMapClickPosition}
                  deleteTask={deleteTaskHandler}
                  workspace={currentWorkspace}
                  prefillPosition={mapClickPosition}
                  onDeleteDependency={deleteDependencyHandler}
                  completedTasks={completedTasks}
                  toggleTaskCompletion={toggleTaskCompletion}
                />
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="calendar-view-container">
                                <CalendarView
                tasks={tasks}
                onTaskClick={(task) => {
                  if (window.innerWidth > 768) {
                    setHighlightedTask(task);
                  } else {
                    console.log("Mobile mode: Task clicked", task);
                  }
                }}
                onCreateTask={handleCreateTaskFromCalendar} // Pass the handler for creating tasks from CalendarView
                completedTasks={completedTasks}
                toggleTaskCompletion={toggleTaskCompletion}
              />
              </div>
            )}

            {/* Render the TaskModal for creating a task */}
            {showTaskModal && (
              <TaskModal 
                onClose={() => {
                  setShowTaskModal(false);
                  setMapClickPosition(null);
                  setHighlightedTask(null); // Clear if we were editing
                  setPreFilledTask (null);
                }} 
                onCreate={createTaskHandler}
                onUpdate={updateTaskHandler}
                task={highlightedTask} // <-- this is the key fix
                prefillPosition={mapClickPosition}
                workspace={currentWorkspace}
                preFilledTask={preFilledTask}
              />
            )}


            {/* Bottom App Bar for mobile view */}
            {window.innerWidth <= 768 && (
              <div className="bottom-app-bar">
                <button onClick={() => setViewMode("list")}>List</button>
                <button onClick={() => setViewMode("map")}>Map</button>
                <button onClick={() => setShowTaskModal(true)}>Add Task</button>
                <button onClick={() => setViewMode("calendar")}>Calendar</button>
                <button onClick={() => alert("Profile clicked!")}>Profile</button>
              </div>
            )}
          </>
        ) : (
// No workspace available page
          <div className="no-workspace-page">
            <h1>No Workspaces Found</h1>
            <p>Let's create a workspace!</p>
            <div className="create-workspace-form">
              <input 
                type="text" 
                placeholder="Workspace name" 
                value={workspaceName} 
                onChange={(e) => setWorkspaceName(e.target.value)} 
                className="workspace-input"
              />
              <button 
                onClick={() => createWorkspaceHandler(workspaceName)} 
                className="workspace-button"
              >
                Create Workspace
              </button>
            </div>
          </div>
        )
      ) : (

// =============LOGIN PAGE=======================================================================

        // TODO: Add logic to handle if login and/or password is empty
        <div className="login-container">
          <div className="login-card">
            <h1 className="welcome-text">Welcome</h1>
            <p className="login-subtitle">Log into your account to continue</p>
            {loginError && <p className="error-message">{loginError}</p>}
            <input 
              className="login-input" 
              placeholder="Enter username" 
              value={usernameInput} 
              onChange={(e) => setUsernameInput(e.target.value)} 
            />
            <input 
              className="login-input" 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyPress={handleKeyPress} // Listen for Enter key press
            />
            <div className="login-buttons">
              <button className="login-button" onClick={handleLogin}>Log In</button>
              <button className="signup-button" onClick={createUserHandler}>Create User</button>
            </div>
          </div>
        </div>
      )}
{/* =============END OF LOGIN PAGE======================================================================= */}

      {/* Always render the highlighted task container, but only when the user is logged in, there are workspaces, and not in mobile mode */}
      {token && isMemberOfWorkspace && window.innerWidth > 768 && (
        <div className="highlighted-task-container">
          {highlightedTask ? (
            <>
              <h2 className="highlighted-task-header">Highlighted Task</h2>
              <div className="highlighted-task-content">
                <h3>{highlightedTask.title || "No Title"}</h3>
                <p><strong>Description:</strong> {highlightedTask.description || "No Description"}</p>
                <p><strong>Tags:</strong> {Array.isArray(highlightedTask.tags) ? highlightedTask.tags.join(", ") : highlightedTask.tags || "No Tags"}</p>
                <p><strong>Due Date:</strong> {highlightedTask.due_date || "No Due Date"}</p>
                <p><strong>Owner:</strong> {highlightedTask.ownerUsername || "Unknown"}</p>
                <p><strong>Workspace:</strong> {highlightedTask.workspaceName || "Unknown"}</p>
                <p><strong>Parent Task:</strong> {highlightedTask.parentTaskId || "None"}</p>
                <p><strong>Dependent:</strong> {highlightedTask.dependent ? "Yes" : "No"}</p>
                <p><strong>Completed:</strong> {highlightedTask.completed ? "Yes" : "No"}</p>
              </div>
              {/* Buttons for task actions */}
              <div className="highlighted-task-actions">
                <button onClick={() => setShowTaskModal(true)}>Edit Task</button>
                <button onClick={() => {
                  deleteTaskHandler(highlightedTask.id);
                  setHighlightedTask(null); // Clear the highlighted task after deletion
                }}>Delete Task</button>
                <button onClick={() => setShowSubtaskModal(true)}>Add Subtask</button>
              </div>
            </>
          ) : (
            <p className="no-task-selected">No task selected</p>
          )}
        </div>
      )}
    </div>
  );

};


export default App;
