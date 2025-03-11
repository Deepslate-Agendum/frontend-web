// This component renders a view for selecting different filters with icons.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSchool, FaBriefcase, FaLifeRing, FaChevronRight, FaPlus } from 'react-icons/fa';
import './FilterView.css';

export default function FilterView() {
    const navigate = useNavigate(); // Hook to navigate programmatically

    // Mock data for filters
    const filters = [
        { id: 1, name: 'All', icon: <FaLifeRing /> },
        { id: 2, name: 'School', icon: <FaSchool /> },
        { id: 3, name: 'Work', icon: <FaBriefcase /> },
        { id: 4, name: 'Life', icon: <FaLifeRing /> }
    ];

    // Function to handle filter button click
    const handleFilterClick = (filter) => {
        console.log(`Filter selected: ${filter.name}`);
        // Add any additional logic here
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div className="filter-view-container">
            <button className="add-button" onClick={() => console.log('Add button clicked')}>
                <FaPlus /> {/* Icon for the add button */}
            </button>
            <h2>Choose a Filter</h2>
            <div className="filter-list">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        className="filter-view-button"
                        onClick={() => handleFilterClick(filter)}
                    >
                        <span className="filter-icon">{filter.icon}</span> {/* Filter icon */}
                        <span className="filter-name">{filter.name}</span> {/* Filter name */}
                        <span className="filter-arrow"><FaChevronRight /></span> {/* Arrow icon */}
                    </button>
                ))}
            </div>
        </div>
    );
}