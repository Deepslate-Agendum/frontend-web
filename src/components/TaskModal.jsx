// This component represents a modal for creating or editing tasks. It allows users to input task details such as title, description, tags, and due date.
// The modal supports both creating new tasks and updating existing ones, depending on whether a task prop is provided.
// It uses React state to manage form inputs and PropTypes for type-checking props.

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

// Helper function to extract the ID from a document object
const getId = (document) => document._id["$oid"];

const TaskModal = ({ onClose, onCreate, onUpdate, task, workspace }) => {
  // State variables for form inputs
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [tags, setTags] = useState(task ? String(task.tags) : "");
  const [dueDate, setDueDate] = useState(task ? task.due_date : "");

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
    // Convert tags input (a comma-separated string) into an array
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    console.log("TaskModal is submitting an update:", task?.id);

    if (task) {
      // Prepare the updated task object
      const updatedTask = {
        id: task.id,
        name: title.trim(), // Ensure no leading/trailing spaces
        title: title.trim(),
        description: description.trim(),
        tags: formattedTags,
        due_date: dueDate || "",
        workspace_id: getId(workspace) || "" // Extract workspace ID
      };

      onUpdate(updatedTask); // Call the update handler with the updated task
    } else {
      // Call the create handler with new task details
      onCreate(title, description, formattedTags, dueDate, workspace);
    }

    onClose(); // Close the modal after submission
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
  onClose: PropTypes.func.isRequired, // Function to close the modal
  onCreate: PropTypes.func, // Function to handle task creation
  onUpdate: PropTypes.func, // Function to handle task updates
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    due_date: PropTypes.string,
    currentWorkspaceId: PropTypes.number,
  }),
  workspace: PropTypes.object, // Workspace object containing task context
};

export default TaskModal;
