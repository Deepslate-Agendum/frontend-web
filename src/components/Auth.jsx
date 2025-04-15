import React, { useState } from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const Auth = ({ onLogin, onCreateUser, loginError }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    onLogin(usernameInput.trim(), password.trim());
  };

  const handleCreateUser = () => {
    onCreateUser(usernameInput.trim(), password.trim());
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="welcome-text">Welcome</h1>
        <p className="login-subtitle">Log into your account to continue</p>
        {loginError && <p className="error-message">{loginError}</p>}
        <input
          className="login-input"
          placeholder="Enter username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />
        <div className="login-buttons">
          <button className="login-button" onClick={handleLogin}>
            Log In
          </button>
          <button className="signup-button" onClick={handleCreateUser}>
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

Auth.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onCreateUser: PropTypes.func.isRequired,
  loginError: PropTypes.string
};

export default Auth;
