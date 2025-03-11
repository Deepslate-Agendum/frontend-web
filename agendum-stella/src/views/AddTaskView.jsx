/*
 * AddTaskView Component
 * 
 * This React component provides a form for adding a task with the following features:
 * - Task Title (Required input field)
 * - Task Description (Optional textarea)
 * - Task Tags (Optional, multiple tags can be added dynamically)
 * - Due Date (Optional date input)
 * - A Save Task button that triggers an API request to submit the task
 * 
 * The component uses useState to manage form inputs and error handling.
 * It ensures the required title field is filled before submission.
 * Upon successful submission, it sends the task data to the backend, clears the form, 
 * and navigates back to the previous view.
 */


// TODO: Add cancel or exit button to quit out of making a task
// TODO: Should I hide the footer when adding a task?

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTaskView.css'; // Import the CSS file for styling

export default function AddTaskView() {
    // State variables for form inputs and error handling
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); // Hook for navigating between views

    // Function to add a tag to the list, ensuring no duplicates
    const handleAddTag = () => {
        console.log('Adding tag:', tagInput);
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]); // Add new tag to the list
            console.log('Updated tags:', [...tags, tagInput.trim()]);
            setTagInput(''); // Clear the tag input field
        }
    };

    // Function to handle task submission
    const handleSubmit = async () => {
        console.log('Submitting task with data:', { title, description, tags, due_date: dueDate });

        // Ensure the task title is provided
        if (!title.trim()) {
            setError('Task title is required.');
            console.error('Validation Error: Task title is required');
            return;
        }
        setError(''); // Clear any previous error messages

        // Prepare task data for API submission
        const taskData = { title, description, tags, due_date: dueDate };

        try {
            // Make an API request to submit the task
            const response = await fetch('https://your-backend-url.com/api/task/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            
            console.log('API Response Status:', response.status);
            
            // Handle non-successful responses
            if (!response.ok) throw new Error('Failed to add task');
            
            alert('Task added successfully!'); // Notify the user of success
            console.log('Task added successfully!');
            
            // Clear the form after successful submission
            setTitle('');
            setDescription('');
            setTags([]);
            setDueDate('');
            
            // Navigate back to the previous page
            navigate(-1);
        } catch (error) {
            setError('Error adding task. Please try again.'); // Handle API errors
            console.error('Error adding task:', error.message);
        }
    };

    return (
        <div className="add-task-container">
            <h2>Add a Task</h2>
            {error && <p className="error-message">{error}</p>} {/* Display error message if any */}
            
            <label>Task Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            
            <label>Task Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            
            <label>Task Tags</label>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
            <button onClick={handleAddTag}>Add Tag</button>
            <p>Tags: {tags.join(', ')}</p> {/* Display added tags */}
            
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            
            <button style={{ fontWeight: "bold" }} onClick={handleSubmit}>Save Task</button>
        </div>
    );
}
