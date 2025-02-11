import axios from 'axios';

const API_URL = '/api/clients';

export const clientService = {
    getByFilters: async (page, searchText = '') => {
        try {
            const response = await axios.get(`${API_URL}/filter`, {
                params: { page, searchText },
            });
            return {
                clients: response.data.clients,
                totalPages: response.data.totalPages,
            };
        } catch (error) {
            console.error('Error fetching clients with filters:', error);
            throw error;
        }
    },

    // Get all clients with their associated entities
    getClientsWithEntities: async () => {
        try {
            const response = await axios.get(`${API_URL}/with-entities`);
            return response.data;
        } catch (error) {
            console.error('Error fetching clients with entities:', error);
            throw error;
        }
    },

    // Get client by ID
    getClientById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching client with ID ${id}:`, error);
            throw error;
        }
    },

    // Get all clients
    getAllClients: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all clients:', error);
            throw error;
        }
    },

    // Create a new client
    createClient: async (clientData) => {
        try {
            const response = await axios.post(API_URL, clientData, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Update an existing client by ID
    updateClient: async (id, clientData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, clientData, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating client with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a client by ID
    deleteClient: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting client with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Failed to delete client.';
            throw new Error(errorMessage);
        }
    },

    // Get the list of sectors
    getSectors: async () => {
        try {
            const response = await axios.get(`${API_URL}/sectors`);
            return response.data; // Expecting an array of sector strings from the backend
        } catch (error) {
            console.error('Error fetching sectors:', error);
            throw error;
        }
    },
};
