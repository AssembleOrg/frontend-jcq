"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, X, Edit, Trash2 } from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useUsersStore } from "@/src/presentation/stores";
import {
  Button,
  TextInput,
  Select,
  Loader,
  Box,
  Group,
  Grid,
  Text,
  Card,
  Stack,
  Badge,
  ActionIcon,
  Collapse,
} from "@mantine/core";
import { UserForm } from "@/src/presentation/components/users/user-form";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import type { User, UserFilters, UserRole } from "@/src/core/entities";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SUBADMIN", label: "Subadministrador" },
  { value: "MANAGER", label: "Manager" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function UsersPage() {
  const { users, meta, isLoading, fetchUsers, deleteUser } = useUsersStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    email: undefined,
    firstName: undefined,
    lastName: undefined,
    role: undefined,
    isActive: undefined,
  });

  useEffect(() => {
    // Remove undefined/empty values before sending to API
    const cleanFilters: UserFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof UserFilters] = value as any;
      }
    });

    fetchUsers(cleanFilters);
  }, [
    filters.page,
    filters.limit,
    filters.email,
    filters.firstName,
    filters.lastName,
    filters.role,
    filters.isActive,
  ]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      await deleteUser(id);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      email: undefined,
      firstName: undefined,
      lastName: undefined,
      role: undefined,
      isActive: undefined,
    });
  };

  const hasActiveFilters =
    filters.email ||
    filters.firstName ||
    filters.lastName ||
    filters.role ||
    filters.isActive !== undefined;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "SUBADMIN":
        return "orange";
      case "MANAGER":
        return "blue";
      default:
        return "gray";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "SUBADMIN":
        return "Subadministrador";
      case "MANAGER":
        return "Manager";
      default:
        return role;
    }
  };

  return (
    <Box>
      <Header
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        action={
          <Button
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setSelectedUser(null);
              setIsFormOpen(true);
            }}
          >
            Nuevo Usuario
          </Button>
        }
      />

      <Box p="xl">
        {/* Filters */}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por email..."
              value={filters.email || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  email: e.target.value || undefined,
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

            <Select
              placeholder="Rol"
              data={ROLE_OPTIONS}
              value={filters.role || null}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  role: value as UserRole | undefined,
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

            <Select
              placeholder="Estado"
              data={ACTIVE_OPTIONS}
              value={filters.isActive?.toString() || null}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  isActive: value ? value === "true" : undefined,
                  page: 1,
                })
              }
              clearable
              style={{ width: 150 }}
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
              Más Filtros
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
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nombre"
                    placeholder="Buscar por nombre..."
                    value={filters.firstName || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        firstName: e.target.value || undefined,
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

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Apellido"
                    placeholder="Buscar por apellido..."
                    value={filters.lastName || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        lastName: e.target.value || undefined,
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

        {/* Users List */}
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
        ) : users.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">
              No se encontraron usuarios
            </Text>
            <Button
              color="orange"
              leftSection={<Plus size={16} />}
              onClick={() => {
                setSelectedUser(null);
                setIsFormOpen(true);
              }}
            >
              Crear Primer Usuario
            </Button>
          </Box>
        ) : (
          <>
            <Grid gutter="lg">
              {users.map((user) => (
                <Grid.Col key={user.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    padding="lg"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 12,
                      border: "1px solid #2d2d2d",
                    }}
                  >
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Badge
                          color={getRoleBadgeColor(user.role)}
                          variant="light"
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge
                          color={user.isActive ? "green" : "gray"}
                          variant="light"
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </Group>

                      <Stack gap="xs">
                        <Text
                          size="lg"
                          fw={700}
                          c="white"
                          style={{ fontFamily: "var(--font-montserrat)" }}
                        >
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text size="sm" c="#9ca3af">
                          {user.email}
                        </Text>
                      </Stack>

                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
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

      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
}
