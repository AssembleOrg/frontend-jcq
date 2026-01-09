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
  ChevronDown,
  ChevronUp, 
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
  Collapse,
  ScrollArea, 
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
  const [showCollaborators, setShowCollaborators] = useState(false);

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
          {project.collaborators && project.collaborators.length > 0 && (
            <Box>
              <Button 
                variant="light" 
                color="orange" 
                fullWidth 
                justify="space-between"
                onClick={() => setShowCollaborators(!showCollaborators)}
                rightSection={showCollaborators ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                styles={{
                  root: { 
                    backgroundColor: "rgba(249, 115, 22, 0.1)", 
                    color: "#f97316",
                    borderColor: "rgba(249, 115, 22, 0.2)",
                    height: "36px"
                  },
                  label: { fontWeight: 600, fontSize: "13px" }
                }}
              >
                <Group gap="xs">
                  <UsersIcon size={16} />
                  <span>{project.collaborators.length} Colaboradores Externos</span>
                </Group>
              </Button>

              {/* Contenido Desplegable */}
              <Collapse in={showCollaborators}>
                <ScrollArea.Autosize mah={250} type="auto" offsetScrollbars>
                  <Stack gap="xs" mt="xs">
                    {project.collaborators.map((item: any, index: number) => (
                      <Box 
                        key={item.id || index}
                        p="xs" 
                        style={{ 
                          backgroundColor: "#1a1a1a", 
                          borderRadius: "8px", 
                          border: "1px solid #2d2d2d",
                          borderLeft: "3px solid #f97316" 
                        }}
                      >
                        <Group justify="space-between" align="flex-start" mb={4}>
                           <Text size="sm" fw={600} c="white" style={{ flex: 1 }}>
                            {item.collaborator?.companyName || `${item.collaborator?.firstName || ""} ${item.collaborator?.lastName || ""}`.trim() || "Colaborador"}
                           </Text>
                           <Text size="xs" fw={700} c="#10b981">
                              {formatARS(item.collaborator?.valuePerHour || 0)}/hr
                           </Text>
                        </Group>

                        <Group gap="lg">
                          <Text size="xs" c="#9ca3af">
                            Personal solicitado: <Text span c="white">{item.workersCount}</Text>
                          </Text>
                          {item.hoursCount > 0 && (
                             <Text size="xs" c="#9ca3af">
                               Horas estimadas por empleado: <Text span c="white">{item.hoursCount}</Text>
                             </Text>
                          )}
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              </Collapse>
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

            {/* USD Info */}
            {project.hasUSD && project.usdValue && project.amountUSD && (
              <Box 
                p="xs" 
                style={{ 
                  backgroundColor: "rgba(34, 197, 94, 0.1)", 
                  borderRadius: "6px", 
                  border: "1px solid rgba(34, 197, 94, 0.3)" 
                }}
              >
                <Group justify="space-between" mb={4}>
                  <Group gap={4}>
                    <DollarSign size={14} color="#22c55e" />
                    <Text size="xs" c="#22c55e" fw={500}>Cotización USD</Text>
                  </Group>
                  <Text size="xs" c="#9ca3af">
                    1 USD = ${project.usdValue.toLocaleString('es-AR')}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="#22c55e">Monto en USD:</Text>
                  <Text size="sm" fw={700} c="#22c55e">
                    USD {project.amountUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </Group>
              </Box>
            )}
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