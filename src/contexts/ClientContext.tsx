import { createContext, useContext, ReactNode, useState } from 'react';
import type { Client } from '@/shared/schema';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: number, updates: Partial<Client>) => void;
  deleteClient: (id: number) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Sample data
const initialClients: Client[] = [
  {
    id: 1,
    name: "Acme Corporation",
  },
  {
    id: 2,
    name: "TechStart Solutions",
  },
  {
    id: 3,
    name: "Global Innovations Inc",
  },
  {
    id: 4,
    name: "Digital Ventures Ltd",
  },
  {
    id: 5,
    name: "Future Systems",
  },
];

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const updateClient = (id: number, updates: Partial<Client>) => {
    setClients(prev => 
      prev.map(client => client.id === id ? { ...client, ...updates } : client)
    );
  };

  const deleteClient = (id: number) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  return (
    <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
