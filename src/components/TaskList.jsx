// This component renders a list of tasks and allows the user to interact with individual tasks.
// Users can view task details, update tasks, delete tasks, and create subtasks within a workspace context.

import { useState } from "react";
import TaskItem from "./TaskItem";
import TaskDetails from "./TaskDetails";
import PropTypes from "prop-types";
import { deleteTask } from "../utils/api";

const TaskList = ({ tasks, updateTask, deleteTask, workspace }) => {
  const [selectedTask, setSelectedTask] = useState(null); // State to track the currently selected task

  return (
    <div>
      {/* Render each task as a TaskItem component */}
      {tasks.map((task) => (
        <TaskItem
          key={task.id} // Unique key for each task
          task={task} // Pass task data as a prop
          onClick={() => setSelectedTask(task)} // Set the selected task when clicked
        />
      ))}

      {/* Render TaskDetails if a task is selected */}
      {selectedTask && (
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
};

export default TaskList;
