import React from "react";
import PropTypes from "prop-types";
import "../../css/App.css";
import { getId } from "../utils/wrapper.js";

const WorkspaceDropdown = ({ workspaces, currentWorkspace, onSelectWorkspace, onDeleteWorkspace, onCreateWorkspace }) => {
  return (
    <div className="custom-dropdown">
      <button className="dropdown-button">
        {currentWorkspace ? `Current Workspace: ${currentWorkspace.name}` : "Select Workspace"}
        <span className="caret">▼</span>
      </button>
      <div className="dropdown-content">
        {workspaces.map((ws) => (
          <div
            key={getId(ws)}
            className="dropdown-item"
            onClick={() => onSelectWorkspace(ws)}
          >
            <span>{ws.name}</span>
            <button
              className="delete-workspace-button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete the workspace "${ws.name}"?`)) {
                  onDeleteWorkspace(getId(ws));
                }
              }}
            >
              Delete
            </button>
          </div>
        ))}
        <div
          className="dropdown-item"
          onClick={() => {
            const name = prompt("Enter the name of the new workspace:");
            if (name) {
              onCreateWorkspace(name.trim());
            }
          }}
        >
          <span>Create a New Workspace</span>
        </div>
      </div>
    </div>
  );
};

WorkspaceDropdown.propTypes = {
  workspaces: PropTypes.array.isRequired,
  currentWorkspace: PropTypes.object,
  onSelectWorkspace: PropTypes.func.isRequired,
  onDeleteWorkspace: PropTypes.func.isRequired,
  onCreateWorkspace: PropTypes.func.isRequired
};

export default WorkspaceDropdown;
