"use client";

import { useEffect, useState, Suspense } from "react"; //importar suspense
import { useSearchParams } from "next/navigation"; // Necesaria para leer la URL
import {
  Plus,
  Filter,
  X
} from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useProjectsStore } from "@/src/presentation/stores";
import {
  Button,
  TextInput,
  Select,
  Loader,
  Box,
  Group,
  Grid,
  Text,
  NumberInput,
  Collapse,
  Stack,
} from "@mantine/core";
import { ProjectCard } from "@/src/presentation/components/projects/project-card";
import { ProjectForm } from "@/src/presentation/components/projects/project-form";
import { PaymentsModal } from "@/src/presentation/components/projects/payments-modal";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import type {
  Project,
  ProjectStatus,
  ProjectFilters,
} from "@/src/core/entities";

const STATUS_OPTIONS = [
  { value: "BUDGET", label: "Presupuesto" },
  { value: "ACTIVE", label: "Activo" },
  { value: "IN_PROCESS", label: "En Proceso" },
  { value: "FINISHED", label: "Finalizado" },
];

function ProjectsContent() {
  const { projects, meta, isLoading, fetchProjects } = useProjectsStore();
  const searchParams = useSearchParams(); // Hook para leer parametros
  const highlightId = searchParams.get('highlight'); // ID del proyecto a resaltar

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 20,
    status: undefined,
    clientId: undefined,
    workersMin: undefined,
    workersMax: undefined,
    dateInitFrom: undefined,
    dateInitTo: undefined,
    amountMin: undefined,
    amountMax: undefined,
  });

  useEffect(() => {
    // Remove undefined/empty values before sending to API
    const cleanFilters: ProjectFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof ProjectFilters] = value as never;
      }
    });

    fetchProjects(cleanFilters);
  }, [
    fetchProjects,
    filters.page,
    filters.limit,
    filters.status,
    filters.clientId,
    filters.workersMin,
    filters.workersMax,
    filters.dateInitFrom,
    filters.dateInitTo,
    filters.amountMin,
    filters.amountMax,
  ]);

  // Refetch when payments modal closes to update project data
  useEffect(() => {
    if (!isPaymentsOpen && selectedProject) {
      // Modal closed, refetch to update data
      const cleanFilters: ProjectFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          cleanFilters[key as keyof ProjectFilters] = value as never;
        }
      });
      fetchProjects(cleanFilters);
    }
  }, [isPaymentsOpen]);

  const handleViewPayments = (project: Project) => {
    setSelectedProject(project);
    setIsPaymentsOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: undefined,
      clientId: undefined,
      workersMin: undefined,
      workersMax: undefined,
      dateInitFrom: undefined,
      dateInitTo: undefined,
      amountMin: undefined,
      amountMax: undefined,
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.clientId ||
    filters.workersMin ||
    filters.workersMax ||
    filters.dateInitFrom ||
    filters.dateInitTo ||
    filters.amountMin ||
    filters.amountMax;

  return (
    <Box>
      <Header
        title="Proyectos"
        description="Gestión de proyectos y presupuestos"
        action={
          <Button
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => setIsFormOpen(true)}
          >
            Nuevo Proyecto
          </Button>
        }
      />

      <Box p="xl">
        {/* Basic Filters */}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <Select
              placeholder="Estado"
              data={STATUS_OPTIONS}
              value={filters.status || null}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  status: value as ProjectStatus | undefined,
                  page: 1,
                })
              }
              clearable
              style={{ width: 200 }}
              styles={{
                input: {
                  backgroundColor: "#1a1a1a",
                  borderColor: "#2d2d2d",
                  color: "white",
                },
              }}
            />

            <Button
              variant={showAdvancedFilters ? "filled" : "light"}
              color="gray"
              leftSection={<Filter size={16} />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Filtros Avanzados
            </Button>

            {hasActiveFilters && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<X size={16} />}
                onClick={handleClearFilters}
              >
                Limpiar Filtros
              </Button>
            )}
          </Group>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Box
              p="md"
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 8,
                border: "1px solid #2d2d2d",
              }}
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    label="Trabajadores Mín"
                    placeholder="Ej: 10"
                    value={filters.workersMin || ""}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        workersMin: value as number | undefined,
                        page: 1,
                      })
                    }
                    min={0}
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    label="Trabajadores Máx"
                    placeholder="Ej: 20"
                    value={filters.workersMax || ""}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        workersMax: value as number | undefined,
                        page: 1,
                      })
                    }
                    min={0}
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    label="Monto Mínimo"
                    placeholder="Ej: 100000"
                    value={filters.amountMin || ""}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        amountMin: value as number | undefined,
                        page: 1,
                      })
                    }
                    min={0}
                    prefix="$"
                    thousandSeparator="."
                    decimalSeparator=","
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    label="Monto Máximo"
                    placeholder="Ej: 500000"
                    value={filters.amountMax || ""}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        amountMax: value as number | undefined,
                        page: 1,
                      })
                    }
                    min={0}
                    prefix="$"
                    thousandSeparator="."
                    decimalSeparator=","
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <TextInput
                    label="Fecha Inicio Desde"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    value={filters.dateInitFrom || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateInitFrom: e.target.value || undefined,
                        page: 1,
                      })
                    }
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <TextInput
                    label="Fecha Inicio Hasta"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    value={filters.dateInitTo || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateInitTo: e.target.value || undefined,
                        page: 1,
                      })
                    }
                    styles={{
                      input: {
                        backgroundColor: "#0f0f0f",
                        borderColor: "#2d2d2d",
                        color: "white",
                      },
                      label: { color: "#9ca3af" },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Collapse>
        </Stack>

        {/* Projects Grid */}
        {isLoading ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "3rem 0",
            }}
          >
            <Loader size="lg" color="orange" />
          </Box>
        ) : projects.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">
              No se encontraron proyectos
            </Text>
            <Button
              color="orange"
              leftSection={<Plus size={16} />}
              onClick={() => setIsFormOpen(true)}
            >
              Crear Primer Proyecto
            </Button>
          </Box>
        ) : (
          <>
            <Grid gutter="lg">
              {projects.map((project) => {
                // Lógica de resaltado
                const isHighlighted = project.id === highlightId;
                
                return (
                  <Grid.Col 
                    key={project.id} 
                    span={{ base: 12, sm: 6, lg: 4 }}
                    style={isHighlighted ? {
                      transform: 'scale(1.02)',
                      border: '2px solid #ff6b35', // Borde naranja brillante
                      borderRadius: '16px', 
                      boxShadow: '0 0 25px rgba(255, 107, 53, 0.3)', // Efecto de resplandor
                      zIndex: 2,
                      transition: 'all 0.3s ease'
                    } : {
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ProjectCard
                      project={project}
                      onViewPayments={handleViewPayments}
                    />
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Pagination Controls - ALWAYS VISIBLE */}
            <Box mt="xl">
              <PaginationControls
                meta={meta}
                currentPage={filters.page || 1}
                currentLimit={filters.limit || 20}
                onPageChange={(page) => setFilters({ ...filters, page })}
                onLimitChange={(limit) =>
                  setFilters({ ...filters, limit, page: 1 })
                }
              />
            </Box>
          </>
        )}
      </Box>

      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <PaymentsModal
        isOpen={isPaymentsOpen}
        onClose={() => setIsPaymentsOpen(false)}
        project={selectedProject}
        onPaymentChange={() => {
          // Refetch projects when a payment is added/deleted
          const cleanFilters: ProjectFilters = {};
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
              cleanFilters[key as keyof ProjectFilters] = value as never;
            }
          });
          fetchProjects(cleanFilters);
        }}
      />
    </Box>
  );
}

//Fix para deployment
export default function ProjectsPage() {
  return (
    <Suspense 
      fallback={
        <Box style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader color="orange" size="xl" />
        </Box>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}