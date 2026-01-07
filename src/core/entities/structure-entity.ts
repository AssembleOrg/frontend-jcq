export interface StructureCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Structure {
  id: string;
  name: string;
  categoryId: string;
  category: StructureCategory;
  stock: number;
  measure?: string;
  description?: string;
  available: number; 
  inUse: number;      
  createdAt: string;
  updatedAt: string;
}

export interface CreateStructureDto {
  name: string;
  categoryId: string;
  measure?: string;
  description?: string;
  stock: number;
}

export interface UpdateStructureDto extends Partial<CreateStructureDto> {}

export interface StructureFilters {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
}

export interface CreateStructureCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateStructureCategoryDto extends Partial<CreateStructureCategoryDto> {}

export interface StructureCategoryFilters {
  name?: string;
}