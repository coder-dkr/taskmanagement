import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { TaskRow } from "./TaskRow";
import type { Client, Entity, Task } from "../shared/schema";



export function HierarchicalView() {
  const [expandedClients, setExpandedClients] = useState<number[]>([]);
  const [expandedEntities, setExpandedEntities] = useState<number[]>([]);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  const toggleClient = (clientId: number) => {
    setExpandedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleEntity = (entityId: number) => {
    setExpandedEntities(prev =>
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        {clients.map(client => (
          <div key={client.id} className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => toggleClient(client.id)}
            >
              {expandedClients.includes(client.id) ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {client.name}
            </Button>

            {expandedClients.includes(client.id) && (
              <EntityList
                clientId={client.id}
                expandedEntities={expandedEntities}
                onToggleEntity={toggleEntity}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EntityList({ 
  clientId, 
  expandedEntities, 
  onToggleEntity 
}: { 
  clientId: number;
  expandedEntities: number[];
  onToggleEntity: (entityId: number) => void;
}) {
  const { data: entities = [] } = useQuery<Entity[]>({
    queryKey: ['/api/clients', clientId, 'entities']
  });

  return (
    <div className="ml-6 space-y-2">
      {entities.map(entity => (
        <div key={entity.id} className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onToggleEntity(entity.id)}
          >
            {expandedEntities.includes(entity.id) ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            {entity.name}
          </Button>

          {expandedEntities.includes(entity.id) && (
            <TaskList entityId={entity.id} />
          )}
        </div>
      ))}
    </div>
  );
}

function TaskList({ entityId }: { entityId: number }) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/entities', entityId, 'tasks']
  });

  return (
    <div className="ml-6 space-y-2">
      {tasks.map(task => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}
