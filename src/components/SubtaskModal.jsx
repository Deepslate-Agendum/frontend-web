// This component renders a modal for creating a subtask. It allows users to input details such as title, description, tags, due date, and whether the subtask is dependent. 
// The modal communicates with parent components via `onClose` and `onCreate` props.

import { useState, useEffect} from "react";
import PropTypes from "prop-types";
import "../../css/App.css";
import "../../css/modal.css";


const SubtaskModal = ({ onClose, onCreate, parentTask, dependentDefault = false, onCreateDependency }) => {
  // State variables to manage form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dependent, setDependent] = useState(dependentDefault);

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

  
  const handleSubmit = async () => {
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
  
    const newSubtask = {
      title: title.trim(),
      description: description.trim(),
      tags: formattedTags,
      due_date: dueDate || "",
      parentTaskId: parentTask.id,
      dependent,
      ownerUsername: parentTask.ownerUsername,
      workspaceId: parentTask.workspaceId,
    };
  
    console.log("Sending to parent handler:", newSubtask);
    await onCreate(newSubtask);
    onClose();
  };
  
  

  return (
    <div className="modal-overlay modal-nested">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Create Subtask</h2>
  
        <input type="text" placeholder="Subtask Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <label>
          <input type="checkbox" checked={dependent} onChange={(e) => setDependent(e.target.checked)} />
          Dependent Subtask
        </label>
  
        <div className="modal-actions">
          <button className="modal-btn primary" onClick={handleSubmit}>Create</button>
          <button className="modal-btn danger" onClick={onClose}>Cancel</button>
        </div>
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
    ownerUsername: PropTypes.string // Parent task owner
  }).isRequired,
  dependentDefault: PropTypes.bool, // Default value for the dependent checkbox
  
};

export default SubtaskModal;
