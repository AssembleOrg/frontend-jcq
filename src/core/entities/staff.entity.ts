export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  cuit?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  dni?: string;
  cuit?: string;
  category?: string;
}

export interface UpdateStaffDto extends Partial<CreateStaffDto> {}

export interface StaffFilters {
  page?: number;
  limit?: number;
  firstName?: string;
  dni?: string;
  cuit?: string;
}

export interface WorkRecord {
  id: string;
  staffId: string;
  date: string;
  hours: number;
  description?: string;
}

// Interfaz que espera el backend para POST
export interface CreateWorkRecordDto {
  staffId: string;
  valuePerHour: number;
  advance: number;
  hoursMonday: number;
  hoursTuesday: number;
  hoursWednesday: number;
  hoursThursday: number;
  hoursFriday: number;
  hoursSaturday: number;
  hoursSunday: number;
  startDate: string; 
}

// Interfaz que espera el backend para PATCH
export interface UpdateWorkRecordDto {
  hours?: number;
  description?: string;
  date?: string;
}