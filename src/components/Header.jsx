import React from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const Header = ({ username, onViewModeChange, onLogout, onProfileClick }) => {
  return (
    <div className="top-right-container">
      <div className="view-buttons">
        <button onClick={() => onViewModeChange("list")}>List View</button>
        <button onClick={() => onViewModeChange("map")}>Map View</button>
        <button onClick={() => onViewModeChange("calendar")}>Calendar View</button>
      </div>
      <p>
        Welcome,{" "}
        <strong
          onClick={onProfileClick}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          {username}
        </strong>
        !
      </p>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
};

Header.propTypes = {
  username: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired
};

export default Header;
