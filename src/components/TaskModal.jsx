// This component represents a modal for creating or editing tasks. It allows users to input task details such as title, description, tags, and due date.
// The modal supports both creating new tasks and updating existing ones, depending on whether a task prop is provided.
// It uses React state to manage form inputs and PropTypes for type-checking props.

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

// Helper function to extract the ID from a document object
const getId = (document) => document?._id?.["$oid"] || "";

const TaskModal = ({ onClose, onCreate, onUpdate, task, prefillPosition, workspace, preFilledTask }) => {
  // State variables for form inputs
  const [title, setTitle] = useState(task?.title ?? prefillPosition?.title ?? preFilledTask?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? prefillPosition?.description ?? preFilledTask?.description ?? "");
  const [tags, setTags] = useState(task?.tags ? String(task.tags) : prefillPosition?.tags?.join(", ") ?? preFilledTask?.tags?.join(", ") ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? prefillPosition?.due_date ?? preFilledTask?.due_date ?? "");
  
  // Effect to update state when the task prop changes
  useEffect(() => {
    if (task) {
      console.log("✏️ Editing Task:", task);
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags.join(", ") : task.tags || "");
      setDueDate(task.due_date || "");
    }
  }, [task]);

  // Handle form submission for creating or updating a task
  const handleSubmit = () => {
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
  
    const safeDueDate = dueDate ? new Date(dueDate).toISOString().split("T")[0] : "";
  
    if (task) {
      const updatedTask = {
        id: task.id,
        name: title.trim(),
        title: title.trim(),
        description: description.trim(),
        tags: formattedTags,
        due_date: safeDueDate,
        workspace_id: getId(workspace),
        x_location: String(task.x_location ?? "0"),
        y_location: String(task.y_location ?? "0"),
      };
      onUpdate(updatedTask);
    } else {
      // This ensures (0, 0) if undefined, or the clicked position if MapView
      const position = prefillPosition ?? { x: 0, y: 0 };
      onCreate(
        title,
        description,
        formattedTags,
        safeDueDate,
        getId(workspace),
        [],
        position
      );
    }
  
    onClose();
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{task ? "Edit Task" : "Create Task"}</h2>

        {/* Input fields for task details */}
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        {/* Submit button */}
        <button onClick={handleSubmit}>{task ? "Update Task" : "Create Task"}</button>
      </div>
    </div>
  );
};

// Define prop types for the component
TaskModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    due_date: PropTypes.string,
    x_location: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    y_location: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  prefillPosition: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    due_date: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  workspace: PropTypes.object,
};


export default TaskModal;
