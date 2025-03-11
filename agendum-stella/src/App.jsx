// Main application component with routing and todo list functionality

import React, { useState } from 'react'; // Import React and useState hook
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import React Router components
import { FaCompass, FaList, FaPlus, FaCalendar, FaUser } from 'react-icons/fa'; // Import icons from react-icons
import MapView from './views/MapView'; // Import MapView component
import ListView from './views/ListView'; // Import ListView component
import AddTaskView from './views/AddTaskView'; // Import AddTaskView component
import CalendarView from './views/CalendarView'; // Import CalendarView component
import AccountView from './views/AccountView'; // Import AccountView component
import FilterView from './views/FilterView'; // Import FilterView component
import './App.css'; // Import CSS file

function App() {
  const [todos, setTodos] = useState([]); // State for storing todos
  const [input, setInput] = useState(''); // State for storing input value

  const addTodo = () => {
    if (input.trim()) { // Check if input is not empty
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]); // Add new todo to the list
      setInput(''); // Clear input field
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo // Toggle completed status of todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id)); // Remove todo from the list
  };

  return (
    <Router>
      <div className="app">
        <div className="container">
          <h1>Agendum</h1>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)} // Update input state on change
                    placeholder="Add a new task"
                  />
                  <button onClick={addTodo}>Add Task</button> {/* Button to add new task */}
                  <ul>
                    {todos.map((todo) => (
                      <li key={todo.id}>
                        <span
                          style={{
                            textDecoration: todo.completed ? 'line-through' : 'none', // Strike-through if completed
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleTodo(todo.id)} // Toggle todo on click
                        >
                          {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button> {/* Button to delete todo */}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
            <Route path="/map" element={<MapView />} /> {/* Route for MapView */}
            <Route path="/list" element={<ListView />} /> {/* Route for ListView */}
            <Route path="/add-task" element={<AddTaskView />} /> {/* Route for AddTaskView */}
            <Route path="/calendar" element={<CalendarView />} /> {/* Route for CalendarView */}
            <Route path="/account" element={<AccountView />} /> {/* Route for AccountView */}
            <Route path="/filters" element={<FilterView />} /> {/* Route for FilterView */}
          </Routes>
        </div>
        <div className="footer">
          <Link to="/map">
            <button>
              <FaCompass size={20} /> {/* Icon for MapView */}
            </button>
          </Link>
          <Link to="/list">
            <button>
              <FaList size={20} /> {/* Icon for ListView */}
            </button>
          </Link>
          <Link to="/add-task">
            <button className="add-task-button">
              <FaPlus size={24} /> {/* Icon for AddTaskView */}
            </button>
          </Link>
          <Link to="/calendar">
            <button>
              <FaCalendar size={20} /> {/* Icon for CalendarView */}
            </button>
          </Link>
          <Link to="/account">
            <button>
              <FaUser size={20} /> {/* Icon for AccountView */}
            </button>
          </Link>
        </div>
      </div>
    </Router>
  );
}

export default App;
