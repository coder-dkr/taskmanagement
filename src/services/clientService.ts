import axiosInstance from '@/lib/axios';

export const clientService = {
    getByFilters: async (page: number, searchText = '', sector = '') => {
        console.log('Making request with params:', { page, searchText, sector });
        try {
            const response = await axiosInstance.get('/api/clients/filter', {
                params: {
                    page: page.toString(),
                    searchText,
                    sector
                }
            });
            console.log('Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    getClientsWithEntities: async () => {
        const response = await axiosInstance.get('/api/clients/with-entities');
        return response.data;
    },

    getClientById: async (id: any) => {
        const response = await axiosInstance.get(`/api/clients/${id}`);
        return response.data;
    },

    getAllClients: async () => {
        const response = await axiosInstance.get('/api/clients');
        return response.data;
    },

    createClient: async (clientData: any) => {
        const response = await axiosInstance.post('/api/clients', clientData);
        return response.data;
    },

    updateClient: async (id: any, clientData: any) => {
        const response = await axiosInstance.put(`/api/clients/${id}`, clientData);
        return response.data;
    },

    deleteClient: async (id: any) => {
        await axiosInstance.delete(`/api/clients/${id}`);
    },

    getSectors: async () => {
        const response = await axiosInstance.get('/api/clients/sectors');
        return response.data;
    },
};