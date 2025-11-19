import { useState, useEffect } from 'react';
import taskService from '../services/taskService';

export const useTaskStatuses = () => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusData = await taskService.getTaskStatuses();
        setStatuses(statusData);
      } catch (err) {
        console.error('Error fetching statuses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const formatStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return { statuses, loading, formatStatusLabel };
};