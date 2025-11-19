import axiosInstance from '@/lib/axios';

const entityService = {
    // Get manager for entity
    getManagerForEntity: async (entityId : any) => {
        try {
            const response = await axiosInstance.get(`/entities/${entityId}/manager`);
            return response.data;
        } catch (error) {
            console.error('Error fetching manager for entity:', error);
            throw error;
        }
    },

    // Fetch all entities
    getAllEntities: async () => {
        try {
            const response = await axiosInstance.get('/entities');
            return response.data;
        } catch (error) {
            console.error('Error fetching all entities:', error);
            throw error;
        }
    },

    // Fetch entities for a specific client
    getByClientId: async (clientId: any)  => {
        try {
        const response = await axiosInstance.get(`/entities/client/${clientId}/list`);
        console.log(`Response for client ${clientId}:`, response.data);

        return response.data;
        } catch (error) {
            console.error(`Error fetching entities for client ID ${clientId}:`, error);
            throw error;
        }
    },

    // Fetch a specific entity by ID
    getById: async (entityId: any) => {
        try {
            const response = await axiosInstance.get(`/entities/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching entity with ID ${entityId}:`, error);
            throw error;
        }
    },

    // Create a new entity
    createEntity: async (entityData: any) => {
        try {
            const response = await axiosInstance.post('/entities', entityData);
            return response.data;
        } catch (error) {
            console.error('Error creating entity:', error);
            throw error;
        }
    },

    // Update an existing entity
    updateEntity: async (entityId: any, entityData: any) => {
        try {
            const response = await axiosInstance.put(`/entities/${entityId}`, entityData);
            return response.data;
        } catch (error) {
            console.error(`Error updating entity with ID ${entityId}:`, error);
            throw error;
        }
    },

    // Delete an entity
    deleteEntity: async (entityId: any) => {
        try {
            const response = await axiosInstance.delete(`/entities/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting entity with ID ${entityId}:`, error);
            throw error;
        }
    }
};

export default entityService;