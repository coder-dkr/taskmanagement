
import axios from "axios";


export const getClientsCount = async () => {
  try {
    const response = await axios.get("/api/clients/count");
    return response.data
  } catch (error) {
    console.error("Error fetching clients count:", error);
    return 0; 
  }
};

export const getEntitiesCount = async () => {
  try {
    const response = await axios.get("/api/entities/count");
    return response.data;
  } catch (error) {
    console.error("Error fetching entities count:", error);
    return 0; 
  }
};
