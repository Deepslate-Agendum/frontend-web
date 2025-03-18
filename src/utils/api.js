import axios from "axios";

const API_BASE_URL = "/api";

//Api calls

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/create`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("User creation failed:", error.response?.data || error.message);
      throw error;
    }
  };

export const getTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/task/`);
    return response.data.tasks;
  } catch (error) {
    console.error("Failed to fetch tasks:", error.response?.data || error.message);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/task/create`, taskData);
    return response.data;
  } catch (error) {
    console.error("Failed to create task:", error.response?.data || error.message);
    throw error;
  }
};

export const updateTask = async (taskId, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/task/update/${taskId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Failed to update task:", error.response?.data || error.message);
      throw error;
    }
};

  
  

export const getWorkspaces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspace/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch workspaces:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/task/delete/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete task:", error.response?.data || error.message);
      throw error;
    }
};

export const createWorkspace = async (workspaceName, ownerId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/workspace/create`, {
        name: workspaceName,
        owner: ownerId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create workspace:", error.response?.data || error.message);
      throw error;
    }
  };

  export const deleteWorkspace = async (workspaceId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/workspace/delete/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete workspace:", error.response?.data || error.message);
      throw error;
    }
    };
  
  export const getDependentTasks = async (parentTaskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/task/dependent_tasks`, {
        params: { parentTaskId }
      });
      return response.data.dependent_tasks;
    } catch (error) {
      console.error("Failed to fetch dependent tasks:", error.response?.data || error.message);
      throw error;
    }
  };
  
  export const getSubtasks = async (parentTaskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/task/subtasks`, {
        params: { parentTaskId }
      });
      return response.data.subtasks;
    } catch (error) {
      console.error("Failed to fetch subtasks:", error.response?.data || error.message);
      throw error;
    }
  };
  
  export const getParentTask = async (subtaskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/task/parent_task/${subtaskId}`);
      return response.data.parent_task;
    } catch (error) {
      console.error("Failed to fetch parent task:", error.response?.data || error.message);
      throw error;
    }
  };
  