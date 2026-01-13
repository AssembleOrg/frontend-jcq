import { Client } from "./client.entity";
import { Structure } from "./structure-entity"; 

export interface BudgetItem {
  id: string;
  quantity: number;
  manualName?: string;
  structureId?: string;
  structure?: Structure;
}

export interface BudgetDescriptionItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  unit?: string;
}

export interface Budget {
  id: string;
  date: string; 
  
  clientId?: string;
  client?: Client;
  
  manualClientName?: string;
  manualClientCuit?: string;
  
  netAmount: number;    // Neto (decidido por usuario)
  totalAmount: number;  // Bruto (calculado)
  
  hasIva: boolean;
  ivaPercentage: number;
  ivaValue: number;
  
  hasIibb: boolean;
  iibbPercentage: number;
  iibbValue: number;

  hasUSD: boolean;
  usdValue?: number;
  totalAmountUSD?: number;
  
  items: BudgetItem[];
  descriptionItems?: BudgetDescriptionItem[];
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateBudgetItemDto {
  quantity: number;
  structureId?: string; // Opcional si es manual
  manualName?: string;  // Opcional si es estructura
}

export interface CreateBudgetDescriptionItemDto {
  title: string;
  quantity?: number;
  price: number;
  unit?: string;
}

export interface CreateBudgetDto {
  date: string;
  clientId?: string;
  manualClientName?: string;
  manualClientCuit?: string;
  
  hasIva: boolean;
  ivaPercentage: number;
  hasIibb: boolean;
  iibbPercentage: number;

  hasUSD: boolean;
  usdValue?: number;
  
  netAmount: number;
  
  items: CreateBudgetItemDto[];
  descriptionItems?: CreateBudgetDescriptionItemDto[];
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {}

export interface BudgetFilters {
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}