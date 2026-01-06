"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, X } from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useStaffStore } from "@/src/presentation/stores/staff.store";
import type { Staff, StaffFilters } from "@/src/core/entities";
import { StaffForm } from "@/src/presentation/components/staff/staff-form";
import { StaffHoursModal } from "@/src/presentation/components/staff/staff-hours-modal"; 
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
  Avatar,
  Modal,
} from "@mantine/core";

export default function StaffPage() {
  const { 
    staffList, 
    meta, 
    isLoading, 
    fetchStaffPaginated, 
    deleteStaff 
  } = useStaffStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<StaffFilters>({
    page: 1,
    limit: 20,
    firstName: undefined,
    lastName: undefined,
    dni: undefined,
  });

  useEffect(() => {
    const cleanFilters: StaffFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof StaffFilters] = value as any;
      }
    });

    fetchStaffPaginated(cleanFilters);
  }, [fetchStaffPaginated, filters]);

  //Manejadores 

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsFormOpen(true); // Abre modal para formulario de datos
  };

  const handleLoadHours = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsHoursModalOpen(true); // Abre modal de horas
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar a este empleado?")) {
      try {
        await deleteStaff(id);
        // Refetch después de eliminar
        fetchStaffPaginated(filters);
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchStaffPaginated(filters);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 20, firstName: undefined, lastName: undefined, dni: undefined });
  };

  const getInitials = (first: string, last: string) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Box>
      <Header
        title="Personal"
        description="Gestión de empleados"
        action={
          <Button
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setSelectedStaff(null);
              setIsFormOpen(true);
            }}
          >
            Nuevo Empleado
          </Button>
        }
      />

      <Box p="xl">
        {/*Filtros*/}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por nombre..."
              value={filters.firstName || ""}
              onChange={(e) => setFilters({ ...filters, firstName: e.target.value || undefined, page: 1 })}
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
            {(filters.firstName || filters.lastName || filters.dni) && (
              <Button variant="subtle" color="red" leftSection={<X size={16} />} onClick={handleClearFilters}>
                Limpiar
              </Button>
            )}
          </Group>

          <Collapse in={showAdvancedFilters}>
            <Box p="md" style={{ backgroundColor: "#1a1a1a", borderRadius: 8, border: "1px solid #2d2d2d" }}>
              <Group grow>
                <TextInput
                  label="Apellido"
                  placeholder="Buscar..."
                  value={filters.lastName || ""}
                  onChange={(e) => setFilters({ ...filters, lastName: e.target.value || undefined, page: 1 })}
                  styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
                />
                <TextInput
                  label="DNI"
                  placeholder="Buscar..."
                  value={filters.dni || ""}
                  onChange={(e) => setFilters({ ...filters, dni: e.target.value || undefined, page: 1 })}
                  styles={{ input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, label: { color: "#9ca3af" } }}
                />
              </Group>
            </Box>
          </Collapse>
        </Stack>

        {/*Lista*/}
        {isLoading ? (
          <Box style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <Loader size="lg" color="orange" />
          </Box>
        ) : staffList.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">No se encontraron empleados</Text>
            <Button color="orange" leftSection={<Plus size={16} />} onClick={() => { setSelectedStaff(null); setIsFormOpen(true); }}>
              Crear Primer Empleado
            </Button>
          </Box>
        ) : (
          <>
            <Paper shadow="xs" radius="md" p="md" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d", overflowX: "auto" }}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#9ca3af" }}>Empleado</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Categoría</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Email</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Teléfono</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Dirección</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Antigüedad</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>DNI</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>CUIT</Table.Th>
                    <Table.Th style={{ color: "#9ca3af", textAlign: "right" }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {staffList.map((staff) => (
                    <Table.Tr key={staff.id} style={{ color: "white" }}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar color="orange" radius="xl">
                            {getInitials(staff.firstName, staff.lastName)}
                          </Avatar>
                          <Text size="sm" fw={500} c="white">
                            {staff.firstName} {staff.lastName}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {staff.category ? <Badge color="orange" variant="light" size="sm">{staff.category}</Badge> : <Text size="sm" c="dimmed">-</Text>}
                      </Table.Td>
                      <Table.Td><Text size="sm">{staff.email || "-"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{staff.numberPhone || "-"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{staff.adress || "-"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{staff.seniority || "-"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{staff.dni || "-"}</Text></Table.Td>
                      <Table.Td><Text size="sm">{staff.cuit || "-"}</Text></Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <Button size="xs" color="green" variant="filled" onClick={() => handleLoadHours(staff)}>
                            CARGAR HORAS
                          </Button>
                          <Button size="xs" color="blue" variant="filled" onClick={() => handleEdit(staff)}>
                            MODIFICAR
                          </Button>
                          <Button size="xs" color="red" variant="filled" onClick={() => handleDelete(staff.id)}>
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

      {/*MODAL DE DATOS DEL EMPLEADO */}
      <Modal 
        opened={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={selectedStaff ? "Editar Empleado" : "Nuevo Empleado"}
        size="lg"
        centered
        styles={{
          header: { backgroundColor: "#1a1a1a", color: "white" },
          content: { backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d" },
          title: { fontWeight: 'bold' },
          close: { color: "#9ca3af", '&:hover': { backgroundColor: "#2d2d2d" } }
        }}
      >
        <StaffForm initialData={selectedStaff} onClose={() => setIsFormOpen(false)} onSuccess={handleFormSuccess} />
      </Modal>

      {/* MODAL DE CARGA DE HORAS  */}
      <Modal 
        opened={isHoursModalOpen} 
        onClose={() => setIsHoursModalOpen(false)}
        title="Registro de horas por semana"
        size="70%"
        centered
        styles={{
        header: { backgroundColor: "#1a1a1a", color: "white" },
        content: { backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d" },
        title: { fontWeight: 'bold' },
        close: { color: "#9ca3af", '&:hover': { backgroundColor: "#2d2d2d" } }
      }}
      >
        <StaffHoursModal 
        staff={selectedStaff} 
        onClose={() => setIsHoursModalOpen(false)} 
        onSuccess={() => {
        setIsHoursModalOpen(false);
        fetchStaffPaginated(filters); 
        }} />
      </Modal>
    </Box>
  );
}
