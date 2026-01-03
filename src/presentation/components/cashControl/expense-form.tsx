"use client";

import { useState, useEffect } from "react";
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "@/src/core/entities";
import { useCashControlStore } from "@/src/presentation/stores/cash-control.store";
import { useStaffStore } from "@/src/presentation/stores/staff.store"; // Store de personal
import { staffApi } from "@/src/infrastructure/api/staff.api"; // API directa para planillas

import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  NumberInput,
  Select,
  Text,
  Loader
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { format } from 'date-fns';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

interface ExpenseFormData {
  description: string;
  amount: string | number;
  categoryId: string;
  date: Date | null;
  workRecordId: string | null;
}

export function ExpenseForm({ isOpen, onClose, expense }: ExpenseFormProps) {
  const { 
    createExpense, 
    updateExpense, 
    categoriesList, 
    fetchCategories, 
    isLoading 
  } = useCashControlStore();

  const { staffList, fetchStaff } = useStaffStore();

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [workRecordsList, setWorkRecordsList] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    categoryId: "",
    date: new Date(),
    workRecordId: null,
  });

  // Detectar categoría de sueldos
  const isWagesCategory = !!categoriesList.find(c => c.id === formData.categoryId)
    ?.name.toLowerCase().match(/horas|sueldo|pago de horas|personal/);

  useEffect(() => {
    if (isOpen) {
        if(categoriesList.length === 0) fetchCategories();
        fetchStaff(); // Cargar empleados al abrir
    }
  }, [isOpen]);

  // Efecto para cargar planillas cuando se elige empleado
  useEffect(() => {
    if (selectedStaffId && isWagesCategory) {
        setLoadingRecords(true);
        staffApi.getWorkRecords(selectedStaffId)
           .then((data) => setWorkRecordsList(data))
           .catch(console.error)
           .finally(() => setLoadingRecords(false));
    } else {
        // Solo limpiamos si hay datos para evitar re-renders
        setWorkRecordsList(prev => prev.length > 0 ? [] : prev);
    }
  }, [selectedStaffId, isWagesCategory]);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.categoryId,
        // Convertir el string ISO a Date para evitar errores en el componente
        date: expense.date ? new Date(expense.date) : new Date(),
        // @ts-ignore: Ignoramos si el tipo Expense aún no tiene workRecordId en el frontend
        workRecordId: expense.workRecordId || null,
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date(),
        workRecordId: null,
      });
      setSelectedStaffId(null);
    }
  }, [expense, isOpen]);

  // Autocompletar datos al seleccionar planilla
  const handleWorkRecordSelect = (recordId: string) => {
    const record = workRecordsList.find(r => r.id === recordId);
    const staff = staffList.find(s => s.id === selectedStaffId); // Buscamos al empleado seleccionado

    if (record) {
        //info extra a agregar a descripcion
        let staffInfo = "";
        if (staff) {
            // Prioridad DNI, si no tiene usa CUIT
            const doc = staff.dni ? `DNI: ${staff.dni}` : (staff.cuit ? `CUIT: ${staff.cuit}` : "");
            staffInfo = `- ${staff.firstName} ${staff.lastName} ${doc}`;
        }

        const dateRange = `Pago semana ${format(new Date(record.startDate), 'dd/MM')} al ${format(new Date(record.endDate), 'dd/MM')}`;
        
        setFormData(prev => ({
            ...prev,
            workRecordId: recordId,
            amount: record.total,
            description: `${dateRange} ${staffInfo}`.trim() // Concatenamos fechas con info del empleado
        }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.categoryId || !formData.date) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }
    try {
      let finalAmount = formData.amount;
      if (typeof finalAmount === 'string') {
        const cleanString = finalAmount.replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim();
        finalAmount = Number(cleanString);
      }

      // Conflicto en fechas: calcularlo de forma manual (CORREGIDO: Usando métodos locales para evitar desfase de día)
      const d = new Date(formData.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      const isoDate = `${year}-${month}-${day}T12:00:00.000Z`;

      const data = {
        description: formData.description,
        amount: Number(finalAmount),
        categoryId: formData.categoryId,
        date: isoDate, 
        workRecordId: (isWagesCategory && formData.workRecordId) ? formData.workRecordId : undefined
      };

      console.log("Enviando fecha (Manual Local):", data.date);

      if (expense) {
        await updateExpense(expense.id, data as UpdateExpenseDto);
      } else {
        await createExpense(data as CreateExpenseDto);
      }

      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  // Estilos
  const commonInputStyles = {
    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
    input: {
      backgroundColor: "#2d2d2d",
      borderColor: "#404040",
      color: "white",
    },
  };

  const selectStyles = {
    ...commonInputStyles,
    dropdown: {
        backgroundColor: "#2d2d2d",
        borderColor: "#404040",
        color: "white",
    },
    item: {
        color: "white",
        '&[data-hovered]': {
            backgroundColor: "#404040"
        }
    }
  };

  const staffContainerStyles = {
    padding: '12px', 
    border: '1px solid #404040', 
    borderRadius: '8px', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: '10px'
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={expense ? "Editar Gasto" : "Registrar Nuevo Gasto"}
      styles={{
        content: { backgroundColor: "#1a1a1a" },
        header: { backgroundColor: "#1a1a1a", borderBottom: "1px solid #2d2d2d" },
        title: { color: "white", fontSize: "1.25rem", fontWeight: 600 },
        body: { padding: "1.5rem" },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Categoría"
            placeholder="Seleccionar categoría"
            data={categoriesList.map(c => ({ value: c.id, label: c.name }))}
            value={formData.categoryId}
            onChange={(val) => setFormData({ ...formData, categoryId: val || "" })}
            required
            searchable
            styles={selectStyles} 
          />

          {isWagesCategory && !expense && (
            <div style={staffContainerStyles}>
                <Text size="sm" c="dimmed" mb={8} fw={500}>Detalles del Pago de Haberes</Text>
                
                <Select
                    label="Empleado"
                    placeholder="Buscar empleado..."
                    data={staffList.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))}
                    value={selectedStaffId}
                    onChange={setSelectedStaffId}
                    searchable
                    styles={selectStyles}
                    mb="sm"
                />

                <Select
                    label="Planilla a Pagar (WorkRecord)"
                    placeholder={!selectedStaffId ? "Seleccione empleado" : loadingRecords ? "Buscando..." : "Seleccionar periodo..."}
                    disabled={!selectedStaffId || loadingRecords}
                    data={workRecordsList.map(r => ({
                        value: r.id,
                        label: `${format(new Date(r.startDate), 'dd/MM')} al ${format(new Date(r.endDate), 'dd/MM')} - $${r.total}`
                    }))}
                    value={formData.workRecordId}
                    onChange={(val) => val && handleWorkRecordSelect(val)}
                    styles={selectStyles}
                    rightSection={loadingRecords ? <Loader size={16} color="orange" /> : null}
                />
            </div>
          )}

          <TextInput
            label="Descripción"
            placeholder="Ej: Combustible, Materiales..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            styles={commonInputStyles}
          />

          <NumberInput
            label="Monto"
            placeholder="0.00"
            value={formData.amount}
            onChange={(val) => setFormData({ ...formData, amount: val })}
            allowNegative={false}
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            required
            styles={commonInputStyles}
          />

          <DateInput
            label="Fecha del Gasto"
            placeholder="Seleccionar fecha"
            value={formData.date}
            onChange={(val) => setFormData({ ...formData, date: val as Date | null })}
            valueFormat="DD/MM/YYYY"
            required
            styles={commonInputStyles}
          />

          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              variant="subtle"
              color="gray"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" color="orange" loading={isLoading}>
              {expense ? "Guardar Cambios" : "Registrar Gasto"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}