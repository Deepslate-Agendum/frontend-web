// This component renders a list of tasks and allows the user to interact with individual tasks.
// Users can view task details, update tasks, delete tasks, and create subtasks within a workspace context.

import { useState, useEffect } from "react";
import TaskItem from "./TaskItem";
import TaskDetails from "./TaskDetails";
import PropTypes from "prop-types";
import { deleteTask } from "../utils/api";

const TaskList = ({ tasks, updateTask, deleteTask, workspace, onTaskClick, highlightedTask }) => {
  const [selectedTask, setSelectedTask] = useState(null); // State to track the currently selected task
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State to track if the view is mobile

  // Update `isMobile` state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTaskClick = (task) => {
    if (isMobile) {
      setSelectedTask(task); // Show task details in mobile mode
    } else {
      onTaskClick(task); // Invoke the onTaskClick prop for desktop mode
    }
  };

  return (
    <div>
      {/* Render each task as a TaskItem component */}
      {tasks.map((task) => (
        <TaskItem
          key={task.id} // Unique key for each task
          task={task} // Pass task data as a prop
          isHighlighted={highlightedTask?.id === task.id} // Check if the task is highlighted
          onClick={() => handleTaskClick(task)} // Handle task click based on mode
        />
      ))}

      {/* Render TaskDetails if a task is selected and in mobile mode */}
      {isMobile && selectedTask && (
        <TaskDetails
          task={selectedTask} // Pass the selected task to TaskDetails
          onClose={() => setSelectedTask(null)} // Close the TaskDetails popup
          onUpdate={async (updatedData) => {
            const response = await updateTask(updatedData); // Call the updateTask function
            if (response) {
              setSelectedTask(updatedData); // Update the selected task with new data
            }
          }}
          onDelete={() => deleteTask(selectedTask.id)} // Delete the selected task
          onCreateSubtask={(parentId, newSubtask) => createTask(parentId, newSubtask)} // Create a subtask
          workspace={workspace} // Pass workspace context
        />
      )}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // Task ID is required
      title: PropTypes.string.isRequired, // Task title is required
      description: PropTypes.string, // Task description is optional
    })
  ).isRequired,
  updateTask: PropTypes.func.isRequired, // Function to update a task
  deleteTask: PropTypes.func.isRequired, // Function to delete a task
  onTaskClick: PropTypes.func.isRequired, // Function to handle task click in desktop mode
  highlightedTask: PropTypes.shape({
    id: PropTypes.string.isRequired, // Highlighted task ID is required
  }), // Highlighted task is optional
};

export default TaskList;
