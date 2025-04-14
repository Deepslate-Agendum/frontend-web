// This component displays the details of a task in a modal. It allows users to view task information,
// edit the task, delete the task, or add subtasks. It uses `TaskModal` for editing tasks and 
// `SubtaskModal` for adding subtasks. The component also handles closing the modal and propagating 
// updates to parent components.

import { useState } from "react";
import PropTypes from "prop-types";
import TaskModal from "./TaskModal";
import SubtaskModal from "./SubtaskModal";
import '../../css/TaskDetails.css'

const TaskDetails = ({ task, onClose, onUpdate, onDelete, onCreateSubtask, workspace, completedTasks, toggleTaskCompletion }) => {
  // State to control the visibility of the edit task modal
  const [showEditModal, setShowEditModal] = useState(false);
  // State to control the visibility of the add subtask modal
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close button positioned within the modal box */}
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{task.title || "No Title"}</h2>
        <p><strong>Description:</strong> {task.description ?? "No Description"}</p>
        <p>
          <strong>Tags:</strong>{" "}
          {Array.isArray(task.tags)
            ? task.tags.join(", ")
            : task.tags || "No Tags"}
        </p>
        <p><strong>Due Date:</strong> {task.due_date ?? "No Due Date"}</p>
        <p>
          <strong>Completed:</strong>
          <input
            type="checkbox"
            className="task-details-checkbox"
            checked={completedTasks?.has(task.id)}
            onChange={() => toggleTaskCompletion(task.id)}
          />
        </p>
        <button onClick={() => setShowEditModal(true)}>Edit Task</button>
        <button onClick={() => {
          onDelete(task.id);
          onClose();
        }}>Delete Task</button>
        <button onClick={() => setShowSubtaskModal(true)}>Add Subtask</button>
      </div>

      {/* Render the edit task modal if `showEditModal` is true */}
      {showEditModal && (
        <TaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedData) => {
            console.log("[TaskDetails] onUpdate called with:", updatedData);
            onUpdate(updatedData);
            setShowEditModal(false);
          }}
          workspace={workspace}
        />
      )}

      {/* Render the add subtask modal if `showSubtaskModal` is true */}
      {showSubtaskModal && (
        <SubtaskModal
          parentTask={task}
          onClose={() => setShowSubtaskModal(false)}
          onCreate={(newSubtask) => {
            console.log("Creating subtask for task", task.id, newSubtask);
            onCreateSubtask(task.id, newSubtask);
            setShowSubtaskModal(false);
          }}
        />
      )}
    </div>
  );
};

// Define the expected prop types for the component
TaskDetails.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    due_date: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreateSubtask: PropTypes.func.isRequired,
  completedTasks: PropTypes.instanceOf(Set),
  toggleTaskCompletion: PropTypes.func,

};

export default TaskDetails;
