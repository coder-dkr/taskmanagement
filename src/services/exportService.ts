import axiosInstance from '@/lib/axios';

export const exportClientsList = async (): Promise<void> => {
  try {
    const response = await axiosInstance.get('/clients/export', {
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
