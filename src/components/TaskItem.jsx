import PropTypes from "prop-types";
import '../../css/TaskItem.css'

const TaskItem = ({ task, onClick }) => {
  console.log("Rendering TaskItem:", task); // Debugging
  return (
    <div className="task-item" onClick={() => onClick(task)}>
      <h3>{task.title || "No Title"}</h3>
      <p>{task.description || "No Description"}</p>
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TaskItem;
