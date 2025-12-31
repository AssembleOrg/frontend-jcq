"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, X, Edit, Trash2, Users, FileText, DollarSign, NotebookPen } from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useCollaboratorsStore } from "@/src/presentation/stores/collaborators.store";
import {
  Button,
  TextInput,
  Loader,
  Box,
  Group,
  Grid,
  Text,
  Card,
  Stack,
  ActionIcon,
  Collapse,
} from "@mantine/core";
import { CollaboratorForm } from "@/src/presentation/components/collaborators/collaborator-form";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import { formatCurrency } from "@/src/presentation/utils/format-currency";
import type { Collaborator, CollaboratorFilters } from "@/src/core/entities/collaborators-entity";

export default function CollaboratorsPage() {
  const { 
    collaboratorsList, 
    meta, 
    isLoading, 
    fetchCollaborators, 
    deleteCollaborator 
  } = useCollaboratorsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<CollaboratorFilters>({
    page: 1,
    limit: 20,
    lastName: undefined,
    companyName: undefined,
    cuit: undefined,
    dni: undefined,
  });

  useEffect(() => {
    const cleanFilters: CollaboratorFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof CollaboratorFilters] = value as any;
      }
    });

    fetchCollaborators(cleanFilters, true);
  }, [fetchCollaborators, filters]);

  const handleEdit = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este colaborador?")) {
      await deleteCollaborator(id);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      lastName: undefined,
      companyName: undefined,
      cuit: undefined,
      dni: undefined,
    });
  };

  const hasActiveFilters = 
    filters.lastName || filters.companyName || filters.cuit || filters.dni;

  return (
    <Box>
      <Header
        title="Colaboradores"
        description="Gestión de colaboradores"
        action={
          <Button
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setSelectedCollaborator(null);
              setIsFormOpen(true);
            }}
          >
            Nuevo Colaborador
          </Button>
        }
      />

      <Box p="xl">
        {/* Filters Section */}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por apellido o razón social..."
              value={filters.lastName || filters.companyName || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  lastName: e.target.value || undefined,
                  page: 1,
                })
              }
              style={{ flex: 1 }}
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
                Limpiar
              </Button>
            )}
          </Group>

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
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="Razón Social"
                    placeholder="Empresa..."
                    value={filters.companyName || ""}
                    onChange={(e) => setFilters({ ...filters, companyName: e.target.value, page: 1 })}
                    styles={{ input: { backgroundColor: "#0f0f0f", color: "white" }, label: { color: "#9ca3af" } }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="CUIT"
                    placeholder="20..."
                    value={filters.cuit || ""}
                    onChange={(e) => setFilters({ ...filters, cuit: e.target.value, page: 1 })}
                    styles={{ input: { backgroundColor: "#0f0f0f", color: "white" }, label: { color: "#9ca3af" } }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="DNI"
                    placeholder="30..."
                    value={filters.dni || ""}
                    onChange={(e) => setFilters({ ...filters, dni: e.target.value, page: 1 })}
                    styles={{ input: { backgroundColor: "#0f0f0f", color: "white" }, label: { color: "#9ca3af" } }}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Collapse>
        </Stack>

        {/* List Section */}
        {isLoading ? (
          <Box style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <Loader size="lg" color="orange" />
          </Box>
        ) : collaboratorsList.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">No se encontraron colaboradores registrados</Text>
          </Box>
        ) : (
          <>
            <Grid gutter="lg">
              {collaboratorsList.map((collab) => (
                <Grid.Col key={collab.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    padding="lg"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 12,
                      border: "1px solid #2d2d2d",
                    }}
                  >
                    <Stack gap="md">
                      <Box>
                        <Text size="lg" fw={700} c="white" style={{ fontFamily: "var(--font-montserrat)" }}>
                          {collab.companyName || `${collab.firstName} ${collab.lastName}`}
                        </Text>
                        <Text size="xs" c="orange" fw={500}>
                          {collab.companyName ? "Empresa / Razón Social" : "Persona Física"}
                        </Text>
                      </Box>

                      <Stack gap="xs">
                        <Group gap="xs">
                          <FileText size={14} color="#9ca3af" />
                          <Text size="sm" c="#9ca3af">
                            {collab.cuit ? `CUIT: ${collab.cuit}` : `DNI: ${collab.dni}`}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Users size={14} color="#9ca3af" />
                          <Text size="sm" c="#9ca3af">
                            Personal disponible: {collab.quantityWorkers}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <DollarSign size={14} color="#40c057" />
                          <Text size="sm" fw={600} c="#40c057">
                            {formatCurrency(collab.valuePerHour)} / hora
                          </Text>
                        </Group>
                        {collab.notes && (
                          <Group gap="xs" align="flex-start">
                            <NotebookPen size={14} color="#4c32e4ff" style={{ marginTop: 3 }} />
                            <Text size="sm" c="#d1d5db" lineClamp={2} style={{ flex: 1 }}>
                              {collab.notes}
                            </Text>
                          </Group>
                        )}
                      </Stack>
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon variant="light" color="blue" onClick={() => handleEdit(collab)}>
                          <Edit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" onClick={() => handleDelete(collab.id)}>
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            <Box mt="xl">
              <PaginationControls
                meta={meta}
                currentPage={filters.page || 1}
                currentLimit={filters.limit || 20}
                onPageChange={(page) => setFilters({ ...filters, page })}
                onLimitChange={(limit) => setFilters({ ...filters, limit, page: 1 })}
              />
            </Box>
          </>
        )}
      </Box>

      <CollaboratorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCollaborator(null);
        }}
        collaborator={selectedCollaborator!}
      />
    </Box>
  );
}