// This component renders a calendar view with tasks displayed on their respective dates.

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css'; // Import styles for consistency

export default function CalendarView() {
    // Mock data for tasks (same as ListView)
    const [tasks] = useState([
        { id: 1, title: 'Buy Groceries', description: 'Milk, Eggs, Bread', tags: ['Shopping'], due_date: '2025-02-15' },
        { id: 2, title: 'Finish Project', description: 'Complete the frontend UI', tags: ['Work', 'Urgent'], due_date: '2025-02-18' },
        { id: 3, title: 'Exercise', description: 'Go for a 30-minute run', tags: ['Health'], due_date: '2025-02-20' }
    ]);

    // Group tasks by date
    const tasksByDate = tasks.reduce((acc, task) => {
        const date = task.due_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

    // Function to render tasks on a given date
    const renderTasks = (date) => {
        const dateString = date.toISOString().split('T')[0];
        const tasksForDate = tasksByDate[dateString] || [];
        return tasksForDate.map(task => (
            <div key={task.id} className="task-item">
                <h3 className="task-title">{task.title}</h3>
                {task.description && <p className="task-description">{task.description}</p>}
                {task.tags.length > 0 && (
                    <div className="task-tags">
                        {task.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="calendar-view-container">
            <h2>Calendar View</h2>
            <Calendar
                tileContent={({ date }) => renderTasks(date)}
                className="react-calendar"
            />
        </div>
    );
}