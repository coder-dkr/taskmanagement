import axiosInstance from '@/lib/axios';
import { toast } from '@/hooks/useToast'
import entityService from './entityService';

// Define interfaces for type safety
interface CreateTasksFromTemplatesRequest {
  selectedTasks: Array<{
    taskTemplateId: number;
    managerId: number;
    dueDate: string;
  }>;
}

const taskService = {
  getTaskTemplates: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/templates');
      console.log('Templates response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  createTasksFromTemplates: async (entityId: number, data: CreateTasksFromTemplatesRequest) => {
    try {
      console.log('Service creating tasks for entity:', entityId);
      console.log('Service data:', data);

      const response = await axiosInstance.post(
        `/api/tasks/entity/${entityId}/create-from-templates`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Service error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Internal server error. Please try again later.');
    }
  },

  getAllTasks: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  },

  getActiveTasks: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks');
      const allTasks = response.data;

      // Filter out completed tasks from the main view
      const activeTasks = allTasks.filter((task: any) =>
        task.taskStatus !== 'COMPLETED'
      );

      return activeTasks;
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      throw error;
    }
  },

  getCompletedTasks: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/status/COMPLETED');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      throw error;
    }
  },

  getTaskById: async (taskId: any) => {
    try {
      const response = await axiosInstance.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  getTasksByEntity: async (entityId: any) => {
    try {
      const response = await axiosInstance.get(`/api/tasks/entity/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for entity ${entityId}:`, error);
      throw error;
    }
  },

  createTask: async (taskData: any) => {
    console.log("Sending task data:", taskData);
    try {
      const response = await axiosInstance.post('/api/tasks', taskData);
      toast({
        title: "success",
        description: 'Task created successfully',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

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

      console.log('Sending update request with payload:', updatePayload);

      const response = await axiosInstance.put(`/api/tasks/${taskId}`, updatePayload);

      if (!response.data.comment && taskData.comment) {
        const commentUpdateResponse = await axiosInstance.put(`/api/tasks/${taskId}`, {
          ...response.data,
          comment: taskData.comment
        });
        return commentUpdateResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      toast({
        title: "Error",
        description: 'Failed to update task',
      });
      throw error;
    }
  },

  deleteTask: async (taskId: any) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`);
      toast({
        title: "success",
        description: 'Task deleted successfully',
      });
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },

  getTaskStatuses: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/statuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      throw error;
    }
  },

  updateTaskStatus: async (taskId: any, status: any) => {
    try {
      console.log(`[STATUS UPDATE] Attempting to update task ${taskId} to status: ${status}`);

      const currentTask = await taskService.getTaskById(taskId);
      console.log(`[STATUS UPDATE] Current task state:`, currentTask);

      const updatePayload = {
        ...currentTask,
        taskStatus: status
      };
      console.log(`[STATUS UPDATE] Sending payload:`, updatePayload);

      const response = await axiosInstance.put(`/api/tasks/${taskId}`, updatePayload);
      console.log(`[STATUS UPDATE] Server response:`, response.data);

      setTimeout(async () => {
        const updatedTask = await taskService.getTaskById(taskId);
        console.log(`[STATUS UPDATE] Verification fetch result:`, updatedTask);
        if (updatedTask.taskStatus !== status) {
          console.error(`[STATUS UPDATE] Verification failed! Status still shows as: ${updatedTask.taskStatus}`);
        }
      }, 1000);

      toast({
        title: "success",
        description: 'Task status updated successfully',
      });
      return response.data;
    } catch (error) {
      console.error(`[STATUS UPDATE] Error updating status for task ${taskId}:`, error);
      throw error;
    }
  },

  getTaskStatistics: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
  },

  getOverdueTasks: async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      throw error;
    }
  },

  getTasksByStatus: async (status: any) => {
    try {
      const response = await axiosInstance.get(`/api/tasks/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  },

  getTasksByDate: async (date: any) => {
    try {
      const response = await axiosInstance.get(`/api/tasks/due-date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      throw error;
    }
  },

  getTasksByDateRange: async (endDate: any) => {
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const response = await axiosInstance.get('/api/tasks/date-range', {
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

  searchTasks: async (searchTerm: any) => {
    try {
      const response = await axiosInstance.get('/api/tasks/search', {
        params: { query: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  },

  getTasksBetweenDates: async (startDate: any, endDate: any) => {
    try {
      const response = await axiosInstance.get('/api/tasks/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks between dates:', error);
      throw error;
    }
  },

  getTasksByManager: async (managerId: any) => {
    try {
      const response = await axiosInstance.get(`/api/tasks/manager/${managerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by manager:', error);
      throw error;
    }
  }
};

export default taskService;
