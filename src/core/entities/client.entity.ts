export interface Client {
  id: string;
  fullname: string;
  phone: string;
  cuit: string | null;
  dni: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  fullname: string;
  phone: string;
  cuit?: string;
  dni?: string;
}

export interface UpdateClientDto {
  fullname?: string;
  phone?: string;
  cuit?: string;
  dni?: string;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  fullname?: string;
  phone?: string;
  cuit?: string;
  dni?: string;
}
