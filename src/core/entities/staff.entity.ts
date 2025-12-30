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

// Interfaz que espera el backend para POST
export interface CreateWorkRecordDto {
  staffId: string;
  advance: number;
  hoursMonday: number;
  hoursTuesday: number;
  hoursWednesday: number;
  hoursThursday: number;
  hoursFriday: number;
  hoursSaturday: number;
  hoursSunday: number;
  hoursMondayExtra: number;
  hoursTuesdayExtra: number;
  hoursWednesdayExtra: number;
  hoursThursdayExtra: number;
  hoursFridayExtra: number;
  hoursSaturdayExtra: number; 
  hoursSundayExtra: number;
  hoursLastWeek: number;
  startDate: string; 
}

// Interfaz que espera el backend para PATCH
export interface UpdateWorkRecordDto {
  hours?: number;
  description?: string;
  date?: string;
}