// This component displays the details of a task in a modal. It allows users to view task information,
// edit the task, delete the task, or add subtasks. It uses `TaskModal` for editing tasks and 
// `SubtaskModal` for adding subtasks. The component also handles closing the modal and propagating 
// updates to parent components.

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TaskModal from "./TaskModal";
import SubtaskModal from "./SubtaskModal";
//import '../../css/TaskDetails.css'
import "../../css/modal.css";


const TaskDetails = ({ task, onClose, onUpdate, onDelete, onCreateSubtask, workspace, completedTasks, toggleTaskCompletion }) => {
  // State to control the visibility of the edit task modal
  const [showEditModal, setShowEditModal] = useState(false);
  // State to control the visibility of the add subtask modal
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{task.title || "No Title"}</h2>
        <p><strong>Description:</strong> {task.description ?? "No Description"}</p>
        <p><strong>Tags:</strong> {Array.isArray(task.tags) ? task.tags.join(", ") : task.tags || "No Tags"}</p>
        <p><strong>Due Date:</strong> {task.due_date ?? "No Due Date"}</p>
        <label className="completed-checkbox">
          <input type="checkbox" checked={completedTasks?.has(task.id)} onChange={() => toggleTaskCompletion(task.id)} />
          <p><strong>Completed</strong></p>
        </label>
  
        <div className="modal-actions">
          <button className="modal-btn primary" onClick={() => setShowEditModal(true)}>Edit</button>
          <button className="modal-btn danger" onClick={() => { onDelete(task.id); onClose(); }}>Delete</button>
          <button className="modal-btn subtask" onClick={() => setShowSubtaskModal(true)}>Add Subtask</button>
        </div>
      </div>
  
      {showEditModal && (
        <TaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedData) => {
            onUpdate(updatedData);
            setShowEditModal(false);
          }}
          workspace={workspace}
          className="modal-nested"
        />
      )}
  
      {showSubtaskModal && (
        <SubtaskModal
          parentTask={task}
          onClose={() => setShowSubtaskModal(false)}
          onCreate={(newSubtask) => {
            onCreateSubtask(task.id, newSubtask);
            setShowSubtaskModal(false);
          }}
          className="modal-nested"
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
