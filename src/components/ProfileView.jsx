import React, { useState } from "react";
import PropTypes from "prop-types";
import "../../css/ProfileView.css";

const ProfileView = ({ user, onUpdateProfile, onLogout, onDeleteAccount, onBack, workspaces, onCreateWorkspace, onDeleteWorkspace }) => {
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleSave = () => {
    const updatedProfile = { username: username.trim(), password: password.trim() };
    onUpdateProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
    } else {
      alert("Workspace name cannot be empty.");
    }
  };

  return (
    <div className="profile-view-container">
      <button 
        className="back-button" 
        onClick={onBack} 
        style={{ display: window.innerWidth > 768 ? "block" : "none" }} // Hide in mobile mode
      >
        Back
      </button>
      <div className="profile-header">
        {/* <img src={user.profilePicture || "default-profile.png"} alt="Profile" className="profile-picture" /> */}
        <h2>Hello {user.username}!</h2>
      </div>
      <div className="profile-section">
        <h3>Account Details</h3>
        <div className="profile-field">
          <label>Username:</label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <span>{user.username}</span>
          )}
        </div>
        <div className="profile-field">
          <label>Password:</label>
          {isEditing ? (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          ) : (
            <span>********</span>
          )}
        </div>
        {isEditing ? (
          <div className="profile-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button
            className="edit-button"
            onClick={() => alert("Edit Profile button clicked!")} // Show a popup message
          >
            Edit Profile
          </button>
        )}
      </div>
      <div className="profile-section">
        <h3>Manage Workspaces</h3>
        <ul className="workspace-list">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className="workspace-item">
              <span>{workspace.name}</span>
              <div>
                <button onClick={() => alert(`Add a user to ${workspace.name}`)} className="action-workspace-button">Add User</button> {/* New button */}
                <button onClick={() => alert(`Leave ${workspace.name}`)} className="leave-workspace-button">Leave</button> {/* New button */}
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the workspace "${workspace.name}"?`)) {
                      onDeleteWorkspace(workspace.id || workspace._id["$oid"]); // Ensure the correct ID format is passed
                    }
                  }}
                  className="delete-workspace-button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="create-workspace">
          <input
            type="text"
            placeholder="New Workspace Name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <button onClick={handleCreateWorkspace}>Create</button>
        </div>
      </div>
      <div className="profile-section danger-zone">
        <h3>Danger Zone</h3>
        <button className="logout-button" onClick={onLogout}>Log Out</button>
        <button className="delete-account-button" onClick={() => alert(`Button to delete account`)} >Delete Account</button>
      </div>
    </div>
  );
};

ProfileView.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    // profilePicture: PropTypes.string,
  }).isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onDeleteAccount: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  workspaces: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onCreateWorkspace: PropTypes.func.isRequired,
  onDeleteWorkspace: PropTypes.func.isRequired,
};

export default ProfileView;
