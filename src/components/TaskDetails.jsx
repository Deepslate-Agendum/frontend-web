import { useState } from "react";
import PropTypes from "prop-types";
import TaskModal from "./TaskModal";
import SubtaskModal from "./SubtaskModal";
import '../../css/TaskDetails.css'

const TaskDetails = ({ task, onClose, onUpdate, onDelete, onCreateSubtask }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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

        <button onClick={() => setShowEditModal(true)}>Edit Task</button>
        <button onClick={() => {
          onDelete(task.id);
          onClose();
        }}>Delete Task</button>
        <button onClick={() => setShowSubtaskModal(true)}>Add Subtask</button>
      </div>

      {showEditModal && (
        <TaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={(taskId, updatedData) => {
            console.log("[TaskDetails] onUpdate called with:", taskId, updatedData);
            onUpdate(taskId, updatedData);
            setShowEditModal(false);
          }}
        />
      )}

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

TaskDetails.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
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
};

export default TaskDetails;
