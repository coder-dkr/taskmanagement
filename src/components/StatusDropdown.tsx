import React, { useState, useEffect } from 'react';
import taskService from '@/services/taskService';
import { Loader } from 'lucide-react';

interface StatusDropdownProps {
  currentStatus: any;
  onStatusChange: (value : any) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const fetchedStatuses = await taskService.getTaskStatuses();
        setStatuses(Array.isArray(fetchedStatuses) ? fetchedStatuses : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        setError('Failed to load statuses');
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const getStatusStyle = (status: string) => {
    const baseStyle = {
      fontWeight: '500',
      backgroundColor: 'transparent',
    };

    switch (status) {
      case 'PENDING':
        return { ...baseStyle, color: '#ff9800' };
      case 'IN_PROGRESS':
        return { ...baseStyle, color: '#0073ea' };
      case 'COMPLETED':
        return { ...baseStyle, color: '#00c875' };
      case 'OVERDUE':
        return { ...baseStyle, color: '#e44258' };
      default:
        return { ...baseStyle, color: '#323338' };
    }
  };

  if (loading) {
    return <Loader className="animate-spin" size={16} />;
  }

  if (error) {
    return <div style={{ color: '#e44258', fontSize: '12px' }}>{error}</div>;
  }

  return (
        <select
          value={currentStatus ?? ''}
          onChange={(e) => onStatusChange(e.target.value)}
          style={getStatusStyle(currentStatus)}
          className="status-select"
        >
          {statuses.map((status) => (
            <option key={status} value={status} style={getStatusStyle(status)}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

  );
};

export default StatusDropdown;
