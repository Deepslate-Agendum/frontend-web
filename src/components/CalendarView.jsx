import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../css/CalendarView.css";

const CalendarView = ({ tasks, onTaskClick }) => {
  const [groupedTasks, setGroupedTasks] = useState({});

  useEffect(() => {
    // Group tasks by their due date
    const grouped = tasks.reduce((acc, task) => {
      const dueDate = task.due_date || "No Due Date";
      if (!acc[dueDate]) acc[dueDate] = [];
      acc[dueDate].push(task);
      return acc;
    }, {});
    setGroupedTasks(grouped);
  }, [tasks]);

  return (
    <div className="calendar-view-container">
      <h2 className="calendar-view-header">Calendar View</h2>
      <div className="calendar-grid">
        {Object.keys(groupedTasks).map((date) => (
          <div key={date} className="calendar-day">
            <h3 className="calendar-date">{date}</h3>
            <ul className="task-list">
              {groupedTasks[date].map((task) => (
                <li
                  key={task.id}
                  className="calendar-task"
                  onClick={() => onTaskClick(task)}
                >
                  {task.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

CalendarView.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      due_date: PropTypes.string,
    })
  ).isRequired,
  onTaskClick: PropTypes.func.isRequired,
};

export default CalendarView;
