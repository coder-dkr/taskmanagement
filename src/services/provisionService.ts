import axios from 'axios';
import { toast } from '@/hooks/useToast';

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
        toast({
            title: "Error",
            description:errorMessage,
          });
        return Promise.reject(new Error(errorMessage));
    }
);

const provisionService = {
    getAllProvisionTasks: async () => {
        try {
            const response = await axiosInstance.get('/provision');
            return response.data;
        } catch (error) {
            console.error('Error fetching all provision tasks:', error);
            throw error;
        }
    },

    getProvisionTasksByEntity: async (entityId : any) => {
        try {
            const response = await axiosInstance.get(`/provision/entity/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching provision tasks for entity ${entityId}:`, error);
            throw error;
        }
    },

    getProvisionTasksByClient: async (clientId: any) => {
        try {
            const response = await axiosInstance.get(`/provision/client/${clientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching provision tasks for client ${clientId}:`, error);
            throw error;
        }
    },

    getProvisionTasksByManager: async (managerId: any) => {
        try {
            const response = await axiosInstance.get(`/provision/manager/${managerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by manager:', error);
            throw error;
        }
    },

    getProvisionTasksByStatus: async (status: any) => {
        try {
            const response = await axiosInstance.get(`/provision/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by status:', error);
            throw error;
        }
    },

    getProvisionTasksBetweenDates: async (startDate: any, endDate: any) => {
        try {
            const response = await axiosInstance.get('/provision/dates', {
                params: {
                    startDate,
                    endDate
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by date range:', error);
            throw error;
        }
    },

    hasProvisionTasks: async (entityId: any) => {
        try {
            const response = await axiosInstance.get(`/provision/check/${entityId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking provision tasks:', error);
            throw error;
        }
    },

    // Reuse the task update and delete methods from the original service
    updateTask: async (taskId: any, taskData: any) => {
        try {
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

            const response = await axiosInstance.put(`/provision/${taskId}`, updatePayload);

            if (!response.data.comment && taskData.comment) {
                const commentUpdateResponse = await axiosInstance.put(`/provision/${taskId}`, {
                    ...response.data,
                    comment: taskData.comment
                });
                return commentUpdateResponse.data;
            }

            return response.data;
        } catch (error) {
            console.error(`Error updating provision task ${taskId}:`, error);
            toast({
                title: "Error",
                description:'Failed to update provision task',
              });
            throw error;
        }
    },

    updateTaskStatus: async (taskId: any, status: any) => {
        try {
            const response = await axiosInstance.patch(`/provision/${taskId}/status`, { status });
            toast({
                title: "success",
                description:'Provision task status updated successfully',
              });
            return response.data;
        } catch (error) {
            console.error(`Error updating status for provision task ${taskId}:`, error);
            throw error;
        }
    }
};

export default provisionService;