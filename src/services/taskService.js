import axios from 'axios';
import { toast } from 'react-toastify';
import entityService from './entityService';

const API_URL = '/api/tasks';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            errorMessage = error.response.data.message || 'Server error occurred';
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Invalid request. Please check your data.';
                    break;
                case 401:
                    errorMessage = 'Unauthorized. Please log in again.';
                    break;
                case 403:
                    errorMessage = 'You do not have permission to perform this action.';
                    break;
                case 404:
                    errorMessage = 'The requested resource was not found.';
                    break;
                case 409:
                    errorMessage = 'This operation caused a conflict.';
                    break;
                case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    break;
                default:
                    errorMessage = error.response.data.message || 'Server error occurred';
                    break;
            }
        } else if (error.request) {
            errorMessage = 'No response from server. Please check your connection.';
        }

        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

const taskService = {
    getTaskTemplates: async () => {
        try {
            const response = await axiosInstance.get('/templates');
            console.log('Templates response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    },

    createTasksFromTemplates: async (entityId, data) => {
        try {
            if (!data.selectedTasks || !Array.isArray(data.selectedTasks)) {
                throw new Error('Invalid selectedTasks format');
            }

            const manager = await entityService.getManagerForEntity(entityId);

            const formattedData = {
                managerId: manager.id,
                selectedTasks: data.selectedTasks.map(task => ({
                    taskTemplateId: Number(task.taskTemplateId),
                    dueDate: task.dueDate
                }))
            };

            console.log('Sending formatted payload:', JSON.stringify(formattedData, null, 2));

            const response = await axiosInstance.post(
                `/entity/${entityId}/create-from-templates`,
                formattedData
            );

            toast.success('Tasks created successfully from templates');
            return response.data;
        } catch (error) {
            console.error('Error creating tasks from templates:', error);
            throw error;
        }
    },

   getAllTasks: async () => {
       try {
           const response = await axiosInstance.get('');
           return response.data;
       } catch (error) {
           console.error('Error fetching all tasks:', error);
           throw error;
       }
      },
    getTaskById: async (taskId) => {
        try {
            const response = await axiosInstance.get(`/${taskId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            throw error;
        }
    },

    getTasksByEntity: async (entityId) => {
        try {
            const response = await axiosInstance.get(`/entity/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching tasks for entity ${entityId}:`, error);
            throw error;
        }
    },

    createTask: async (taskData) => {
    console.log("Sending task data:", taskData);
        try {
            const response = await axiosInstance.post('', taskData);
            toast.success('Task created successfully');
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    updateTask: async (taskId, taskData) => {
        try {
            // Create a proper task update object with all fields
            const updatePayload = {
                id: taskId,
                name: taskData.name,
                description: taskData.description,
                taskStatus: taskData.taskStatus,
                dueDate: taskData.dueDate,
                entityId: taskData.entityId,
                assignedManagerId: taskData.assignedManagerId,
                comment: taskData.comment
            };

            console.log('Sending update request with payload:', updatePayload);

            const response = await axiosInstance.put(`/${taskId}`, updatePayload);

            if (!response.data.comment && taskData.comment) {
                const commentUpdateResponse = await axiosInstance.put(`/${taskId}`, {
                    ...response.data,
                    comment: taskData.comment
                });
                return commentUpdateResponse.data;
            }

            return response.data;
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            toast.error('Failed to update task');
            throw error;
        }
    },

    deleteTask: async (taskId) => {
        try {
            await axiosInstance.delete(`/${taskId}`);
            toast.success('Task deleted successfully');
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            throw error;
        }
    },
    getTaskStatuses: async () => {
        try {
            const response = await axiosInstance.get('/statuses');
            return response.data;
        } catch (error) {
            console.error('Error fetching statuses:', error);
            throw error;
        }
    },

    updateTaskStatus: async (taskId, status) => {
        try {
            const response = await axiosInstance.patch(`/${taskId}/status`, { status });
            toast.success('Task status updated successfully');
            return response.data;
        } catch (error) {
            console.error(`Error updating status for task ${taskId}:`, error);
            throw error;
        }
    },

    getTaskStatistics: async () => {
        try {
            const response = await axiosInstance.get('/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching task statistics:', error);
            throw error;
        }
    },

    getOverdueTasks: async () => {
        try {
            const response = await axiosInstance.get('/overdue');
            return response.data;
        } catch (error) {
            console.error('Error fetching overdue tasks:', error);
            throw error;
        }
    },

    getTasksByStatus: async (status) => {
        try {
            const response = await axiosInstance.get(`/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks by status:', error);
            throw error;
        }
    },

    getTasksByDate: async (date) => {
        try {
            const response = await axiosInstance.get(`/due-date/${date}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks by date:', error);
            throw error;
        }
    },

    getTasksByDateRange: async (endDate) => {
        try {
            const startDate = new Date().toISOString().split('T')[0];
            const response = await axiosInstance.get('/date-range', {
                params: {
                    startDate: startDate,
                    endDate: endDate
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks by date range:', error);
            throw error;
        }
    },

    searchTasks: async (searchTerm) => {
        try {
            const response = await axiosInstance.get('/search', {
                params: { query: searchTerm }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching tasks:', error);
            throw error;
        }
    },
      getTasksBetweenDates: async (startDate, endDate) => {
        try {
          const response = await fetch(`/tasks/date-range?startDate=${startDate}&endDate=${endDate}`);
          if (!response.ok) throw new Error('Failed to fetch tasks');
          return await response.json();
        } catch (error) {
          throw error;
        }

    },

    getTasksByManager: async (managerId) => {
        try {
            const response = await axiosInstance.get(`/manager/${managerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks by manager:', error);
            throw error;
        }
    }
};

export default taskService;