"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  MapPin,
  Users as UsersIcon,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { Project } from "@/src/core/entities";
import { useProjectsStore } from "@/src/presentation/stores";
import {
  Card,
  Badge,
  Button,
  Stack,
  Group,
  Text,
  Progress,
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  formatCurrency,
  formatDate,
  formatPercentage,
} from "@/src/presentation/utils";
import { ProjectForm } from "./project-form";

interface ProjectCardProps {
  project: Project;
  onViewPayments: (project: Project) => void;
}

const statusColors = {
  BUDGET: "gray",
  ACTIVE: "blue",
  IN_PROCESS: "orange",
  FINISHED: "green",
  DELETED: "red",
} as const;

const statusLabels = {
  BUDGET: "Presupuesto",
  ACTIVE: "Activo",
  IN_PROCESS: "En Proceso",
  FINISHED: "Finalizado",
  DELETED: "Eliminado",
};

export function ProjectCard({ project, onViewPayments }: ProjectCardProps) {
  const { deleteProject, updateProjectStatus } = useProjectsStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: Project["status"]) => {
    try {
      await updateProjectStatus(project.id, { status: newStatus });
    } catch (error) {
      // Error handled by store
    }
  };

  const progressPercentage = (project.totalPaid / project.amount) * 100;

  return (
    <>
      <Card
        padding="lg"
        radius="md"
        withBorder
        style={{
          backgroundColor: "#1a1a1a",
          borderColor: "#2d2d2d",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="lg" fw={600} c="white">
                {project.client.fullname}
              </Text>
              <Group gap="xs">
                <MapPin size={16} color="#9ca3af" />
                <Text size="sm" c="#9ca3af">
                  {project.locationAddress}
                </Text>
              </Group>
            </Stack>
            <Badge color={statusColors[project.status]} variant="light">
              {statusLabels[project.status]}
            </Badge>
          </Group>

          {/* Amounts */}
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
                Pagado:
              </Text>
              <Text size="sm" fw={600} c="#10b981">
                {formatCurrency(project.totalPaid)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Pendiente:
              </Text>
              <Text size="sm" fw={600} c="#f59e0b">
                {formatCurrency(project.rest)}
              </Text>
            </Group>
          </Stack>

          {/* Progress Bar */}
          <Box pt="xs">
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="#9ca3af">
                Progreso
              </Text>
              <Text size="xs" c="#9ca3af">
                {formatPercentage(project.totalPaid, project.amount)}
              </Text>
            </Group>
            <Progress
              value={Math.min(progressPercentage, 100)}
              color="orange"
              size="sm"
              radius="xl"
            />
          </Box>

          {/* Details */}
          <Group
            justify="space-between"
            pt="sm"
            style={{ borderTop: "1px solid #2d2d2d" }}
          >
            <Group gap="xs">
              <UsersIcon size={16} color="#9ca3af" />
              <Text size="sm" c="white">
                {project.workers} trabajadores
              </Text>
            </Group>
            <Group gap="xs">
              <Calendar size={16} color="#9ca3af" />
              <Text size="sm" c="white">
                {formatDate(project.dateInit)}
              </Text>
            </Group>
          </Group>

          {/* Actions */}
          <Group gap="xs">
            <Button
              variant="light"
              color="orange"
              size="sm"
              leftSection={<CreditCard size={16} />}
              onClick={() => onViewPayments(project)}
              style={{ flex: 1 }}
            >
              Ver Pagos
            </Button>
            <ActionIcon
              variant="light"
              color="gray"
              size="lg"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={handleDelete}
              loading={isDeleting}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      </Card>

      <ProjectForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
      />
    </>
  );
}
