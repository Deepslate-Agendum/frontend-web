import { useState } from "react";
import PropTypes from "prop-types";
import TaskModal from "./TaskModal";
import '../../css/TaskDetails.css'

const TaskDetails = ({ task, onClose, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{task.title || "No Title"}</h2>
        <p><strong>Description:</strong> {task.description ?? "No Description"}</p>
        <p><strong>Tags:</strong> {Array.isArray(task.tags) ? task.tags.join(", ") : task.tags || "No Tags"}</p>
        <p><strong>Due Date:</strong> {task.due_date ?? "No Due Date"}</p>

        <button onClick={() => setShowEditModal(true)}>Edit Task</button>
        <button onClick={() => onDelete(task.id)}>Delete Task</button>
      </div>

      {showEditModal && (
        <TaskModal 
        task={task}
        onClose={() => setShowEditModal(false)} 
        onUpdate={(taskId, updatedData) => {
          console.log("Updating Task:", taskId, updatedData);
          onUpdate(taskId, updatedData);
        }}
      />
      
        )}
    </div>
  );
};

TaskDetails.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    tags: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    due_date: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TaskDetails;
