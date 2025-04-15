import React from "react";
import PropTypes from "prop-types";
import "../../css/App.css";

const BottomNav = ({ onChangeView, onTaskModalOpen, onProfileClick }) => {
  return (
    <div className="bottom-app-bar">
      <button onClick={() => onChangeView("list")}>List</button>
      <button onClick={() => onChangeView("map")}>Map</button>
      <button onClick={onTaskModalOpen}>Add Task</button>
      <button onClick={() => onChangeView("calendar")}>Calendar</button>
      <button onClick={onProfileClick}>Profile</button>
    </div>
  );
};

BottomNav.propTypes = {
  onChangeView: PropTypes.func.isRequired,
  onTaskModalOpen: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
};

export default BottomNav;
