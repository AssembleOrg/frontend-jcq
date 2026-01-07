"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, X, Settings } from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useStructuresStore } from "@/src/presentation/stores/structures.store";
import type { Structure, StructureFilters, StructureCategory } from "@/src/core/entities/structure-entity";
import { StructureUsageButton } from "@/src/presentation/components/structures/structure-usage-button"; 
import { StructureForm } from "@/src/presentation/components/structures/structures-form";
import { StructureCategoriesManager } from "@/src/presentation/components/structures/structure-categories-manager";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import {
  Button,
  TextInput,
  Loader,
  Box,
  Group,
  Text,
  Stack,
  Collapse,
  Badge,
  Table,
  Paper,
  Modal,
  Select,
  Tooltip,
} from "@mantine/core";

export default function StructuresPage() {
  const { 
    structuresList, 
    meta, 
    isLoading, 
    fetchStructuresPaginated, 
    deleteStructure,
    categoriesList,
    fetchCategories,
  } = useStructuresStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<StructureFilters>({
    page: 1,
    limit: 20,
    name: undefined,
    categoryId: undefined,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const cleanFilters: StructureFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof StructureFilters] = value as any;
      }
    });

    fetchStructuresPaginated(cleanFilters);
  }, [fetchStructuresPaginated, filters]);


  const handleEdit = (item: Structure) => {
    setSelectedStructure(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta estructura?")) {
      try {
        await deleteStructure(id);
        // Refetch después de eliminar
        fetchStructuresPaginated(filters);
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchStructuresPaginated(filters);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 20, name: undefined, categoryId: undefined });
  };

  const categoryOptions = categoriesList.map((cat: StructureCategory) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Box>
      <Header
        title="Estructuras"
        description="Catálogo de estructuras y stock"
        action={
          <Group gap="sm">
            <Tooltip label="Gestionar categorías">
              <Button
                variant="light"
                color="gray"
                leftSection={<Settings size={16} />}
                onClick={() => setIsCategoryModalOpen(true)}
              >
                Categorías
              </Button>
            </Tooltip>
            <Button
              color="orange"
              leftSection={<Plus size={16} />}
              onClick={() => {
                setSelectedStructure(null);
                setIsFormOpen(true);
              }}
            >
              Nueva Estructura
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por nombre..."
              value={filters.name || ""}
              onChange={(e) => setFilters({ ...filters, name: e.target.value || undefined, page: 1 })}
              style={{ flex: 1 }}
              styles={{ input: { backgroundColor: "#1a1a1a", borderColor: "#2d2d2d", color: "white" } }}
            />
            <Button
              variant={showAdvancedFilters ? "filled" : "light"}
              color="gray"
              leftSection={<Filter size={16} />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Más Filtros
            </Button>
            {(filters.name || filters.categoryId) && (
              <Button variant="subtle" color="red" leftSection={<X size={16} />} onClick={handleClearFilters}>
                Limpiar
              </Button>
            )}
          </Group>

          <Collapse in={showAdvancedFilters}>
            <Box p="md" style={{ backgroundColor: "#1a1a1a", borderRadius: 8, border: "1px solid #2d2d2d" }}>
              <Group grow>
                <Select
                  label="Categoría"
                  placeholder={categoriesList.length === 0 ? "No hay categorías" : "Buscar categoría..."}
                  data={categoryOptions}
                  value={filters.categoryId || null}
                  onChange={(value) => setFilters({ ...filters, categoryId: value || undefined, page: 1 })}
                  clearable
                  searchable
                  disabled={categoriesList.length === 0}
                  styles={{ 
                    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, 
                    label: { color: "#9ca3af" },
                    dropdown: { backgroundColor: "#1a1a1a", borderColor: "#2d2d2d" },
                    option: { color: "white" }
                  }}
                />
              </Group>
            </Box>
          </Collapse>
        </Stack>

        {isLoading ? (
          <Box style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <Loader size="lg" color="orange" />
          </Box>
        ) : structuresList.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">No se encontraron estructuras</Text>
            <Button color="orange" leftSection={<Plus size={16} />} onClick={() => { setSelectedStructure(null); setIsFormOpen(true); }}>
              Crear Primera Estructura
            </Button>
          </Box>
        ) : (
          <>
            <Paper shadow="xs" radius="md" p="md" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d", overflowX: "auto" }}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#9ca3af" }}>Nombre</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Categoría</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Medida</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Descripción</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Total</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Stock</Table.Th> 
                    <Table.Th style={{ color: "#9ca3af", textAlign: "right" }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {structuresList.map((item) => (
                    <Table.Tr key={item.id} style={{ color: "white" }}>
                      <Table.Td>
                        <Group gap="sm">
                          <Text size="sm" fw={500} c="white">
                            {item.name}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {item.category ? (
                          <Badge color="gray" variant="light" size="sm">
                            {item.category.name}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{item.measure || "-"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed" lineClamp={1} style={{ maxWidth: 200 }}>
                          {item.description || "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={700} c="blue">
                            {item.stock} unidades
                        </Text>
                    </Table.Td>
                      <Table.Td>
                         <Badge 
                          color={item.available > 0 ? "green" : "red"} 
                          variant="light"
                          size="md"
                        >
                          {item.available} unidades disp.
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <StructureUsageButton 
                            structureId={item.id} 
                            structureName={item.name} 
                          />
                          <Button size="xs" color="blue" variant="filled" onClick={() => handleEdit(item)}>
                            MODIFICAR
                          </Button>
                          <Button size="xs" color="red" variant="filled" onClick={() => handleDelete(item.id)}>
                            ELIMINAR
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>

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

      {/* Structure Form Modal */}
      <Modal 
        opened={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={selectedStructure ? "Editar Estructura" : "Nueva Estructura"}
        size="lg"
        centered
        styles={{
          header: { backgroundColor: "#1a1a1a", color: "white" },
          content: { backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d" },
          title: { fontWeight: 'bold' },
          close: { color: "#9ca3af", '&:hover': { backgroundColor: "#2d2d2d" } }
        }}
      >
        <StructureForm 
          initialData={selectedStructure} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess} 
        />
      </Modal>

      {/* Category Management Modal */}
      <Modal
        opened={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Gestionar Categorías"
        size="md"
        centered
        styles={{
          header: { backgroundColor: "#1a1a1a", color: "white" },
          content: { backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d" },
          title: { fontWeight: 'bold' },
          close: { color: "#9ca3af" }
        }}
      >
        <StructureCategoriesManager />
      </Modal>
    </Box>
  );
}