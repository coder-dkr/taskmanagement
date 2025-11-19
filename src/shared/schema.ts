// src/shared/schema.ts

export interface Client {
  id: number;           // number not string
  name: string;
}

export interface Entity {
  id: number;
  clientId: number;
  name: string;
}

export interface Task {
  id: number;
  entityId: number;
  title: string;
  description?: string; // optional, fixes TaskRow.tsx
  status: "Pending" | "InProgress" | "Completed" | "done";
}
