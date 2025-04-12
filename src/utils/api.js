// This file contains utility functions for making API calls to the backend server.
// It uses Axios to handle HTTP requests and provides methods for user authentication,
// task management, and workspace management. Each function handles a specific API endpoint
// and includes error handling to log and throw errors when requests fail.

import axios from "axios";

// Base URL for all API requests
const API_BASE_URL = "/api";

const DependencyManner = {
  blocking: "Blocking",
  subtask: "Subtask",
}

// Function to log in a user
export const loginUser = async (username, password) => {
  try {
    // Sends a POST request to the login endpoint with username and password
    const response = await axios.post(`${API_BASE_URL}/user/login`, { username, password });
    return response.data; // Returns the response data on success
  } catch (error) {
    // Logs and throws a meaningful error message
    const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
    console.error("Login failed:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Function to create a new user
export const createUser = async (username, password) => {
  try {
    // Sends a POST request to the user creation endpoint with username and password
    const response = await axios.post(`${API_BASE_URL}/user/create`, {
      username,
      password,
    });
    return response.data; // Returns the response data on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("User creation failed:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch tasks for a specific workspace
export const getTasks = async (workspaceId) => {
  try {
    // Sends a GET request to fetch tasks, passing workspaceId as a parameter
    const response = await axios.get(`${API_BASE_URL}/task/`, {
      params: {
        workspace_id: workspaceId
      }
    });
    return response.data.tasks; // Returns the list of tasks on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to fetch tasks:", error.response?.data || error.message);
    throw error;
  }
};

// Function to create a new task
export const createTask = async (taskData) => {
  try {
    // Sends a POST request to the task creation endpoint with task data
    const response = await axios.post(`${API_BASE_URL}/task/create`, taskData);
    return response.data; // Returns the response data on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to create task:", error.response?.data || error.message);
    throw error;
  }
};

// Function to update an existing task
export const updateTask = async (updatedData) => {
  try {
    // Sends a PUT request to the task update endpoint with updated task data
    const response = await axios.put(`${API_BASE_URL}/task/update`, updatedData);
    return response.data; // Returns the response data on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to update task:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch all workspaces
export const getWorkspaces = async () => {
  try {
    // Sends a GET request to fetch all workspaces
    const response = await axios.get(`${API_BASE_URL}/workspace/`);
    return response.data; // Returns the list of workspaces on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to fetch workspaces:", error.response?.data || error.message);
    throw error;
  }
};

// Function to delete a task
export const deleteTask = async (taskId) => {
  try {
    // Sends a DELETE request to the task deletion endpoint with task ID
    const response = await axios.delete(`${API_BASE_URL}/task/delete`, {
      data: {
        id: taskId
      }
    });
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to delete task:", error.response?.data || error.message);
    throw error;
  }
};

// Function to create a new workspace
export const createWorkspace = async (workspaceName, ownerId) => {
  try {
    // Sends a POST request to the workspace creation endpoint with workspace name and owner ID
    const response = await axios.post(`${API_BASE_URL}/workspace/create`, {
      name: workspaceName,
      owner: ownerId,
    });
    return response.data; // Returns the response data on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to create workspace:", error.response?.data || error.message);
    throw error;
  }
};

// Function to delete a workspace
export const deleteWorkspace = async (workspaceId) => {
  try {
    // Sends a DELETE request to the workspace deletion endpoint with workspace ID
    const response = await axios.delete(`${API_BASE_URL}/workspace/delete`, {
      data: {
        id: workspaceId
      }
    });
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to delete workspace:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch dependent tasks for a parent task
export const getDependentTasks = async (parentTaskId) => {
  try {
    // Sends a GET request to fetch dependent tasks, passing parentTaskId as a parameter
    const response = await axios.get(`${API_BASE_URL}/task/dependent_tasks`, {
      params: { parentTaskId }
    });
    return response.data.dependent_tasks; // Returns the list of dependent tasks on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to fetch dependent tasks:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch subtasks for a parent task
export const getSubtasks = async (parentTaskId) => {
  try {
    // Sends a GET request to fetch subtasks, passing parentTaskId as a parameter
    const response = await axios.get(`${API_BASE_URL}/task/subtasks`, {
      params: { parentTaskId }
    });
    return response.data.subtasks; // Returns the list of subtasks on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to fetch subtasks:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch the parent task for a subtask
export const getParentTask = async (subtaskId) => {
  try {
    // Sends a GET request to fetch the parent task, passing subtaskId as a parameter
    const response = await axios.get(`${API_BASE_URL}/task/parent_task/${subtaskId}`);
    return response.data.parent_task; // Returns the parent task on success
  } catch (error) {
    // Logs and rethrows the error if the request fails
    console.error("Failed to fetch parent task:", error.response?.data || error.message);
    throw error;
  }
};

export const createDependency = async (workspaceId, dependentId, dependeeId, manner) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/workspace/${workspaceId}/dependency`, {
      dependee_id: dependeeId,
      dependent_id: dependentId,
      manner: manner,
    });

    return response.data.result;
  }
  catch (error) {
    console.error(`createDependency(${workspaceId, dependentId, dependeeId, manner}) failed with the following response:\n${error.response?.data}`)
    throw error;
  }
}

export const getDependency = async (workspaceId, dependencyId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspace/${workspaceId}/dependency/${dependencyId}`);
    return response.data.result;
  }
  catch (error) {
    console.error(`getDependency(${workspaceId, dependencyId}) failed with the following response:\n${error.response?.data}`)
    throw error;
  }
}

export const deleteDependency = async (workspaceId, dependencyId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/workspace/${workspaceId}/dependency/${dependencyId}`);
    return response.data.result;
  }
  catch (error) {
    console.error(`deleteDependency(${workspaceId, dependencyId}) failed with the following response:\n${error.response?.data}`)
    throw error;
  }
}
