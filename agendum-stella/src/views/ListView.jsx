// This component renders a list view of tasks with options to filter and navigate.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListView.css'; // Import styles for consistency

export default function ListView() {
    const navigate = useNavigate(); // Hook for navigation

    // Mock data for tasks (temporary until backend is connected)
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Buy Groceries', description: 'Milk, Eggs, Bread', tags: ['Shopping'], due_date: '2025-02-15' },
        { id: 2, title: 'Finish Project', description: 'Complete the frontend UI', tags: ['Work', 'Urgent'], due_date: '2025-02-18' },
        { id: 3, title: 'Exercise', description: 'Go for a 30-minute run', tags: ['Health'], due_date: '2025-02-20' }
    ]);

    /*
    useEffect(() => {
        // Fetch tasks from the backend
        const fetchTasks = async () => {
            try {
                const response = await fetch('https://your-backend-url.com/api/tasks/');
                if (!response.ok) throw new Error('Failed to fetch tasks');
                
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTasks();
    }, []);
    */

    return (
      <div className="list-view-container">
          <div className="header-container">
              <h2>Task List</h2>
              <button className="filter-button" onClick={() => navigate('/filters')}>☰</button> {/* Small square filter button in top right */}
          </div>
          {tasks.length === 0 ? (
              <p>No tasks available.</p>
          ) : (
              <ul className="task-list">
                  {tasks.map((task) => (
                      <li key={task.id} className="task-item">
                          <h3 className="task-title">{task.title}</h3>
                          {task.due_date && <p className="task-date">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                          {task.description && <p className="task-description">{task.description}</p>}
                          {task.tags.length > 0 && (
                              <div className="task-tags">
                                  {task.tags.map((tag, index) => (
                                      <span key={index} className="tag">{tag}</span>
                                  ))}
                              </div>
                          )}
                      </li>
                  ))}
              </ul>
          )}
      </div>
  );
}
