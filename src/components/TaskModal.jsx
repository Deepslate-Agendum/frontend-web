import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const TaskModal = ({ onClose, onCreate, onUpdate, task, currentWorkspaceId }) => {
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [tags, setTags] = useState(task ? String(task.tags) : "");
  const [dueDate, setDueDate] = useState(task ? task.due_date : "");

  useEffect(() => {
    if (task) {
      console.log("✏️ Editing Task:", task);
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags.join(", ") : task.tags || "");
      setDueDate(task.due_date || "");
    }
  }, [task]);

  const handleSubmit = () => {
    // Convert tags input (a comma-separated string) into an array
    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    const updatedTask = {
        title: title.trim(),
        description: description.trim(),
        tags: formattedTags,
        due_date: dueDate || ""
    };

    console.log("TaskModal is submitting an update:", task?.id, updatedTask);

    if (task) {
        onUpdate(task.id, updatedTask);  // Pass task ID and the update object
    } else {
        onCreate(title, description, formattedTags, dueDate, currentWorkspaceId);
    }
  
    onClose();
};


  
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{task ? "Edit Task" : "Create Task"}</h2>

        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <button onClick={handleSubmit}>{task ? "Update Task" : "Create Task"}</button>
      </div>
    </div>
  );
};

TaskModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    due_date: PropTypes.string,
    currentWorkspaceId: PropTypes.number,
  }),
};

export default TaskModal;
