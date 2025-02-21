import axios from 'axios';
import { toast } from '@/hooks/useToast';

interface ProvisionTask {
    id: number;
    name: string;
    description: string;
    taskStatus: string;
    dueDate: string;
    entityId: number;
    assignedManagerId: number;
    assignedManagerFirstName?: string;
    assignedManagerLastName?: string;
    comment?: string;
    isProvision: boolean;
}

const API_URL = '/api/tasks/provision';

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
            }
        } else if (error.request) {
            errorMessage = 'No response from server. Please check your connection.';
        }
        toast({
            title: "Error",
            description: errorMessage,
        });
        return Promise.reject(new Error(errorMessage));
    }
);

const provisionService = {
    getAllProvisionTasks: async () => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>('/provision');
            return response.data;
        } catch (error) {
            console.error('Error fetching all provision tasks:', error);
            throw error;
        }
    },

    getProvisionTasksByEntity: async (entityId: string | number) => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>(`/provision/entity/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching provision tasks for entity ${entityId}:`, error);
            throw error;
        }
    },

    getProvisionTasksByClient: async (clientId: string | number) => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>(`/provision/client/${clientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching provision tasks for client ${clientId}:`, error);
            throw error;
        }
    },

    getProvisionTasksByManager: async (managerId: string | number) => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>(`/provision/manager/${managerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by manager:', error);
            throw error;
        }
    },

    getProvisionTasksByStatus: async (status: string) => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>(`/provision/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by status:', error);
            throw error;
        }
    },

    getProvisionTasksBetweenDates: async (startDate: string, endDate: string) => {
        try {
            const response = await axiosInstance.get<ProvisionTask[]>('/provision/dates', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching provision tasks by date range:', error);
            throw error;
        }
    },

    hasProvisionTasks: async (entityId: string | number) => {
        try {
            const response = await axiosInstance.get<boolean>(`/provision/check/${entityId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking provision tasks:', error);
            throw error;
        }
    },

    updateTask: async (taskId: string | number, taskData: Partial<ProvisionTask>) => {
        try {
            const response = await axiosInstance.put<ProvisionTask>(`/provision/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            console.error(`Error updating provision task ${taskId}:`, error);
            throw error;
        }
    },

    updateTaskStatus: async (taskId: string | number, status: string) => {
        try {
            const response = await axiosInstance.patch<ProvisionTask>(`/provision/${taskId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating status for provision task ${taskId}:`, error);
            throw error;
        }
    }
};

export default provisionService;