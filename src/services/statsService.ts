import axiosInstance from '@/lib/axios';

export const getClientsCount = async () => {
  try {
    const response = await axiosInstance.get('/clients/count');
    return response.data;
  } catch (error) {
    console.error("Error fetching clients count:", error);
    return 0;
  }
};

export const getEntitiesCount = async () => {
  try {
    const response = await axiosInstance.get('/entities/count');
    return response.data;
  } catch (error) {
    console.error("Error fetching entities count:", error);
    return 0;
  }
};

export const getTasksCount = async () => {
  try {
    const response = await axiosInstance.get('/tasks/count');
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks count:", error);
    return 0;
  }
};
