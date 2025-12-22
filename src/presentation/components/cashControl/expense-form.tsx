"use client";

import { useState, useEffect } from "react";
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "@/src/core/entities";
import { useCashControlStore } from "@/src/presentation/stores/cash-control.store";
import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  NumberInput,
  Select,
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
}

export function ExpenseForm({ isOpen, onClose, expense }: ExpenseFormProps) {
  const { 
    createExpense, 
    updateExpense, 
    categoriesList, 
    fetchCategories, 
    isLoading 
  } = useCashControlStore();

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    categoryId: "",
    date: new Date(),
  });

  useEffect(() => {
    if (isOpen && categoriesList.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categoriesList.length, fetchCategories]);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.categoryId,
        // Convertir el string ISO a Date para evitar errores en el componente
        date: expense.date ? new Date(expense.date) : new Date(),
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date(),
      });
    }
  }, [expense, isOpen]);

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

      //Conflicto en fechas, la solucion: calcularlo de forma mnual usando metodos UTC
      const d = new Date(formData.date);

      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');

      const isoDate = `${year}-${month}-${day}T12:00:00.000Z`;

      const data = {
        description: formData.description,
        amount: Number(finalAmount),
        categoryId: formData.categoryId,
        date: isoDate, 
      };

      console.log("Enviando fecha (UTC Getter):", data.date);

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