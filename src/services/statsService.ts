import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getClientsCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/clients/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching clients count:", error);
    return 0;
  }
};

export const getEntitiesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/entities/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching entities count:", error);
    return 0;
  }
};

export const getTasksCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks count:", error);
    return 0;
  }
};
