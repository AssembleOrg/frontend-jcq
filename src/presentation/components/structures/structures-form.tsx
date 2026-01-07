"use client";

import { useEffect, useState } from "react";
import { Button, TextInput, NumberInput, Textarea, Select, Group, Stack, Box, LoadingOverlay } from "@mantine/core";
import { structuresApi } from "@/src/infrastructure/api/structures.api"; 
import { useStructuresStore } from "@/src/presentation/stores/structures.store";
import { showToast } from "@/src/presentation/utils/toast";
import type { Structure, CreateStructureDto, StructureCategory } from "@/src/core/entities/structure-entity"; 

export interface StructureFormProps {
  initialData?: Structure | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StructureForm = ({ initialData, onClose, onSuccess }: StructureFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { categoriesList, fetchCategories, isCategoriesLoading } = useStructuresStore();
  
  const [formData, setFormData] = useState<CreateStructureDto>({
    name: "",
    categoryId: "", 
    measure: "",
    description: "",
    stock: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        categoryId: initialData.categoryId || "",
        measure: initialData.measure || "",
        description: initialData.description || "",
        stock: initialData.stock || 0,
      });
    } else {
      setFormData({
        name: "",
        categoryId: categoriesList.length > 0 ? categoriesList[0].id : "",
        measure: "",
        description: "",
        stock: 0,
      });
    }
  }, [initialData, categoriesList]);

  const handleChangeText = (field: keyof CreateStructureDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeNumber = (field: keyof CreateStructureDto, value: number | string) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const getErrorMessage = (error: any): string => {
    // Try to extract the message from the backend response
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return "Error al guardar la estructura";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        await structuresApi.update(initialData.id, formData);
        showToast.success("Estructura actualizada exitosamente");
      } else {
        await structuresApi.create(formData);
        showToast.success("Estructura creada exitosamente");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error guardando estructura:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputStyles = {
    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
    label: { color: "#9ca3af" },
    dropdown: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
    option: { hover: { backgroundColor: "#2d2d2d" } } 
  };

  const categoryOptions = categoriesList.map((cat: StructureCategory) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Box component="form" onSubmit={handleSubmit} pos="relative">
      <LoadingOverlay visible={isLoading || isCategoriesLoading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="md">
        <TextInput
          label="Nombre de la Estructura"
          placeholder="Ej: Andamio X"
          required
          value={formData.name}
          onChange={(e) => handleChangeText("name", e.target.value)}
          styles={commonInputStyles}
        />

        <Group grow>
          <TextInput
            label="Medidas (Opcional)"
            placeholder="Ej: 3x3 mts"
            value={formData.measure || ""}
            onChange={(e) => handleChangeText("measure", e.target.value)}
            styles={commonInputStyles}
          />

          <NumberInput
            label="Stock"
            placeholder="0"
            required
            min={0}
            allowNegative={false}
            value={formData.stock}
            onChange={(val) => handleChangeNumber("stock", val)}
            styles={commonInputStyles}
          />
        </Group>

        <Textarea
          label="Descripción (Opcional)"
          placeholder="Descripción de la estructura..."
          value={formData.description || ""}
          onChange={(e) => handleChangeText("description", e.target.value)}
          minRows={2}
          autosize
          styles={commonInputStyles}
        />

        <Select
          label="Categoría"
          placeholder={categoriesList.length === 0 ? "No hay categorías - Crea una primero" : "Buscar categoría..."}
          required
          data={categoryOptions}
          value={formData.categoryId || null}
          onChange={(val) => handleChangeText("categoryId", val || "")}
          styles={commonInputStyles}
          checkIconPosition="right"
          comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
          disabled={categoriesList.length === 0}
          searchable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}>
            Cancelar
          </Button>
          <Button type="submit" color="orange" loading={isLoading} disabled={!formData.categoryId}>
            {initialData ? "Guardar Cambios" : "Crear Estructura"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};