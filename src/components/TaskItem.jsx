// This component represents a single task item in a task list. 
// It displays the task's title and description and triggers a callback when clicked.

import PropTypes from "prop-types"; // Importing PropTypes for type-checking props.
import '../../css/TaskItem.css'; // Importing the CSS file for styling the component.

const TaskItem = ({ task, onClick, isHighlighted, onCheckboxChange }) => {
  console.log("Rendering TaskItem:", task); // Debugging: Logs the task being rendered.

  return (
    <div 
      className={`task-item ${isHighlighted ? "highlighted-task" : ""}`} // Add a class if the task is highlighted
      onClick={() => onClick(task)} // Triggering the onClick callback with the task as an argument
    >
      {/* TODO: Add login to checkbox such that it marks the task as complete!
                Current logic just has it visually give the text a strikethrough effect.
                Current logic does not save when refreshed. Should be tied to database. */}
      <input 
        type="checkbox" 
        className="task-checkbox" 
        onClick={(e) => e.stopPropagation()} // Prevent triggering the button's onClick
        onChange={(e) => onCheckboxChange(task, e.target.checked)} // Trigger the checkbox change handler
      />
      <div className="task-content">
        <h3>{task.title || "No Title"}</h3> {/* Displaying the task title or a fallback if not provided */}
        <p>{task.description || "No Description"}</p> {/* Displaying the task description or a fallback if not provided */}
      </div>
    </div>
  );
};

// Defining the expected structure and types of props for the component.
TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired, // The task must have a unique string ID.
    title: PropTypes.string.isRequired, // The task must have a title.
    description: PropTypes.string, // The task may optionally have a description.
  }).isRequired,
  onClick: PropTypes.func.isRequired, // A function to handle click events is required.
  isHighlighted: PropTypes.bool, // A boolean to indicate if the task is highlighted.
  onCheckboxChange: PropTypes.func.isRequired, // A function to handle checkbox changes is required.
};

export default TaskItem; // Exporting the component for use in other parts of the application.
