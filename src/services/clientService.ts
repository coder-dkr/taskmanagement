
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/clients`;

console.log('🔍 Full API_BASE_URL:', BASE_URL);



export const clientService = {
    getByFilters: async (page: number, searchText = '', sector = '') => {
        console.log('Making request with params:', { page, searchText, sector });
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                searchText,
                sector
            });
            
            const url = `${BASE_URL}/filter?${queryParams}`;
            console.log('🌐 Request URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            const data = await response.json();
            console.log('Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    getClientsWithEntities: async () => {
        const response = await fetch(`${BASE_URL}/with-entities`);
        if (!response.ok) throw new Error('Failed to fetch clients with entities');
        return await response.json();
    },

    getClientById: async (id: any) => {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch client by ID');
        return await response.json();
    },

    getAllClients: async () => {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch all clients');
        return await response.json();
    },

    createClient: async (clientData: any) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });
        if (!response.ok) throw new Error('Failed to create client');
        return await response.json();
    },

    updateClient: async (id: any, clientData: any) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });
        if (!response.ok) throw new Error('Failed to update client');
        return await response.json();
    },

    deleteClient: async (id: any) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete client');
    },

    getSectors: async () => {
        const response = await fetch(`${BASE_URL}/sectors`);
        if (!response.ok) throw new Error('Failed to fetch sectors');
        return await response.json();
    },
};