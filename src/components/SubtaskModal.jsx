import { useState } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const SubtaskModal = ({ onClose, onCreate, parentTask, dependentDefault = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dependent, setDependent] = useState(dependentDefault);

  const handleSubmit = () => {
    // Convert tags input into an array
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    const newSubtask = {
      title: title.trim(),
      description: description.trim(),
      tags: formattedTags,
      due_date: dueDate || "",
      parentTaskId: parentTask.id,
      dependent: dependent,
      ownerUsername: parentTask.ownerUsername,
      workspaceId: parentTask.workspaceId,
    };

    console.log("Creating subtask for parent", parentTask.id, newSubtask);
    onCreate(newSubtask);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Create Subtask</h2>
        <input
          type="text"
          placeholder="Subtask Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={dependent}
            onChange={(e) => setDependent(e.target.checked)}
          />
          Dependent Subtask
        </label>
        <button onClick={handleSubmit}>Create Subtask</button>
      </div>
    </div>
  );
};

SubtaskModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  parentTask: PropTypes.shape({
    id: PropTypes.string.isRequired,
    ownerUsername: PropTypes.string.isRequired,
  }).isRequired,
  dependentDefault: PropTypes.bool,
};

export default SubtaskModal;
