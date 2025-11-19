import axiosInstance from '@/lib/axios';

const managerService = {
    getAllManagers: async () => {
        try {
            const response = await axiosInstance.get('/api/managers');
            return response.data;
        } catch (error) {
            console.error('Error fetching all managers:', error);
            throw error;
        }
    },

    createManager: async (managerData: any) => {
        try {
            const response = await axiosInstance.post('/api/managers', managerData);
            return response.data;
        } catch (error) {
            console.error('Error creating manager:', error);
            throw error;
        }
    },

    updateManager: async (id: any, managerData: any) => {
        try {
            const response = await axiosInstance.put(`/api/managers/${id}`, managerData);
            return response.data;
        } catch (error) {
            console.error('Error updating manager:', error);
            throw error;
        }
    },

    deleteManager: async (id: any) => {
        try {
            await axiosInstance.delete(`/api/managers/${id}`);
        } catch (error) {
            console.error('Error deleting manager:', error);
            throw error;
        }
    },

    getManagerById: async (id: any) => {
        try {
            const response = await axiosInstance.get(`/api/managers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching manager by ID:', error);
            throw error;
        }
    },

    getManagersByFilter: async (page = 0, size = 10, sortBy = 'id', sortOrder = 'asc') => {
        try {
            const response = await axiosInstance.get('/api/managers/filter', {
                params: {
                    page: page.toString(),
                    size: size.toString(),
                    sort: `${sortBy},${sortOrder}`,
                }
            });
            console.log('Received filtered managers:', response.data);
            return response.data;
        } catch (error) {
            if ((error as any)?.name === 'TypeError' && (error as any)?.message.includes('Failed to fetch')) {
                console.error('Network error - Is the server running?');
                throw new Error('Unable to connect to the server. Please check if it is running.');
            }
            console.error('Error fetching filtered managers:', error);
            throw error;
        }
    },

    getDistinctRoles: async () => {
        try {
            const response = await axiosInstance.get('/api/managers/roles');
            return response.data;
        } catch (error) {
            console.error('Error fetching distinct roles:', error);
            throw error;
        }
    },
};

export default managerService;
