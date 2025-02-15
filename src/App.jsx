import './App.css';
import { useEffect, useState } from "react";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginError, setLoginError] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]); // Fetch tasks only if token is available

  const fetchTasks = () => {
    fetch("http://127.0.0.1:5000/tasks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || [])) // Ensure tasks is an array
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  const handleLogin = async () => {
    /* handleLogin implementation with flask connected is commented out for deliverable one as per "no authentication" on the project plan. A dummy function to simulate a login with any credentials is included
    setLoginError(""); // Reset error before new attempt
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        setToken(data.token);
        setUserEmail(email);
        setEmail(""); // Clear input after login
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
      */



    //mock login function below -- any credentials accepted for login just for demo purposes (temporary)
    setLoginError(""); // Reset error before new attempt

    // Mocking a successful login without backend
    const mockUser = {
      token: "mocked-jwt-token",
      email: email,
    };
  
    localStorage.setItem("token", mockUser.token);
    localStorage.setItem("userEmail", email);
    setToken(mockUser.token);
    setUserEmail(email);
    setEmail(""); // Clear input after login
    setPassword("");
    console.log("Mock login successful!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken("");
    setUserEmail("");
    console.log("Logged out");
  };

  return (
    <div>
      <h1>Deepslate Agendum</h1>
      
      {token ? (
        <>
          <p>Welcome, <strong>{userEmail}</strong>!</p>
          <button onClick={handleLogout}>Logout</button>
          <h2>Tasks</h2>
          {tasks.length > 0 ? (
            <ul>{tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
          ) : (
            <p>No tasks available.</p>
          )}
        </>
      ) : (
        <div>
          <h2>Login</h2>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
