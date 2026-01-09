"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  Project,
} from "@/src/core/entities";
import { useProjectsStore, useClientsStore, useBudgetsStore } from "@/src/presentation/stores";
import { useDolarStore } from "@/src/presentation/stores/dolar.store";
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
  Switch,
} from "@mantine/core";
import { ProjectStructuresSelector, SelectedItem } from "./project-structure-selector";
import { useCollaboratorsStore } from "@/src/presentation/stores/collaborators.store";


interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

// Interfaz local para manejar el estado del formulario de colaboradores
interface CollaboratorRow {
  collaboratorId: string;
  workersCount: string | number;
  hoursCount: string | number;
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const { createProject, updateProject, isLoading } = useProjectsStore();
  const { clients, fetchAllClients } = useClientsStore();
  const { collaboratorSelector, fetchCollaboratorSelector } = useCollaboratorsStore();
  const { dolar, fetchDolar } = useDolarStore();
  
  // Hook para presupuestos
  const { budgetsList, fetchBudgets } = useBudgetsStore();
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllClients();
      fetchCollaboratorSelector(); 
      fetchBudgets();
      fetchDolar();
    }
  }, [isOpen, fetchAllClients, fetchCollaboratorSelector, fetchBudgets, fetchDolar]);

  // Estado del formulario actualizado para soportar array de colaboradores
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
    hasUSD: false,
    usdValue: "" as string | number,
    // Array para múltiples colaboradores
    collaborators: [] as CollaboratorRow[], 
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
        hasUSD: project.hasUSD || false,
        usdValue: project.usdValue || "",
        // Mapeamos los colaboradores existentes al formato del formulario
        collaborators: project.collaborators 
          ? project.collaborators.map(c => ({
              collaboratorId: c.collaborator.id, 
              workersCount: c.workersCount,
              hoursCount: c.hoursCount
            }))
          : [],
      });

      if (project.structures) {
        const isStockReserved = project.status !== 'BUDGET';

        setSelectedStructures(
          project.structures.map((item) => {
            const dbStock = item.structure?.stock || 0; 
            const realLimit = isStockReserved 
              ? dbStock + item.quantity 
              : dbStock;

            return {
              structureId: item.structureId, 
              quantity: item.quantity,
              name: item.structure?.name || "Ítem",
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
        hasUSD: false,
        usdValue: "",
        collaborators: [],
      });
      setSelectedStructures([]);
      setSelectedBudgetId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, isOpen]);

  // Importación Simplificada (Solo Datos)
  const handleBudgetSelect = (budgetId: string | null) => {
    setSelectedBudgetId(budgetId);
    if (!budgetId) return;

    const budget = budgetsList?.find((b) => b.id === budgetId);
    if (!budget) return;

    setFormData((prev) => ({
      ...prev,
      clientId: budget.clientId || prev.clientId,
      amount: budget.totalAmount.toString(),
      event: budget.manualClientName 
        ? `Evento - ${budget.manualClientName}` 
        : (budget.client?.fullname ? `Evento - ${budget.client.fullname}` : prev.event),
      // Importar datos de USD desde el presupuesto
      hasUSD: budget.hasUSD || false,
      usdValue: budget.usdValue || "",
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

  
  const addCollaborator = () => {
    setFormData((prev) => ({
      ...prev,
      collaborators: [
        ...prev.collaborators,
        { collaboratorId: "", workersCount: "", hoursCount: "" }
      ]
    }));
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }));
  };

  const updateCollaborator = (index: number, field: keyof CollaboratorRow, value: any) => {
    setFormData((prev) => {
      const newCollaborators = [...prev.collaborators];
      newCollaborators[index] = { ...newCollaborators[index], [field]: value };
      return { ...prev, collaborators: newCollaborators };
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      workers: formData.workers ? Number(formData.workers) : 0,
      locationLat: formData.locationLat ? Number(formData.locationLat) : undefined,
      locationLng: formData.locationLng ? Number(formData.locationLng) : undefined,
      
      // Transformamos el array de colaboradores a números
      collaborators: formData.collaborators.map(c => ({
        collaboratorId: c.collaboratorId,
        workersCount: Number(c.workersCount),
        hoursCount: Number(c.hoursCount)
      })),

      structures: selectedStructures.map(({ structureId, quantity }) => ({
        structureId,
        quantity,
      })),

      // Campos USD
      hasUSD: formData.hasUSD,
      usdValue: formData.hasUSD && formData.usdValue ? Number(formData.usdValue) : undefined,
    };

    try {
      if (project) {
        await updateProject(project.id, payload as any); 
      } else {
        await createProject(payload as any);
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
          
          {/* Autocompletar desde presupuesto */}
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
            <Grid.Col span={6}>
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
            <Grid.Col span={6}>
              <NumberInput
                label="Personal Propio (JCQ)"
                placeholder="0"
                value={formData.workers}
                onChange={(val) => setFormData({ ...formData, workers: val.toString() })}
                min={0}
                styles={{ label: labelStyle, input: inputStyle }}
              />
            </Grid.Col>
          </Grid>

          {/* Sección USD */}
          <Paper p="sm" style={{ backgroundColor: formData.hasUSD ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.03)", border: formData.hasUSD ? "1px solid #22c55e" : "1px solid #404040", borderRadius: "8px" }}>
            <Group justify="space-between" mb={formData.hasUSD ? "xs" : 0}>
              <Text size="sm" fw={500} c={formData.hasUSD ? "#22c55e" : "#e5e7eb"}>Cotizar en Dólares</Text>
              <Switch
                checked={formData.hasUSD}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setFormData({
                    ...formData,
                    hasUSD: checked,
                    usdValue: checked && dolar ? dolar.venta : ""
                  });
                }}
                color="green"
              />
            </Group>
            {formData.hasUSD && (
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Valor del Dólar"
                    placeholder="0.00"
                    value={formData.usdValue}
                    onChange={(val) => setFormData({ ...formData, usdValue: val })}
                    min={0}
                    prefix="$ "
                    decimalScale={2}
                    styles={{ label: { ...labelStyle, fontSize: '12px' }, input: { ...inputStyle, borderColor: '#22c55e' } }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" mb={4}>Monto en USD</Text>
                  <Text size="lg" fw={700} c="#22c55e">
                    USD {formData.amount && formData.usdValue && Number(formData.usdValue) > 0
                      ? (Number(formData.amount) / Number(formData.usdValue)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'}
                  </Text>
                </Grid.Col>
              </Grid>
            )}
          </Paper>

          <Divider my="xs" color="#2d2d2d" label="Colaboradores Externos" labelPosition="center" />

          <Stack gap="sm">
            {(() => {
              // Identificar que colaboradores ya estan en el form
              const allSelectedIds = formData.collaborators
                .map((c) => c.collaboratorId)
                .filter((id) => id !== "");

              return formData.collaborators.map((item, index) => {
                const rowOptions = collaboratorSelector
                  .filter((c) => {
                    const isSelectedElsewhere = allSelectedIds.includes(c.id);
                    const isSelectedInThisRow = c.id === item.collaboratorId;
                    // Mostramos si: (NO está seleccionado en otro lado) O (Es el de esta fila)
                    return !isSelectedElsewhere || isSelectedInThisRow;
                  })
                  .map((c) => ({ value: c.id, label: c.displayName }));

                return (
                  <Box 
                    key={index} 
                    p="sm" 
                    style={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.03)", 
                      borderRadius: "8px", 
                      border: "1px solid #404040" 
                    }}
                  >
                    <Grid align="flex-end">
                      <Grid.Col span={5}>
                        <Select
                          label="Colaborador"
                          placeholder="Seleccionar"
                          data={rowOptions}
                          value={item.collaboratorId}
                          onChange={(value) => updateCollaborator(index, "collaboratorId", value || "")}
                          searchable
                          nothingFoundMessage="Sin resultados"
                          styles={{ label: { ...labelStyle, fontSize: '12px' }, input: inputStyle }}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <NumberInput
                          label="Personal"
                          placeholder="Cant."
                          value={item.workersCount}
                          onChange={(val) => updateCollaborator(index, "workersCount", val)}
                          min={1}
                          styles={{ label: { ...labelStyle, fontSize: '12px' }, input: inputStyle }}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <NumberInput
                          label="Horas"
                          placeholder="Cant."
                          value={item.hoursCount}
                          onChange={(val) => updateCollaborator(index, "hoursCount", val)}
                          min={0}
                          step={0.5}
                          styles={{ label: { ...labelStyle, fontSize: '12px' }, input: inputStyle }}
                        />
                      </Grid.Col>
                      <Grid.Col span={1}>
                        <Button 
                          color="red" 
                          variant="subtle" 
                          onClick={() => removeCollaborator(index)}
                          style={{ padding: '0 5px' }}
                          title="Eliminar colaborador"
                        >
                          X
                        </Button>
                      </Grid.Col>
                    </Grid>
                  </Box>
                );
              });
            })()}

            {(() => {
              const isAddDisabled = formData.collaborators.length >= collaboratorSelector.length;

              return (
                <Button 
                  variant="outline" 
                  color="orange" 
                  onClick={addCollaborator}
                  disabled={isAddDisabled}
                  fullWidth
                  style={{ 
                    borderColor: isAddDisabled ? "#404040" : "#f97316", 
                    color: isAddDisabled ? "#6b7280" : "#f97316",
                    opacity: isAddDisabled ? 0.5 : 1,
                    cursor: isAddDisabled ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {isAddDisabled ? "No hay más colaboradores disponibles" : "+ Agregar Colaborador"}
                </Button>
              );
            })()}
          </Stack>
          <Divider my="xs" color="#2d2d2d" />
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

          {/* Selector de estructuras */}
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