"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText } from "lucide-react";
import type { Project, CreatePaidDto } from "@/src/core/entities";
import { usePaidsStore, useProjectsStore } from "@/src/presentation/stores";
import {
  Modal,
  Button,
  TextInput,
  Badge,
  Stack,
  Group,
  Paper,
  Text,
  Box,
  ScrollArea,
  ActionIcon,
} from "@mantine/core";
import { formatCurrency, formatDate } from "@/src/presentation/utils";

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function PaymentsModal({
  isOpen,
  onClose,
  project,
}: PaymentsModalProps) {
  const { paids, fetchPaidsByProject, createPaid, deletePaid, isLoading } =
    usePaidsStore();
  const { fetchProjectById } = useProjectsStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    bill: "",
  });

  useEffect(() => {
    if (project && isOpen) {
      fetchPaidsByProject(project.id);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    try {
      const data: CreatePaidDto = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        bill: formData.bill,
        projectId: project.id,
      };

      await createPaid(data);
      await fetchProjectById(project.id); // Refresh project data

      setFormData({ amount: "", date: "", bill: "" });
      setShowForm(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDelete = async (paidId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pago?")) return;

    try {
      await deletePaid(paidId);
      if (project) {
        await fetchProjectById(project.id); // Refresh project data
      }
    } catch (error) {
      // Error handled by store
    }
  };

  if (!project) return null;

  const inputStyles = {
    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
    input: {
      backgroundColor: "#2d2d2d",
      borderColor: "#404040",
      color: "white",
    },
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Pagos - ${project.client.fullname}`}
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
      <Stack gap="md">
        {/* Project Summary */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: "#2d2d2d",
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Monto Total:
              </Text>
              <Text size="sm" fw={600} c="white">
                {formatCurrency(project.amount)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Total Pagado:
              </Text>
              <Text size="sm" fw={600} c="#10b981">
                {formatCurrency(project.totalPaid)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Restante:
              </Text>
              <Text size="sm" fw={600} c="#f59e0b">
                {formatCurrency(project.rest)}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* Add Payment Button */}
        {!showForm && (
          <Button
            variant="light"
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => setShowForm(true)}
            fullWidth
          >
            Agregar Pago
          </Button>
        )}

        {/* Payment Form */}
        {showForm && (
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              backgroundColor: "#0a0a0a",
              borderColor: "#2d2d2d",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Monto"
                  type="number"
                  placeholder="100000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  styles={inputStyles}
                />
                <TextInput
                  label="Fecha"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  styles={inputStyles}
                />
                <TextInput
                  label="Nº Factura (opcional)"
                  placeholder="FC-2025-001"
                  value={formData.bill}
                  onChange={(e) =>
                    setFormData({ ...formData, bill: e.target.value })
                  }
                  styles={inputStyles}
                />
                <Group gap="xs" justify="flex-end">
                  <Button
                    type="button"
                    variant="subtle"
                    color="gray"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" color="orange" loading={isLoading}>
                    Guardar Pago
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        )}

        {/* Payments List */}
        <ScrollArea h={400} type="auto">
          <Stack gap="sm">
            {paids.length === 0 ? (
              <Text ta="center" c="#9ca3af" py="xl">
                No hay pagos registrados
              </Text>
            ) : (
              paids.map((paid) => (
                <Paper
                  key={paid.id}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#2d2d2d",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d2d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#0a0a0a";
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Text fw={600} c="white">
                          {formatCurrency(paid.amount)}
                        </Text>
                        {paid.bill && (
                          <Badge
                            color="gray"
                            variant="light"
                            leftSection={<FileText size={12} />}
                            size="sm"
                          >
                            {paid.bill}
                          </Badge>
                        )}
                      </Group>
                      <Group gap="xs">
                        <Calendar size={14} color="#9ca3af" />
                        <Text size="sm" c="#9ca3af">
                          {formatDate(paid.date)}
                        </Text>
                      </Group>
                    </Box>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      onClick={() => handleDelete(paid.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
}
