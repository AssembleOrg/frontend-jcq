"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, X, Edit, Trash2, Phone, FileText } from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { useClientsStore } from "@/src/presentation/stores";
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
import { ClientForm } from "@/src/presentation/components/clients/client-form";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import type { Client, ClientFilters } from "@/src/core/entities";

export default function ClientsPage() {
  const { clients, meta, isLoading, fetchClients, deleteClient } =
    useClientsStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 20,
    fullname: undefined,
    phone: undefined,
    cuit: undefined,
    dni: undefined,
  });

  useEffect(() => {
    // Remove undefined/empty values before sending to API
    const cleanFilters: ClientFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof ClientFilters] = value as any;
      }
    });

    fetchClients(cleanFilters);
  }, [
    filters.page,
    filters.limit,
    filters.fullname,
    filters.phone,
    filters.cuit,
    filters.dni,
  ]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteClient(id);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      fullname: undefined,
      phone: undefined,
      cuit: undefined,
      dni: undefined,
    });
  };

  const hasActiveFilters =
    filters.fullname || filters.phone || filters.cuit || filters.dni;

  return (
    <Box>
      <Header
        title="Clientes"
        description="Gestión de clientes"
        action={
          <Button
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setSelectedClient(null);
              setIsFormOpen(true);
            }}
          >
            Nuevo Cliente
          </Button>
        }
      />

      <Box p="xl">
        {/* Filters */}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por nombre..."
              value={filters.fullname || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  fullname: e.target.value || undefined,
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
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="Teléfono"
                    placeholder="Buscar por teléfono..."
                    value={filters.phone || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        phone: e.target.value || undefined,
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

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="CUIT"
                    placeholder="Buscar por CUIT..."
                    value={filters.cuit || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        cuit: e.target.value || undefined,
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

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <TextInput
                    label="DNI"
                    placeholder="Buscar por DNI..."
                    value={filters.dni || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dni: e.target.value || undefined,
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

        {/* Clients List */}
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
        ) : clients.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">
              No se encontraron clientes
            </Text>
            <Button
              color="orange"
              leftSection={<Plus size={16} />}
              onClick={() => {
                setSelectedClient(null);
                setIsFormOpen(true);
              }}
            >
              Crear Primer Cliente
            </Button>
          </Box>
        ) : (
          <>
            <Grid gutter="lg">
              {clients.map((client) => (
                <Grid.Col key={client.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    padding="lg"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 12,
                      border: "1px solid #2d2d2d",
                    }}
                  >
                    <Stack gap="md">
                      <Text
                        size="lg"
                        fw={700}
                        c="white"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        {client.fullname}
                      </Text>

                      <Stack gap="xs">
                        <Group gap="xs">
                          <Phone size={14} color="#9ca3af" />
                          <Text size="sm" c="#9ca3af">
                            {client.phone}
                          </Text>
                        </Group>

                        {client.cuit && (
                          <Group gap="xs">
                            <FileText size={14} color="#9ca3af" />
                            <Text size="sm" c="#9ca3af">
                              CUIT: {client.cuit}
                            </Text>
                          </Group>
                        )}

                        {client.dni && (
                          <Group gap="xs">
                            <FileText size={14} color="#9ca3af" />
                            <Text size="sm" c="#9ca3af">
                              DNI: {client.dni}
                            </Text>
                          </Group>
                        )}
                      </Stack>

                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(client.id)}
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

      <ClientForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
    </Box>
  );
}
