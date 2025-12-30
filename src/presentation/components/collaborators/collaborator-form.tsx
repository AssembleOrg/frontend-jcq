"use client";

import { useState, useEffect } from "react";
import type {
  Collaborator,
  CreateCollaboratorDto,
  UpdateCollaboratorDto,
} from "@/src/core/entities/collaborators-entity"; 
import { useCollaboratorsStore } from "@/src/presentation/stores/collaborators.store"; 
import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  Grid,
  Text,
  NumberInput,
  Textarea,
} from "@mantine/core"; 

interface CollaboratorFormProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator?: Collaborator;
}

export function CollaboratorForm({ isOpen, onClose, collaborator }: CollaboratorFormProps) {
  const { createCollaborator, updateCollaborator, isLoading } = useCollaboratorsStore(); 

  const [formData, setFormData] = useState<CreateCollaboratorDto & { notes?: string }>({
    firstName: "",
    lastName: "",
    companyName: "",
    cuit: "",
    dni: "",
    quantityWorkers: 0,
    valuePerHour: 0,
    notes: "", 
  }); 

  useEffect(() => {
    if (collaborator) {
      setFormData({
        firstName: collaborator.firstName || "",
        lastName: collaborator.lastName || "",
        companyName: collaborator.companyName || "",
        cuit: collaborator.cuit || "",
        dni: collaborator.dni || "",
        quantityWorkers: collaborator.quantityWorkers,
        valuePerHour: collaborator.valuePerHour,
        notes: collaborator.notes || "", 
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        companyName: "",
        cuit: "",
        dni: "",
        quantityWorkers: 0,
        valuePerHour: 0,
        notes: "", 
      });
    }
  }, [collaborator, isOpen]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (collaborator) {
      await updateCollaborator(collaborator.id, formData as UpdateCollaboratorDto);
    } else {
      await createCollaborator(formData);
    }
    onClose();
  }; 

  const inputStyles = {
    label: { color: "#9ca3af", marginBottom: "5px" },
    input: {
      backgroundColor: "#1f2937",
      color: "white",
      border: "1px solid #374151",
      "&:focus": { borderColor: "#f97316" },
    },
  }; 

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={collaborator ? "Editar Colaborador" : "Nuevo Colaborador"}
      centered
      size="lg"
      styles={{
        content: { backgroundColor: "#111827", color: "white" },
        header: { backgroundColor: "#111827", color: "white" },
      }}
    > 
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">Datos de Identificación (Persona o Empresa)</Text> 
          
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!!formData.companyName}
                styles={inputStyles}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!!formData.companyName}
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Razón Social"
            placeholder="Nombre de la empresa"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            disabled={!!formData.firstName || !!formData.lastName}
            styles={inputStyles}
          /> 

          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="CUIT"
                placeholder="20123456789"
                value={formData.cuit}
                onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                disabled={!!formData.dni}
                styles={inputStyles}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="DNI"
                placeholder="12345678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                disabled={!!formData.cuit}
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid> 

          <Text size="sm" c="dimmed" mt="sm">Capacidad y Costos</Text> 
          
          <Grid gutter="md">
            <Grid.Col span={6}>
              <NumberInput
                label="Cantidad de Personal"
                placeholder="0"
                min={0}
                value={formData.quantityWorkers}
                onChange={(val) => setFormData({ ...formData, quantityWorkers: Number(val) })}
                required
                styles={inputStyles}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Costo por Hora (Sugerido)"
                placeholder="0"
                min={0}
                prefix="$ "
                value={formData.valuePerHour}
                onChange={(val) => setFormData({ ...formData, valuePerHour: Number(val) })}
                required
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid> 

          {/* NUEVO CAMPO: NOTES */}
          <Textarea
            label="Notas / Observaciones"
            placeholder="Información adicional..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            autosize
            minRows={2}
            maxRows={4}
            styles={inputStyles}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" color="orange" loading={isLoading}>
              {collaborator ? "Actualizar" : "Crear Colaborador"}
            </Button>
          </Group> 
        </Stack>
      </form>
    </Modal>
  );
}