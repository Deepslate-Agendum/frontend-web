import '../css/App.css';
import { useEffect, useState } from "react";
import TaskModal from "./components/TaskModal";
import TaskList from './components/TaskList';

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
    if (token) {
      fetchTasks();
      fetchWorkspaces();
    }
  }, [token,currentWorkspace]); //only fetch tasks and workspace belonging to user

  //Authentication Endpoints

  //Login
  const handleLogin = async () => {
    setLoginError(""); //Reset error before new attempt
    try {
      const response = await fetch(`${API_BASE}/login`, { //api call
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json(); //upon receiving api call apply data + set status to login (unless error)
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        setToken(data.token);
        setUserEmail(email);
        setEmail("");
        setPassword("");
        console.log("Login successful!");
      } else {
        setLoginError(data.message || "Invalid credentials");
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
      console.error("Error:", error);
    }
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

  const createUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/new_user`, { //api call
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "TestUser",
          email: email,
          password: password,
          name: "Test Name"
        })
      });

      if (!response.ok) throw new Error("Failed to create user");
      console.log("User created successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Task Endpoints
  
  const fetchTasks = async () => {
    try {
      let url = `${API_BASE}/tasks`;
      if (currentWorkspace) {
        url += `?workspaceId=${currentWorkspace.id}`;
      }
    
      const response = await fetch(url, {  
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    
      const data = await response.json();
      console.log("Fetched tasks:", data.tasks);
    
      if (!Array.isArray(data.tasks)) {
        console.error("Error: tasks is not an array", data);
        setTasks([]); 
        return;
      }
    
      //Ensure array
      const formattedTasks = data.tasks.map((task) => {
        const tagsArray = Array.isArray(task.tags)
          ? task.tags
          : task.tags
          ? task.tags.split(",").map(tag => tag.trim())
          : [];
        return { ...task, tags: tagsArray };
      });
    
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };
  
  
  //Create Task
  const createTask = async (title, description, tags, dueDate, workspaceId) => {
    if (typeof title !== "string" || title.trim() === "") {
      console.error("Error: Title is not a valid string", title);
      return;
    }
    if (!currentWorkspace) { //require a workspace to be selected to create task
      console.error("Error: No workspace selected.");
      return;
    }
  
    const newTask = {
      title: title.trim(),
      description: description ? String(description).trim() : "",
      tags: Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim()),  // Ensure array
      due_date: dueDate ? String(dueDate) : "",
      ownerEmail: userEmail,
      workspaceId: workspaceId,
    };
  
    try {
      const response = await fetch(`${API_BASE}/new_task`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newTask),
      });
  
      if (!response.ok) throw new Error("Failed to create task");
  
      const data = await response.json();
      console.log("Task Created:", data.task);
  
      setTasks((prevTasks) => [...prevTasks, data.task]);
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  // Edit (Update) Task
  const updateTask = async (taskId, updatedData) => {
    console.log("Sending Update Request...");
    console.log("Task ID:", taskId);
    console.log("Data Sent:", updatedData);

    if (!taskId || typeof updatedData !== "object") {
        console.error("Invalid update request:", taskId, updatedData);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/update_task`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                taskId: Number(taskId),  //Ensure ID is sent as a number
                title: updatedData.title || "",
                description: updatedData.description || "",
                //Send tags as an array if available
                tags: Array.isArray(updatedData.tags) ? updatedData.tags : updatedData.tags || [],
                due_date: updatedData.due_date || ""
            })
        });
        if (!response.ok) throw new Error("Failed to update task");
        const data = await response.json();
        console.log("Server Response:", data);
        
        // Keep the fetchTasks() call if you want the global list updated:
        fetchTasks(); 
        
        // Return the updated task object so the caller can use it
        return data.task;  
        

    } catch (error) {
        console.error("Update Failed:", error);
    }
};

  
  // Delete Task
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`${API_BASE}/delete_task/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Create Subtask Handler (basically the same as createtask but comes w/ a parent + dependency)
  const createSubtask = async (parentTaskId, subtaskData) => {
  const newSubtask = {
    ...subtaskData,
    parentTaskId: parentTaskId,
    ownerEmail: userEmail,
  };

  try {
    const response = await fetch(`${API_BASE}/new_task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newSubtask),
    });
    if (!response.ok) throw new Error("Failed to create subtask");
    const data = await response.json();
    console.log("Subtask Created:", data.subtask || data.task);
    fetchTasks();
  } catch (error) {
    console.error("Error creating subtask:", error);
  }
};

  // Get Dependent Tasks for a given parentTaskId
  const getDependentTasks = async (parentTaskId) => {
    try {
      const response = await fetch(`${API_BASE}/dependent_tasks?parentTaskId=${parentTaskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      console.log("Dependent tasks:", data.dependent_tasks);
      return data.dependent_tasks;
    } catch (error) {
      console.error("Error fetching dependent tasks:", error);
      return [];
    }
  };

  // Get all subtasks for a given parentTaskId
  const getSubtasks = async (parentTaskId) => {
    try {
      const response = await fetch(`${API_BASE}/subtasks?parentTaskId=${parentTaskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      console.log("Subtasks:", data.subtasks);
      return data.subtasks;
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      return [];
    }
  };

  // Get the parent task for a given subtask (by subtask ID)
  const getParentTask = async (subtaskId) => {
    try {
      const response = await fetch(`${API_BASE}/parent_task/${subtaskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      console.log("Parent task:", data.parent_task);
      return data.parent_task;
    } catch (error) {
      console.error("Error fetching parent task:", error);
      return null;
    }
  };


  //Workspace endpoints

  // Fetch Workspaces
  const fetchWorkspaces = async () => { //only fetch your own workspaces
    try {
      const response = await fetch(`${API_BASE}/workspaces`, { //api call
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch workspaces");

      const data = await response.json();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    }
  };

  // Create Workspace
  const createWorkspace = async () => {
    if (!workspaceName) return alert("Workspace name required!");
    try {
      const response = await fetch(`${API_BASE}/new_workspace`, { //api call
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: workspaceName })
      });

      if (!response.ok) throw new Error("Failed to create workspace");
      setWorkspaceName("");
      fetchWorkspaces();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Delete Workspace
  const deleteWorkspace = async (workspaceId) => {
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
    try {
      const response = await fetch(`${API_BASE}/delete_workspace/${workspaceId}`, { //api call
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete workspace");
      fetchWorkspaces();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSelectWorkspace = (ws) => {
    setCurrentWorkspace(ws);
    fetchTasks();
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
                              onCreate={createTask}
                              currentWorkspaceId={currentWorkspace?.id}
                            />}
  
          <TaskList 
            tasks={tasks} 
            updateTask={updateTask} 
            deleteTask={deleteTask}
            createSubtask={createSubtask}
          />
  
          <h2>Workspaces</h2>
          <input type="text" placeholder="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
          <button onClick={createWorkspace}>Create Workspace</button>
  
          {workspaces.map((ws) => (
            <div key={ws.id}>
              <div key={ws.id} onClick={() => handleSelectWorkspace(ws)}>
                {ws.name}
              </div>
              <button onClick={() => deleteWorkspace(ws.id)}>Delete</button>
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
          <button onClick={createUser}>Create User</button>
        </div>
      )}
    </div>
  );
  
};

export default App;
