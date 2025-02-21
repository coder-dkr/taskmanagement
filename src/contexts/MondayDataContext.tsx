
import React, { createContext, useState, useEffect, ReactNode } from "react";
import {clientService} from "@/services/clientService";
import managerService from "@/services/managerService";
import entityService from "@/services/entityService";
import { toast } from "@/hooks/useToast"; 

export const MondayDataContext = createContext<any>(
    undefined
);

interface MondayDataProviderProps {
  children: ReactNode;
}

export const MondayDataProvider: React.FC<MondayDataProviderProps> = ({ children }) => {
  const [clientsPreload, setClients] = useState<any[]>([]);
  const [managersPreload, setManagers] = useState<any[]>([]);
  const [entitiesMapPreload, setEntitiesMap] = useState<any>({});
  const [expandedClientsPreload, setExpandedClients] = useState<any>({});
  const [expandedEntitiesPreload, setExpandedEntities] = useState({});
  const [tasksMapPreload, setTasksMap] = useState({});
  const [makeCall , setmakeCall] = useState(false)

  const loadInitialData = async () => {
    try {
      
      const [clientsData, managersData] = await Promise.all([
        clientService.getAllClients(),
        managerService.getAllManagers(),
      ]);

      const newEntitiesMap: any = {};
      await Promise.all(
        (clientsData || []).map(async (client : any) => {
          try {
            const entities = await entityService.getByClientId(client.id);
            if (entities?.length > 0) {
              newEntitiesMap[client.id] = entities;
            }
          } catch (entityError) {
            console.error(`Error loading entities for client ${client.id}:`, entityError);
            newEntitiesMap[client.id] = [];
          }
        })
      );

      setClients(clientsData || []);
      setManagers(managersData || []);
      setEntitiesMap(newEntitiesMap);
      setExpandedClients({});
      setExpandedEntities({});
      setTasksMap({});
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
      });
    } 
    setmakeCall(false)
  };

  useEffect(() => {
    loadInitialData(); 
    if(makeCall){
        loadInitialData()
    }
  }, [makeCall]);

  return (
    <MondayDataContext.Provider
      value={{
        clientsPreload,
        managersPreload,
        entitiesMapPreload,
        expandedClientsPreload,
        expandedEntitiesPreload,
        tasksMapPreload,
        setmakeCall
      }}
    >
      {children}
    </MondayDataContext.Provider>
  );
};
