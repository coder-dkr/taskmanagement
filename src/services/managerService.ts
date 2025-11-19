const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/managers`;


const managerService = {
    getAllManagers: async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch managers');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching all managers:', error);
            throw error;
        }
    },

    createManager: async (managerData: any) => {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(managerData),
            });
            if (!response.ok) {
                throw new Error('Failed to create manager');
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating manager:', error);
            throw error;
        }
    },

    updateManager: async (id: any, managerData: any) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(managerData),
            });
            if (!response.ok) {
                throw new Error('Failed to update manager');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating manager:', error);
            throw error;
        }
    },

    deleteManager: async (id: any) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete manager');
            }
        } catch (error) {
            console.error('Error deleting manager:', error);
            throw error;
        }
    },

    getManagerById: async (id: any) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch manager by ID');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching manager by ID:', error);
            throw error;
        }
    },

    getManagersByFilter: async (page = 0, size = 10, sortBy = 'id', sortOrder = 'asc') => {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sort: `${sortBy},${sortOrder}`,
            });

            const url = `${BASE_URL}/filter?${queryParams}`;
            console.log('Requesting URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Error body:', errorBody);
                throw new Error(`Failed to fetch managers: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received filtered managers:', data);
            return data;
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
            const response = await fetch(`${BASE_URL}/roles`);
            if (!response.ok) {
                throw new Error('Failed to fetch distinct roles');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching distinct roles:', error);
            throw error;
        }
    },
};

export default managerService;
