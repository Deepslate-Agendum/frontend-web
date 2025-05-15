import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar"; // Ensure this import works after installing the package
import "react-calendar/dist/Calendar.css";
import "../../css/CalendarView.css";
import TaskDetails from "./TaskDetails"; // Import TaskDetails component

const CalendarView = ({ tasks, onTaskClick, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null); // State to track the selected task for the popup
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State to track if the view is mobile
  const [showNoDateTasks, setShowNoDateTasks] = useState(false); // State to toggle tasks without a date

  // Update `isMobile` state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTasksForDate = (date) => {
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]; // Normalize to local timezone and format as YYYY-MM-DD
    return tasks.filter(
      (task) => task.due_date && task.due_date === formattedDate // Compare normalized dates
    );
  };

  const getTasksWithoutDate = () => {
    return tasks.filter((task) => !task.due_date); // Filter tasks without a due date
  };

  const handleTaskClick = (task) => {
    if (isMobile) {
      setSelectedTask(task); // Show the popup in mobile mode
    } else {
      onTaskClick(task); // Highlight the task in the highlighted task section
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowNoDateTasks(false); // Reset to show tasks for the selected date
  };

  return (
    <div className="calendar-view-container">
      {/* <h2 className="calendar-view-header">Calendar View</h2> */}
      <div className="calendar-and-button">
        <Calendar
          onChange={handleDateClick} // Handle date click
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
        <button
          className="no-date-tasks-button"
          onClick={() => setShowNoDateTasks(true)} // Show tasks without a date
        >
          Tasks with No Date
        </button>
      </div>
      <div className="task-list-for-date">
        <h3>
          {showNoDateTasks
            ? "Tasks Without a Date"
            : `Tasks for ${selectedDate.toLocaleDateString()}`}
        </h3>
        <ul>
          {(showNoDateTasks ? getTasksWithoutDate() : getTasksForDate(selectedDate)).map((task) => (
            <li
              key={task.id}
              className="calendar-task"
              onClick={() => handleTaskClick(task)} // Handle task click
            >
              {task.title || "Untitled Task"}
            </li>
          ))}
        </ul>
        {!showNoDateTasks && (
          <button
            className="create-task-button"
            onClick={() => {
              const formattedDate = new Date(selectedDate.toDateString()); // Normalize the date to avoid timezone offsets
              onCreateTask(formattedDate); // Pass the normalized date to the handler
            }}
          >
            Create Task
          </button>
        )}
      </div>

      {/* Render TaskDetails popup only in mobile mode */}
      {isMobile && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)} // Close the popup
          onUpdate={(updatedData) => {
            onUpdateTask(updatedData); // Call the update handler
            setSelectedTask(updatedData); // Update the selected task
          }}
          onDelete={() => {
            onDeleteTask(selectedTask.id); // Call the delete handler
            setSelectedTask(null); // Close the popup after deletion
          }}
          onCreateSubtask={(parentId, newSubtask) => {
            console.log("Creating subtask for task", parentId, newSubtask);
          }}
        />
      )}
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
  onUpdateTask: PropTypes.func.isRequired, // Add prop type for the update task handler
  onDeleteTask: PropTypes.func.isRequired, // Add prop type for the delete task handler
};

export default CalendarView;
