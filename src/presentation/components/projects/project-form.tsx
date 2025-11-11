"use client";

import { useState, useEffect } from "react";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from "@/src/core/entities";
import { useProjectsStore, useClientsStore } from "@/src/presentation/stores";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Select,
  Group,
  Grid,
  Stack,
} from "@mantine/core";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const { createProject, updateProject, isLoading } = useProjectsStore();
  const { clients, fetchAllClients } = useClientsStore();

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
  });

  useEffect(() => {
    // Only fetch clients when the modal opens and we don't have clients yet
    if (isOpen && clients.length === 0) {
      fetchAllClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        amount: project.amount.toString(),
        clientId: project.clientId,
        locationAddress: project.locationAddress || "",
        locationLat: project.locationLat?.toString() || "",
        locationLng: project.locationLng?.toString() || "",
        workers: project.workers.toString(),
        event: project.event || "",
        dateInit: project.dateInit.split("T")[0],
        dateEnd: project.dateEnd.split("T")[0],
      });
    } else {
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        amount: parseFloat(formData.amount),
        clientId: formData.clientId,
        locationAddress: formData.locationAddress,
        locationLat: formData.locationLat
          ? parseFloat(formData.locationLat)
          : undefined,
        locationLng: formData.locationLng
          ? parseFloat(formData.locationLng)
          : undefined,
        workers: parseInt(formData.workers),
        event: formData.event.trim(),
        dateInit: formData.dateInit,
        dateEnd: formData.dateEnd,
      };

      if (project) {
        await updateProject(project.id, data as UpdateProjectDto);
      } else {
        await createProject(data as CreateProjectDto);
      }

      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.fullname,
  }));

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={project ? "Editar Proyecto" : "Nuevo Proyecto"}
      size="lg"
      styles={{
        content: {
          backgroundColor: "#1a1a1a",
        },
        header: {
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2d2d2d",
        },
        title: {
          color: "white",
          fontSize: "1.25rem",
          fontWeight: 600,
        },
        body: {
          padding: "1.5rem",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={6}>
              <Select
                label="Cliente"
                placeholder="Seleccionar cliente"
                data={clientOptions}
                value={formData.clientId}
                onChange={(value) =>
                  setFormData({ ...formData, clientId: value || "" })
                }
                required
                styles={{
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Monto Total"
                placeholder="500.000"
                value={
                  formData.amount ? parseFloat(formData.amount) : undefined
                }
                onChange={(value) =>
                  setFormData({ ...formData, amount: value?.toString() || "" })
                }
                required
                min={0}
                hideControls
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={0}
                styles={{
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Dirección"
            placeholder="Av. Corrientes 1234, CABA"
            value={formData.locationAddress}
            onChange={(e) =>
              setFormData({ ...formData, locationAddress: e.target.value })
            }
            required
            styles={{
              label: { color: "#e5e7eb", marginBottom: "0.5rem" },
              input: {
                backgroundColor: "#2d2d2d",
                borderColor: "#404040",
                color: "white",
              },
            }}
          />

          <TextInput
            label="Evento"
            placeholder="Ingrese el nombre del evento"
            value={formData.event}
            onChange={(e) =>
              setFormData({ ...formData, event: e.target.value })
            }
            required
            styles={{
              label: { color: "#e5e7eb", marginBottom: "0.5rem" },
              input: {
                backgroundColor: "#2d2d2d",
                borderColor: "#404040",
                color: "white",
              },
            }}
          />

          <Grid gutter="md">
            {/* <Grid.Col span={4}>
              <TextInput
                label="Latitud (opcional)"
                type="number"
                step="any"
                placeholder="-34.6037"
                value={formData.locationLat}
                onChange={(e) =>
                  setFormData({ ...formData, locationLat: e.target.value })
                }
                styles={{
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <TextInput
                label="Longitud (opcional)"
                type="number"
                step="any"
                placeholder="-58.3816"
                value={formData.locationLng}
                onChange={(e) =>
                  setFormData({ ...formData, locationLng: e.target.value })
                }
                styles={{
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col> */}

            <Grid.Col span={4}>
              <NumberInput
                label="Trabajadores"
                placeholder="15"
                value={
                  formData.workers ? parseInt(formData.workers) : undefined
                }
                onChange={(value) =>
                  setFormData({ ...formData, workers: value?.toString() || "" })
                }
                required
                min={1}
                hideControls
                decimalScale={0}
                styles={{
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col>
          </Grid>

          <Grid gutter="md">
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
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
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
                  label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                  input: {
                    backgroundColor: "#2d2d2d",
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              />
            </Grid.Col>
          </Grid>

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
