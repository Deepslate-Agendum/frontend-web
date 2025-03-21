import '../css/App.css';
import { useEffect, useState } from "react";
import TaskModal from "./components/TaskModal";
import TaskList from './components/TaskList';
import { loginUser, createUser, getTasks, createTask, updateTask, getWorkspaces, createWorkspace, deleteWorkspace, getParentTask, getSubtasks, getDependentTasks, deleteTask } from "./utils/api";

const API_BASE = "http://127.0.0.1:5000"; // Backend URL

// HACK: until back end serialization is working
const getId = (document) => document._id["$oid"];

const App = () => {
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
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  useEffect(() => {
    if (currentWorkspace) {
      fetchTasks(getId(currentWorkspace));
    } else {
      setTasks([]);
    }
  }, [currentWorkspace]);
  

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
  

  //Fetch Tasks 
  const fetchTasks = async () => {
    try {
      const allTasks = await getTasks(); //api call to utils
      const filteredTasks = allTasks
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };
  
  
  
  //Create Task
  const createTaskHandler = async (title, description, tags, due_date, workspace_id, parentTaskId = null, dependent = false) => {
    if (!currentWorkspace) {
      alert("Error: No workspace selected.");
      return;
    }
  
    try {
      const newTask = await createTask({
        name: title,
        title,
        description,
        tags,
        due_date,
        workspace_id: getId(currentWorkspace),
        parentTaskId, //optional for subtasks creation
        dependent, //optional for subtasks creation
      });
  
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  
  
  // Update Task
  const updateTaskHandler = async (updatedData) => {
    try {
      await updateTask(updatedData); //api call to utils
      fetchTasks();
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
  const createWorkspaceHandler = async () => {
    if (!workspaceName) return alert("Workspace name required!");
  
    try {
      await createWorkspace(workspaceName, userId); //api call to utils
      setWorkspaceName("");
      fetchWorkspaces();
    } catch (error) {
      console.error("Error creating workspace:", error);
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

  return (
    <div>
      <h1>Deepslate Agendum</h1>
  
      {token ? (
        <>
          <p>Welcome, <strong>{username}</strong>!</p>
          <button onClick={handleLogout}>Logout</button>
  
          <h2>Task List</h2>
          <button onClick={() => setShowTaskModal(true)}>Create Task</button>
          {showTaskModal && <TaskModal 
                              onClose={() => setShowTaskModal(false)} 
                              onCreate={createTaskHandler}
                              workspaceId={currentWorkspace?.id}
                            />}
  
          <TaskList 
            tasks={tasks} 
            updateTask={updateTaskHandler} 
            deleteTask={deleteTaskHandler}
            workspace = {currentWorkspace}
          />
  
          <h2>Workspaces</h2>
          <input type="text" placeholder="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
          <button onClick={createWorkspaceHandler}>Create Workspace</button>
  
          {workspaces.map((ws) => (
            <div key={getId(ws)}>
              <div onClick={() => handleSelectWorkspace(ws)}>
                <p style={{ color: (getId(ws) == (currentWorkspace && getId(currentWorkspace)))? "white" : "gray" }}>{ws.name}</p>
              </div>
              <button onClick={() => deleteWorkspaceHandler(getId(ws))}>Delete</button>
            </div>
          ))}
        </>
      ) : (
        <div>
          <h2>Login</h2>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <input placeholder="Enter username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={createUserHandler}>Create User</button>
        </div>
      )}
    </div>
  );
  
};

export default App;
