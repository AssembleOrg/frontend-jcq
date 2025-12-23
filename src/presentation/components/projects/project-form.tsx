"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from "@/src/core/entities";
import { useProjectsStore, useClientsStore, useBudgetsStore } from "@/src/presentation/stores";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Select,
  Group,
  Grid,
  Stack,
  Divider,
  Box,
  Text,
  Paper,
} from "@mantine/core";
import { ProjectStructuresSelector, SelectedItem } from "./project-structure-selector";
import { useCollaboratorsStore } from "@/src/presentation/stores/collaborators.store";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const { createProject, updateProject, isLoading } = useProjectsStore();
  const { clients, fetchAllClients } = useClientsStore();
  const { collaboratorSelector, fetchCollaboratorSelector } = useCollaboratorsStore();
  
  // Hook para presupuestos
  const { budgetsList, fetchBudgets } = useBudgetsStore();
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllClients();
      fetchCollaboratorSelector(); // Cargar la lista para el select
      fetchBudgets(); // Cargar presupuestos disponibles
    }
  }, [isOpen, fetchAllClients, fetchCollaboratorSelector, fetchBudgets]);

  const [formData, setFormData] = useState({
    amount: "",
    clientId: "",
    locationAddress: "",
    locationLat: "",
    locationLng: "",
    workers: "",
    event: "",
    dateInit: "",
    dateEnd: "",
    collaboratorId: "",
    collabWorkersCount: "", 
  });

  const [selectedStructures, setSelectedStructures] = useState<SelectedItem[]>([]);

  // useEffect PRINCIPAL: Carga datos al EDITAR un proyecto existente
  useEffect(() => {
    if (project) {
      setFormData({
        amount: project.amount.toString(),
        clientId: project.clientId,
        locationAddress: project.locationAddress || "",
        locationLat: project.locationLat?.toString() || "",
        locationLng: project.locationLng?.toString() || "",
        workers: project.workers?.toString() || "",
        event: project.event || "",
        dateInit: project.dateInit ? new Date(project.dateInit).toISOString().split('T')[0] : "",
        dateEnd: project.dateEnd ? new Date(project.dateEnd).toISOString().split('T')[0] : "",
        collaboratorId: project.collaboratorId || "",
        collabWorkersCount: project.collabWorkersCount?.toString() || "",
      });

      if (project.structures) {
        // Lógica de stock al editar: Sumamos la cantidad propia al stock disponible
        const isStockReserved = project.status !== 'BUDGET';

        setSelectedStructures(
          project.structures.map((item) => {
            const dbStock = item.structure.stock; 
            const realLimit = isStockReserved 
              ? dbStock + item.quantity 
              : dbStock;

            return {
              structureId: item.structureId,
              quantity: item.quantity,
              name: item.structure.name,
              maxStock: realLimit, 
            };
          })
        );
      }
      setSelectedBudgetId(null);
    } else {
      // Reset completo
      setFormData({
        amount: "",
        clientId: "",
        locationAddress: "",
        locationLat: "",
        locationLng: "",
        workers: "",
        event: "",
        dateInit: "",
        dateEnd: "",
        collaboratorId: "",
        collabWorkersCount: "",
      });
      setSelectedStructures([]);
      setSelectedBudgetId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, isOpen]);

  //Importación Simplificada (Solo Datos)
  const handleBudgetSelect = (budgetId: string | null) => {
    setSelectedBudgetId(budgetId);
    if (!budgetId) return;

    const budget = budgetsList?.find((b) => b.id === budgetId);
    if (!budget) return;

    // Solo se rellenan los datos administrativos
    setFormData((prev) => ({
      ...prev,
      clientId: budget.clientId || prev.clientId,
      amount: budget.totalAmount.toString(),
      event: budget.manualClientName 
        ? `Evento - ${budget.manualClientName}` 
        : (budget.client?.fullname ? `Evento - ${budget.client.fullname}` : prev.event),
    }));
    
  };

  const budgetOptions = useMemo(() => {
    const list = budgetsList || [];
    return list.map((b) => {
      const clientLabel = b.client ? b.client.fullname : (b.manualClientName || "Sin Cliente");
      const dateObj = new Date(b.date);
      const dateLabel = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'Fecha';
      const total = Number(b.totalAmount || 0).toFixed(2);
      
      return {
        value: b.id,
        label: `${dateLabel} - ${clientLabel} ($${total})`
      };
    });
  }, [budgetsList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      workers: formData.workers ? Number(formData.workers) : 0,
      locationLat: formData.locationLat ? Number(formData.locationLat) : undefined,
      locationLng: formData.locationLng ? Number(formData.locationLng) : undefined,
      collaboratorId: formData.collaboratorId || undefined,
      collabWorkersCount: formData.collaboratorId ? Number(formData.collabWorkersCount) : undefined,
      structures: selectedStructures.map(({ structureId, quantity }) => ({
        structureId,
        quantity,
      })),
    };

    try {
      if (project) {
        await updateProject(project.id, payload as UpdateProjectDto);
      } else {
        await createProject(payload as CreateProjectDto);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const labelStyle = { color: "#e5e7eb", marginBottom: "0.5rem" };
  const inputStyle = {
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "white",
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={project ? "Editar Proyecto" : "Nuevo Proyecto"}
      size="xl"
      centered
      styles={{
        content: { backgroundColor: "#1a1a1a", color: "white" },
        header: { backgroundColor: "#1a1a1a", color: "white" },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          
          {/* NUEVA SECCION: Autocompletar datos desde presupuesto */}
          {!project && (
            <Paper p="xs" style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px dashed #404040" }}>
              <Text size="xs" c="dimmed" mb={5}>Autocompletar datos desde Presupuesto Existente</Text>
              <Select
                placeholder="Buscar presupuesto..."
                data={budgetOptions}
                value={selectedBudgetId}
                onChange={handleBudgetSelect}
                searchable
                clearable
                styles={{
                  input: { ...inputStyle, borderColor: "#f97316" },
                  dropdown: { backgroundColor: "#1a1a1a", borderColor: "#404040", color: "white" },
                  option: { color: "white" }
                }}
              />
            </Paper>
          )}

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Cliente"
                placeholder="Seleccione un cliente"
                data={clients.map((c) => ({ value: c.id, label: c.fullname }))}
                value={formData.clientId}
                onChange={(value) => setFormData({ ...formData, clientId: value || "" })}
                required
                searchable
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Evento / Nombre"
                placeholder="Ej: Boda de Juan y Ana"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                required
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Dirección"
            placeholder="Calle, Ciudad, Provincia"
            value={formData.locationAddress}
            onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
            required
            styles={{ label: labelStyle, input: inputStyle }}
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Monto Total"
                placeholder="0.00"
                value={formData.amount}
                onChange={(val) => setFormData({ ...formData, amount: val.toString() })}
                required
                min={0}
                prefix="$ "
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Personal Propio"
                placeholder="0"
                value={formData.workers}
                onChange={(val) => setFormData({ ...formData, workers: val.toString() })}
                min={0}
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="Colaborador Externo"
                placeholder="Opcional"
                data={collaboratorSelector.map((c) => ({ value: c.id, label: c.displayName }))}
                value={formData.collaboratorId}
                onChange={(value) => setFormData({ ...formData, collaboratorId: value || "", collabWorkersCount: "" })}
                clearable
                searchable
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
          </Grid>

          {formData.collaboratorId && (
            <Box 
              p="sm" 
              style={{ 
                backgroundColor: "rgba(249, 115, 22, 0.05)", 
                borderRadius: "8px", 
                border: "1px dashed #f97316" 
              }}
            >
              <Grid align="center">
                <Grid.Col span={8}>
                  <Text size="sm" fw={600} c="orange">Personal Externo Requerido</Text>
                  <Text size="xs" c="#9ca3af">Especifique cuántos empleados de este colaborador asistirán al proyecto.</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    placeholder="Cantidad"
                    value={formData.collabWorkersCount}
                    onChange={(val) => setFormData({ ...formData, collabWorkersCount: val.toString() })}
                    min={1}
                    required
                    styles={{ input: inputStyle }}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          )}

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Fecha Inicio"
                type="date"
                value={formData.dateInit}
                onChange={(e) =>
                  setFormData({ ...formData, dateInit: e.target.value })
                }
                required
                styles={{
                  label: labelStyle,
                  input: {
                    ...inputStyle,
                    colorScheme: "dark"
                  },
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Fecha Fin"
                type="date"
                value={formData.dateEnd}
                onChange={(e) =>
                  setFormData({ ...formData, dateEnd: e.target.value })
                }
                required
                styles={{
                  label: labelStyle,
                  input: {
                    ...inputStyle,
                    colorScheme: "dark"
                  },
                }}
              />
            </Grid.Col>
          </Grid>

          <Divider my="xs" color="#2d2d2d" />

          {/* Selector de estructuras que ya existen */}
          <ProjectStructuresSelector 
            value={selectedStructures}
            onChange={setSelectedStructures}
          />

          <Divider my="xs" color="#2d2d2d" />

          {/* Botones de accion */}
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
              {project ? "Guardar Cambios" : "Crear Proyecto"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}