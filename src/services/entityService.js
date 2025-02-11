import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/entities';

const entityService = {
    // Get manager for entity
    getManagerForEntity: async (entityId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${entityId}/manager`);
            return response.data;
        } catch (error) {
            console.error('Error fetching manager for entity:', error);
            throw error;
        }
    },

    // Fetch all entities
    getAllEntities: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all entities:', error);
            throw error;
        }
    },

    // Fetch entities for a specific client
    getByClientId: async (clientId) => {
        try {
        const response = await axios.get(`${API_BASE_URL}/client/${clientId}/list`);
        console.log(`Response for client ${clientId}:`, response.data);

        return response.data;
        } catch (error) {
            console.error(`Error fetching entities for client ID ${clientId}:`, error);
            throw error;
        }
    },

    // Fetch a specific entity by ID
    getById: async (entityId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching entity with ID ${entityId}:`, error);
            throw error;
        }
    },

    // Create a new entity
    createEntity: async (entityData) => {
        try {
            const response = await axios.post(API_BASE_URL, entityData);
            return response.data;
        } catch (error) {
            console.error('Error creating entity:', error);
            throw error;
        }
    },

    // Update an existing entity
    updateEntity: async (entityId, entityData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${entityId}`, entityData);
            return response.data;
        } catch (error) {
            console.error(`Error updating entity with ID ${entityId}:`, error);
            throw error;
        }
    },

    // Delete an entity
    deleteEntity: async (entityId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${entityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting entity with ID ${entityId}:`, error);
            throw error;
        }
    }
};

export default entityService;