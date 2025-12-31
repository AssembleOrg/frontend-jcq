"use client";

import { useEffect, useState } from "react";
import { Button, TextInput, Select, Group, Stack, Box, LoadingOverlay } from "@mantine/core";
import { staffApi } from "@/src/infrastructure/api/staff.api";
import type { Staff } from "@/src/core/entities";

export interface StaffFormProps {
  initialData?: Staff | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffForm = ({ initialData, onClose, onSuccess }: StaffFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    cuit: "",
    category: "",
    numberPhone:"",
    adress: "",
    email: "",
    seniority: "",
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        dni: initialData.dni || "",
        cuit: initialData.cuit || "",
        category: initialData.category || "",
        numberPhone: initialData.numberPhone || "",
        adress: initialData.adress || "",
        email : initialData.email || "",
        seniority: initialData.seniority || "",
      });
    } else {
      // Limpiar si es creación
      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        cuit: "",
        category: "",
        numberPhone: "",
        adress: "",
        email: "",
        seniority: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        await staffApi.update(initialData.id, formData);
      } else {
        await staffApi.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error guardando empleado:", error);
      alert("Error al guardar. Revisa la consola.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="Nombre"
            placeholder="Juan"
            required
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
          <TextInput
            label="Apellido"
            placeholder="Pérez"
            required
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
        </Group>

        {/* Nuevos campos de contacto */}
        <Group grow>
          <TextInput
            label="Email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
          <TextInput
            label="Teléfono"
            placeholder="Ej: 11 1234 5678"
            value={formData.numberPhone}
            onChange={(e) => handleChange("numberPhone", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
        </Group>

        <Group grow>
          <TextInput
            label="DNI"
            placeholder="12345678"
            value={formData.dni}
            onChange={(e) => handleChange("dni", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
          <TextInput
            label="CUIT"
            placeholder="20-12345678-9"
            value={formData.cuit}
            onChange={(e) => handleChange("cuit", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Categoría"
            placeholder="Ej: A (Administrativo)"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
           <TextInput
            label="Antigüedad"
            placeholder="Ej: 2 años"
            value={formData.seniority}
            onChange={(e) => handleChange("seniority", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />
        </Group>

        {/* Dirección (ancho completo) */}
        <TextInput
            label="Dirección"
            placeholder="Calle Falsa 123"
            value={formData.adress}
            onChange={(e) => handleChange("adress", e.target.value)}
            styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
          />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}>
            Cancelar
          </Button>
          <Button type="submit" color="orange" loading={isLoading}>
            {initialData ? "Guardar Cambios" : "Crear Empleado"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};