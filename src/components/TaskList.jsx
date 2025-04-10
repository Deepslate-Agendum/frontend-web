import { useState } from "react";
import TaskItem from "./TaskItem";
import TaskDetails from "./TaskDetails";
import PropTypes from "prop-types";
import { deleteTask } from "../utils/api";

const TaskList = ({ tasks, updateTask, deleteTask, workspace }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onClick={() => setSelectedTask(task)}
        />
      ))}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updatedData) => {
            const response = await updateTask(updatedData);
            if (response) {
              setSelectedTask(updatedData); // This refreshes the popup immediately
            }
          }}
          onDelete={() => deleteTask(selectedTask.id)}
          onCreateSubtask={(parentId, newSubtask) => createTask(parentId, newSubtask)}
          workspace = {workspace}
        />
      )}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  updateTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

export default TaskList;
