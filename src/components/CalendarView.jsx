import React, { useState } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar"; // Ensure this import works after installing the package
import "react-calendar/dist/Calendar.css";
import "../../css/CalendarView.css";

const CalendarView = ({ tasks, onTaskClick, onCreateTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTasksForDate = (date) => {
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]; // Normalize to local timezone and format as YYYY-MM-DD
    return tasks.filter(
      (task) => task.due_date && task.due_date === formattedDate // Compare normalized dates
    );
  };

  return (
    <div className="calendar-view-container">
      <h2 className="calendar-view-header"> </h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) => {
          const tasksForDate = getTasksForDate(date);
          return tasksForDate.length > 0 ? (
            <div className="calendar-tile-content">
              {tasksForDate.map((task) => (
                <span key={task.id} className="calendar-task-dot"></span>
              ))}
            </div>
          ) : null;
        }}
      />
      <div className="task-list-for-date">
        <h3>Tasks for {selectedDate.toLocaleDateString()}</h3>
        <ul>
          {getTasksForDate(selectedDate).map((task) => (
            <li
              key={task.id}
              className="calendar-task"
              onClick={() => onTaskClick(task)}
            >
              {task.title || "Untitled Task"}
            </li>
          ))}
        </ul>
        <button
          className="create-task-button"
          onClick={() => {
            const formattedDate = new Date(selectedDate.toDateString()); // Normalize the date to avoid timezone offsets
            onCreateTask(formattedDate); // Pass the normalized date to the handler
          }}
        >
          Create Task
        </button>
      </div>
    </div>
  );
};

CalendarView.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      due_date: PropTypes.string,
    })
  ).isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onCreateTask: PropTypes.func.isRequired, // Add prop type for the create task handler
};

export default CalendarView;
