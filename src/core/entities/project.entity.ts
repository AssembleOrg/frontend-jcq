import type { Client } from "./client.entity";
import type { Structure } from "./structure-entity";
import type { Collaborator } from "./collaborators-entity";

export type ProjectStatus =
  | "BUDGET"
  | "ACTIVE"
  | "IN_PROCESS"
  | "FINISHED"
  | "DELETED";

export interface UsdPrice {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
}

export interface Project {
  id: string;
  amount: number;
  totalPaid: number;
  rest: number;
  status: ProjectStatus;
  usdPrice: UsdPrice | null;
  clientId: string;
  client: Client;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
  workers: number;
  structures?: ProjectStructure[];
  event: string;
  collaboratorId?: string; 
  collaborator?: Collaborator;
  collabWorkersCount?: number; 
  collabValuePerHour?: number; 
  collabDisplayName?: string; // El display que tenia en ese entoncess
  dateInit: string;
  dateEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  amount: number;
  clientId: string;
  locationAddress: string;
  locationLat?: number;
  locationLng?: number;
  workers: number;
  event: string;
  dateInit: string;
  dateEnd: string;
}

export interface UpdateProjectDto {
  amount?: number;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  workers?: number;
  event?: string;
  dateInit?: string;
  dateEnd?: string;
}

export interface UpdateProjectStatusDto {
  status: ProjectStatus;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: ProjectStatus;
  workersMin?: number;
  workersMax?: number;
  dateInitFrom?: string;
  dateInitTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface ProjectStructure {
    id: string;             
    quantity: number;       
    structureId: string;
    structure: Structure;   
}

export interface ProjectStructureDto {
    structureId: string;
    quantity: number;
}
