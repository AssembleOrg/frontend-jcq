export interface Collaborator {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  cuit?: string;
  dni?: string;
  quantityWorkers: number;
  valuePerHour: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCollaboratorDto {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  cuit?: string;
  dni?: string;
  quantityWorkers: number;
  valuePerHour: number;
  notes?: string;
}

export interface UpdateCollaboratorDto extends Partial<CreateCollaboratorDto> {}

export interface CollaboratorFilters {
  page?: number;
  limit?: number;
  lastName?: string;
  companyName?: string;
  cuit?: string;
  dni?: string;
}

export interface CollaboratorSelect {
  id: string;
  displayName: string;
}