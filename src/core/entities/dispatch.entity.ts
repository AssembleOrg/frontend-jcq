import type { Client } from "./client.entity";
import type { ProjectStructure, Project } from "./project.entity";

export interface DispatchItem {
    id: string;
    quantity: number;
    projectItem: ProjectStructure;
    createdAt: string;
    updatedAt: string;
}

export interface Dispatch {
    id: string;
    projectId: string;
    project: Project;
    firstName: string;
    lastName: string;
    cuit: string;
    licensePlate: string;
    notes?: string;
    items: DispatchItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateDispatchItemDto {
    quantity: number;
    projectItemId: string;
}

export interface CreateDispatchDto {
    projectId: string;
    firstName: string;
    lastName: string;
    cuit: string;
    licensePlate: string;
    notes?: string;
    items: CreateDispatchItemDto[];
}

export interface UpdateDispatchDto {
    firstName?: string;
    lastName?: string;
    cuit?: string;
    licensePlate?: string;
    notes?: string;
    items?: CreateDispatchItemDto[];
}

export interface DispatchFilters {
    page?: number;
    limit?: number;
    projectId?: string;
    dateInit?: string;
    dateEnd?: string;
    driverCuit?: string;
    licensePlate?: string;
    clientName?: string;
}
