import '../css/App.css';
import { useEffect, useState } from "react";
import TaskModal from "./components/TaskModal";
import TaskList from './components/TaskList';
import { loginUser, createUser, getTasks, createTask, updateTask, getWorkspaces, createWorkspace, deleteWorkspace, getParentTask, getSubtasks, getDependentTasks } from "./utils/api";

const API_BASE = "http://127.0.0.1:5000"; // Backend URL

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginError, setLoginError] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  useEffect(() => {
    if (currentWorkspace) {
      fetchTasks(currentWorkspace.id);
    } else {
      setTasks([]);
    }
  }, [currentWorkspace]);
  

  //Authentication Endpoints

  //Login

  /* Official login
  const handleLogin = async () => {
    setLoginError(""); // Reset error
    try {
      const data = await loginUser(email, password); //api call from utils
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      setToken(data.token);
      setUserEmail(email);
      setEmail("");
      setPassword("");
      console.log("Login successful!");
    } catch (err) {
      setLoginError("Invalid credentials");
      console.error("Login failed:", err);
    }
  };
  */

  //Login without flask implementation, always works
  const handleLogin = async () => {
    setLoginError("");

    const dummyToken = "dummytoken";
    const dummyEmail = email || "dummy@email.com";

    localStorage.setItem("token", dummyToken);
    localStorage.setItem("userEmail", dummyEmail);

    setToken(dummyToken);
    setUserEmail(dummyEmail);
    setEmail("");
    setPassword("");

    console.log("Dummy login successful!");
  };


  //Logout

  const handleLogout = () => { //take away the login token
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken("");
    setUserEmail("");
    console.log("Logged out");
  };

  //SignUp (createUser)
  const createUserHandler = async () => {
    try {
      await createUser(email, password); //api call to utils
      console.log("User created successfully");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  

  //Task Endpoints
  

  //Fetch Tasks 
  const fetchTasks = async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const allTasks = await getTasks(workspaceId); //api call to utils
      const filteredTasks = allTasks.filter(task => task.workspaceId === workspaceId);
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };
  
  
  
  //Create Task
  const createTaskHandler = async (title, description, tags, dueDate, workspaceId, parentTaskId = null, dependent = false) => {
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
        dueDate,
        workspaceId: currentWorkspace.id,
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
  const updateTaskHandler = async (taskId, updatedData) => {
    try {
      await updateTask(taskId, updatedData); //api call to utils
      fetchTasks(currentWorkspace?.id);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  

  
  // Delete Task
  const deleteTaskHandler = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);  //api call from utils
      fetchTasks(currentWorkspace?.id); //refresh task list after deletion
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
  /*
  const fetchWorkspaces = async () => {
    try {
      const workspaces = await getWorkspaces(); //api call for utils
      setWorkspaces(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    }
  };
  */
  const fetchWorkspaces = async () => {
    try {
        const workspaces = await getWorkspaces();
        setWorkspaces(workspaces);
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        setWorkspaces([{ id: "dummy", name: "Default Workspace" }]); // Fallback workspace
    }
  };


  // Create Workspace
  const createWorkspaceHandler = async () => {
    if (!workspaceName) return alert("Workspace name required!");
  
    try {
      await createWorkspace(workspaceName); //api call to utils
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
          <p>Welcome, <strong>{userEmail}</strong>!</p>
          <button onClick={handleLogout}>Logout</button>
  
          <h2>Task List</h2>
          <button onClick={() => setShowTaskModal(true)}>Create Task</button>
          {showTaskModal && <TaskModal 
                              onClose={() => setShowTaskModal(false)} 
                              onCreate={createTaskHandler}
                              currentWorkspaceId={currentWorkspace?.id}
                            />}
  
          <TaskList 
            tasks={tasks} 
            updateTask={updateTaskHandler} 
            deleteTask={deleteTaskHandler}
          />
  
          <h2>Workspaces</h2>
          <input type="text" placeholder="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
          <button onClick={createWorkspaceHandler}>Create Workspace</button>
  
          {workspaces.map((ws) => (
            <div key={ws.id}>
              <div onClick={() => handleSelectWorkspace(ws)}>
                {ws.name}
              </div>
              <button onClick={() => deleteWorkspaceHandler(ws.id)}>Delete</button>
            </div>
          ))}
        </>
      ) : (
        <div>
          <h2>Login</h2>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={createUserHandler}>Create User</button>
        </div>
      )}
    </div>
  );
  
};

export default App;
