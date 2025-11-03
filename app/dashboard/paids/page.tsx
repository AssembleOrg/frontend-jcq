"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  X,
  Edit,
  Trash2,
  Calendar,
  Receipt,
  DollarSign,
} from "lucide-react";
import { Header } from "@/src/presentation/components/layout/header";
import { usePaidsStore } from "@/src/presentation/stores";
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
  NumberInput,
  Badge,
} from "@mantine/core";
import { PaginationControls } from "@/src/presentation/components/common/pagination-controls";
import { formatCurrency, formatDate } from "@/src/presentation/utils";
import type { Paid, PaidFilters } from "@/src/core/entities";

export default function PaidsPage() {
  const { paids, meta, isLoading, fetchPaids, deletePaid } = usePaidsStore();
  const [selectedPaid, setSelectedPaid] = useState<Paid | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<PaidFilters>({
    page: 1,
    limit: 20,
    projectId: undefined,
    bill: undefined,
    amountMin: undefined,
    amountMax: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  useEffect(() => {
    // Remove undefined/empty values before sending to API
    const cleanFilters: PaidFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        cleanFilters[key as keyof PaidFilters] = value as any;
      }
    });

    fetchPaids(cleanFilters);
  }, [
    filters.page,
    filters.limit,
    filters.projectId,
    filters.bill,
    filters.amountMin,
    filters.amountMax,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este pago?")) {
      await deletePaid(id);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      projectId: undefined,
      bill: undefined,
      amountMin: undefined,
      amountMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters =
    filters.projectId ||
    filters.bill ||
    filters.amountMin ||
    filters.amountMax ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <Box>
      <Header title="Pagos" description="Historial de pagos de proyectos" />

      <Box p="xl">
        {/* Filters */}
        <Stack gap="md" mb="xl">
          <Group gap="md">
            <TextInput
              placeholder="Buscar por factura..."
              value={filters.bill || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  bill: e.target.value || undefined,
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
                    label="Monto Mínimo"
                    placeholder="Ej: 50000"
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
                    placeholder="Ej: 100000"
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
                    label="Fecha Desde"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateFrom: e.target.value || undefined,
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
                    label="Fecha Hasta"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateTo: e.target.value || undefined,
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

        {/* Paids List */}
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
        ) : paids.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "3rem 0" }}>
            <Text c="#9ca3af" mb="md">
              No se encontraron pagos
            </Text>
            <Text size="sm" c="#6b7280">
              Los pagos se gestionan desde la vista de proyectos
            </Text>
          </Box>
        ) : (
          <>
            <Grid gutter="lg">
              {paids.map((paid) => (
                <Grid.Col key={paid.id} span={{ base: 12, sm: 6, md: 4 }}>
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
                        <Badge color="green" variant="light">
                          {formatCurrency(paid.amount)}
                        </Badge>
                        {paid.bill && (
                          <Badge color="blue" variant="light">
                            {paid.bill}
                          </Badge>
                        )}
                      </Group>

                      <Stack gap="xs">
                        <Group gap="xs">
                          <Calendar size={14} color="#9ca3af" />
                          <Text size="sm" c="#9ca3af">
                            {formatDate(paid.date)}
                          </Text>
                        </Group>

                        {paid.project && (
                          <Box
                            p="xs"
                            style={{
                              backgroundColor: "#0f0f0f",
                              borderRadius: 6,
                            }}
                          >
                            <Text size="sm" c="white" fw={500}>
                              {paid.project.client?.fullname || "Cliente"}
                            </Text>
                            <Text size="xs" c="#6b7280">
                              Proyecto: {formatCurrency(paid.project.amount)}
                            </Text>
                          </Box>
                        )}
                      </Stack>

                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(paid.id)}
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
    </Box>
  );
}


