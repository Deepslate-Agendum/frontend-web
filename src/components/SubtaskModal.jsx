// This component renders a modal for creating a subtask. It allows users to input details such as title, description, tags, due date, and whether the subtask is dependent. 
// The modal communicates with parent components via `onClose` and `onCreate` props.

import { useState } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const SubtaskModal = ({ onClose, onCreate, parentTask, dependentDefault = false }) => {
  // State variables to manage form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dependent, setDependent] = useState(dependentDefault);

  const handleSubmit = () => {
    // Convert tags input into an array of trimmed, non-empty strings
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    // Create a new subtask object with the provided inputs
    const newSubtask = {
      title: title.trim(),
      description: description.trim(),
      tags: formattedTags,
      due_date: dueDate || "",
      parentTaskId: parentTask.id, // Link subtask to parent task
      dependent: dependent,
      ownerUsername: parentTask.ownerUsername, // Inherit owner from parent task
      workspaceId: parentTask.workspaceId, // Inherit workspace from parent task
    };

    console.log("Creating subtask for parent", parentTask.id, newSubtask);
    onCreate(newSubtask); // Pass the new subtask to the parent component
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Create Subtask</h2>
        {/* Input for subtask title */}
        <input
          type="text"
          placeholder="Subtask Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        {/* Textarea for optional description */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* Input for comma-separated tags */}
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        {/* Input for due date */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {/* Checkbox to mark the subtask as dependent */}
        <label>
          <input
            type="checkbox"
            checked={dependent}
            onChange={(e) => setDependent(e.target.checked)}
          />
          Dependent Subtask
        </label>
        {/* Button to submit the form */}
        <button onClick={handleSubmit}>Create Subtask</button>
      </div>
    </div>
  );
};

// Define prop types for the component
SubtaskModal.propTypes = {
  onClose: PropTypes.func.isRequired, // Function to close the modal
  onCreate: PropTypes.func.isRequired, // Function to handle subtask creation
  parentTask: PropTypes.shape({
    id: PropTypes.string.isRequired, // Parent task ID
    ownerUsername: PropTypes.string.isRequired, // Parent task owner
  }).isRequired,
  dependentDefault: PropTypes.bool, // Default value for the dependent checkbox
};

export default SubtaskModal;
