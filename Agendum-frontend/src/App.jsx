import './App.css'
import { useEffect, useState } from "react";

const App = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);
  
  return (
    <>
    <div>
      <h1>Deepslate Agendum </h1>
      <div className='row'>
        <div>
          <h2>Fetch Users</h2>
          <ul>{users.map((user) => <li key={user._id}>{user.name}</li>)}</ul>
        </div>
        <div>
          <h2>Fetch Tasks of Users</h2>
          <ul>{tasks.map((task) => <li key={task._id}>{task.title}</li>)}</ul>
        </div>

      </div>
      </div>
    </>
  )
}

export default App
