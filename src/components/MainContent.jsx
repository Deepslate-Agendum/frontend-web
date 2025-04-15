import React from "react";
import PropTypes from "prop-types";
import TaskList from "./TaskList";
import MapView from "./MapView";
import CalendarView from "./CalendarView";
import "../../css/App.css";

const MainContent = ({
  viewMode,
  tasks,
  dependencies,
  onTaskClick,
  completedTasks,
  toggleTaskCompletion,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  setShowTaskModal,
  setMapClickPosition,
  prefillPosition,
  currentWorkspace,
  onCreateDependency,
  fetchDependencies
}) => {
  switch (viewMode) {
    case "list":
      return (
        <div className="task-list-container">
          <h2 className="task-list-header">Task List</h2>
          <TaskList 
            tasks={tasks} 
            updateTask={updateTaskHandler} 
            deleteTask={deleteTaskHandler}
            workspace={currentWorkspace}
            highlightedTask={null}
            onTaskClick={onTaskClick}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
          />
          {window.innerWidth > 768 && (
            <button 
              onClick={() => {
                onTaskClick(null);
                setShowTaskModal(true);
              }} 
              className="task-button edit create-task-bottom"
            >
              +
            </button>
          )}
        </div>
      );
    case "map":
      return (
        <div className="map-view-container">
          <MapView 
            tasks={tasks}
            dependencies={dependencies}
            onCreateDependency={onCreateDependency}
            fetchDependencies={fetchDependencies}
            onCreateTask={createTaskHandler}
            onUpdateTask={updateTaskHandler}
            onTaskClick={onTaskClick}
            setShowTaskModal={setShowTaskModal}
            setMapClickPosition={setMapClickPosition}
            deleteTask={deleteTaskHandler}
            workspace={currentWorkspace}
            prefillPosition={prefillPosition}
            onDeleteDependency={onCreateDependency}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
          />
        </div>
      );
    case "calendar":
      return (
        <div className="calendar-view-container">
          <CalendarView
            tasks={tasks}
            onTaskClick={onTaskClick}
            onCreateTask={createTaskHandler}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
          />
        </div>
      );
    default:
      return null;
  }
};

MainContent.propTypes = {
  viewMode: PropTypes.string.isRequired,
  tasks: PropTypes.array.isRequired,
  dependencies: PropTypes.array,
  onTaskClick: PropTypes.func.isRequired,
  completedTasks: PropTypes.instanceOf(Set),
  toggleTaskCompletion: PropTypes.func.isRequired,
  createTaskHandler: PropTypes.func.isRequired,
  updateTaskHandler: PropTypes.func.isRequired,
  deleteTaskHandler: PropTypes.func.isRequired,
  setShowTaskModal: PropTypes.func.isRequired,
  setMapClickPosition: PropTypes.func.isRequired,
  prefillPosition: PropTypes.object,
  currentWorkspace: PropTypes.object,
  onCreateDependency: PropTypes.func.isRequired,
  fetchDependencies: PropTypes.func.isRequired
};

export default MainContent;
