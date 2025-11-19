import axiosInstance from '@/lib/axios';
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

const provisionService = {
  getAllProvisionTasks: async () => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>('/api/tasks/provision');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all provision tasks:', error);
      throw error;
    }
  },

  getProvisionTasksByEntity: async (entityId: string | number) => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>(`/api/tasks/provision/entity/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provision tasks for entity ${entityId}:`, error);
      throw error;
    }
  },

  getProvisionTasksByClient: async (clientId: string | number) => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>(`/api/tasks/provision/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provision tasks for client ${clientId}:`, error);
      throw error;
    }
  },

  getProvisionTasksByManager: async (managerId: string | number) => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>(`/api/tasks/provision/manager/${managerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provision tasks by manager:', error);
      throw error;
    }
  },

  getProvisionTasksByStatus: async (status: string) => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>(`/api/tasks/provision/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provision tasks by status:', error);
      throw error;
    }
  },

  getProvisionTasksBetweenDates: async (startDate: string, endDate: string) => {
    try {
      const response = await axiosInstance.get<ProvisionTask[]>('/api/tasks/provision/dates', {
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
      const response = await axiosInstance.get<boolean>(`/api/tasks/provision/check/${entityId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking provision tasks:', error);
      throw error;
    }
  },

  updateTask: async (taskId: string | number, taskData: Partial<ProvisionTask>) => {
    try {
      const response = await axiosInstance.put<ProvisionTask>(`/api/tasks/provision/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating provision task ${taskId}:`, error);
      throw error;
    }
  },

  deleteTask: async (id: any) => {
    try {
      await axiosInstance.delete(`/api/tasks/${id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string | number, status: string) => {
    try {
      const response = await axiosInstance.patch<ProvisionTask>(`/api/tasks/provision/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for provision task ${taskId}:`, error);
      throw error;
    }
  }
};

export default provisionService;
