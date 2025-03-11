import { useState } from "react";
import TaskItem from "./TaskItem";
import TaskDetails from "./TaskDetails";
import PropTypes from "prop-types";

const TaskList = ({ tasks, updateTask, deleteTas }) => {
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
          onUpdate={async (taskId, updatedData) => {
            const freshTask = await updateTask(taskId, updatedData);
            if (freshTask) {
              setSelectedTask(freshTask); // This refreshes the popup immediately
            }
          }}          onDelete={() => deleteTask(selectedTask.id)}
          onCreateSubtask={(parentId, newSubtask) => createTask(parentId, newSubtask)}
        />
      )}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  updateTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

export default TaskList;
