"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  MapPin,
  Users as UsersIcon,
  Calendar,
  CreditCard,
  CheckCircle,
  FileText,
  Package, 
  DollarSign, 
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
  Popover, 
} from "@mantine/core";
import {
  formatDate,
  formatPercentage,
  formatARS,
  generateBudgetPDF,
} from "@/src/presentation/utils";
import { ProjectForm } from "./project-form";
import {
  ConfirmationModal,
  DeleteConfirmationModal,
} from "@/src/presentation/components/common";

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
  const [isActivating, setIsActivating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivateConfirm = async () => {
    setIsActivating(true);
    try {
      await updateProjectStatus(project.id, { status: "ACTIVE" });
      setShowActivateModal(false);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsActivating(false);
    }
  };

  const handleViewPayments = () => {
    if (project.status === "BUDGET") {
      setShowPaymentWarning(true);
      return;
    }
    onViewPayments(project);
  };

  const handleGenerateBudget = () => {
    if (!project.client) {
      return;
    }

    generateBudgetPDF({
      project,
      client: project.client,
      budgetNumber: `${project.id.substring(0, 8).toUpperCase()}`,
      validityDays: 15,
    });
  };

  const progressPercentage = (project.totalPaid / project.amount) * 100;
  // Calcular si hay estructuras para mostrar
  const totalStructuresCount = project.structures?.length || 0;

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
                {project.event 
                  ? `${project.client.fullname} - ${project.event}`
                  : project.client.fullname}
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

          {/* Seccion de Colaborador Asignado (Datos historicos para poder llevar un registro*/}
          {project.collaboratorId && (
            <Box 
              p="xs" 
              style={{ 
                backgroundColor: "rgba(249, 115, 22, 0.05)", 
                borderRadius: "8px", 
                border: "1px solid rgba(249, 115, 22, 0.2)",
                borderLeft: "4px solid #f97316" 
              }}
            >
              <Group gap="xs" mb={4}>
                <UsersIcon size={14} color="#f97316" />
                <Text size="xs" fw={700} c="orange" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Colaborador Asignado
                </Text>
              </Group>

              <Text size="sm" fw={600} c="white">
                {project.collabDisplayName}
              </Text>

              <Group gap="xl" mt={4}>
                <Text size="xs" c="#9ca3af">
                  Personal: <Text span c="white">{project.collabWorkersCount}</Text>
                </Text>
                <Group gap={4}>
                   <DollarSign size={12} color="#10b981" />
                   <Text size="xs" c="#9ca3af">
                    Acordado: <Text span c="#10b981" fw={600}>{formatARS(project.collabValuePerHour || 0)}/hr</Text>
                  </Text>
                </Group>
              </Group>
            </Box>
          )}

          {/* Amounts */}
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Monto Total:
              </Text>
              <Text size="sm" fw={600} c="white">
                {formatARS(project.amount)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Pagado:
              </Text>
              <Text size="sm" fw={600} c="#10b981">
                {formatARS(project.totalPaid)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Pendiente:
              </Text>
              <Text size="sm" fw={600} c="#f59e0b">
                {formatARS(project.rest)}
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

          {/* Estructuras asignadas */}
          {totalStructuresCount > 0 && (
            <Popover width={300} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Button 
                  variant="default" 
                  size="xs" 
                  fullWidth 
                  color="gray"
                  leftSection={<Package size={14} />}
                  styles={{ 
                    root: { 
                      backgroundColor: "rgba(255, 255, 255, 0.03)", 
                      borderColor: "#2d2d2d",
                      color: "#9ca3af",
                      height: "32px"
                    },
                    label: { fontWeight: 500 }
                  }}
                >
                  {totalStructuresCount} {totalStructuresCount === 1 ? "Estructura asignada" : "Estructuras asignadas"}
                </Button>
              </Popover.Target>
              <Popover.Dropdown style={{ backgroundColor: "#1a1a1a", borderColor: "#2d2d2d", padding: "12px" }}>
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: "0.5px" }}>Materiales</Text>
                <Stack gap={8}>
                  {project.structures?.map((item) => (
                    <Group key={item.id} justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="white" style={{ flex: 1, lineHeight: 1.3 }}>
                        {item.structure?.name || "Item"}
                      </Text>
                      <Badge size="xs" color="orange" variant="light" style={{ flexShrink: 0 }}>
                        {item.quantity} unidades
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}

          {/* Actions */}
          <Stack gap="xs">
            {project.status === "BUDGET" && (
              <>
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  leftSection={<FileText size={16} />}
                  onClick={handleGenerateBudget}
                  fullWidth
                >
                  Generar Presupuesto PDF
                </Button>
                <Button
                  variant="filled"
                  color="green"
                  size="sm"
                  onClick={() => setShowActivateModal(true)}
                  fullWidth
                >
                  Activar Proyecto
                </Button>
              </>
            )}

            <Group gap="xs">
              <Button
                variant="light"
                color="orange"
                size="sm"
                leftSection={<CreditCard size={16} />}
                onClick={handleViewPayments}
                style={{ flex: 1 }}
                disabled={project.status === "BUDGET"}
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
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Stack>
      </Card>

      <ProjectForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
      />

      {/* Activate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivateConfirm}
        title="Activar Proyecto"
        message="¿Desea activar este proyecto? Permitirá recibir pagos."
        confirmText="Activar"
        confirmColor="green"
        isLoading={isActivating}
        icon={<CheckCircle size={48} color="#10b981" strokeWidth={2} />}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Proyecto"
        message="¿Está seguro que desea eliminar este proyecto?"
        itemName={`${project.client.fullname} - ${project.locationAddress}`}
        isLoading={isDeleting}
      />

      {/* Payment Warning Modal */}
      <ConfirmationModal
        isOpen={showPaymentWarning}
        onClose={() => setShowPaymentWarning(false)}
        onConfirm={() => setShowPaymentWarning(false)}
        title="Proyecto No Activado"
        message="Debe activar el proyecto antes de poder agregar pagos. Active el proyecto desde el botón 'Activar Proyecto'."
        confirmText="Entendido"
        confirmColor="orange"
      />
    </>
  );
}