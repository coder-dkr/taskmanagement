import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const exportClientsList = async (): Promise<void> => {
  try {
    const response = await axios.get(`${API_URL}/clients/export`, {
      responseType: "blob"
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients_list.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting client list:", error);
    alert("Failed to export clients list");
  }
};
