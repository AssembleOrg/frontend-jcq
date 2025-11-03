"use client";

import { useEffect } from "react";
import { Header } from "@/src/presentation/components/layout/header";
import {
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Box,
  Paper,
} from "@mantine/core";
import {
  useProjectsStore,
  useClientsStore,
  usePaidsStore,
} from "@/src/presentation/stores";
import { FolderKanban, Users, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/src/presentation/utils";

export default function DashboardPage() {
  const { projects, fetchProjects } = useProjectsStore();
  const { clients, fetchAllClients } = useClientsStore();
  const { paids, fetchPaids } = usePaidsStore();

  useEffect(() => {
    fetchProjects({ status: "ACTIVE" });
    fetchAllClients();
    fetchPaids();
  }, []);

  const activeProjects = projects.filter(
    (p) => p.status === "ACTIVE" || p.status === "IN_PROCESS"
  );
  const totalRevenue = projects.reduce((sum, p) => sum + p.totalPaid, 0);
  const pendingAmount = projects.reduce((sum, p) => sum + p.rest, 0);

  const stats = [
    {
      title: "Proyectos Activos",
      value: activeProjects.length,
      icon: FolderKanban,
      color: "#ff6b35",
      bgColor: "#2d1810",
    },
    {
      title: "Total Clientes",
      value: clients.length,
      icon: Users,
      color: "#3b82f6",
      bgColor: "#1e293b",
    },
    {
      title: "Cobrado Total",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Pendiente",
      value: formatCurrency(pendingAmount),
      icon: CreditCard,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
  ];

  return (
    <Box>
      <Header
        title="Dashboard"
        description="Resumen general de proyectos y finanzas"
      />

      <Box p="xl">
        {/* Stats Grid */}
        <Grid gutter="lg" mb="xl">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid.Col
                key={stat.title}
                span={{ base: 12, xs: 6, sm: 6, md: 3 }}
              >
                <Card
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderColor: "#2d2d2d",
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text size="sm" c="#9ca3af">
                        {stat.title}
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        {stat.value}
                      </Text>
                    </Stack>
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      style={{
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                      }}
                    >
                      <Icon size={24} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>

        {/* Recent Projects */}
        <Card
          padding="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: "#1a1a1a",
            borderColor: "#2d2d2d",
          }}
        >
          <Text size="lg" fw={600} c="white" mb="md">
            Proyectos Recientes
          </Text>

          {activeProjects.length === 0 ? (
            <Text ta="center" c="#9ca3af" py="xl">
              No hay proyectos activos
            </Text>
          ) : (
            <Stack gap="md">
              {activeProjects.slice(0, 5).map((project) => (
                <Paper
                  key={project.id}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#2d2d2d",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d2d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#0a0a0a";
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={500} c="white">
                        {project.client.fullname}
                      </Text>
                      <Text size="sm" c="#9ca3af">
                        {project.locationAddress}
                      </Text>
                    </Stack>
                    <Stack gap={4} align="flex-end">
                      <Text fw={600} c="white">
                        {formatCurrency(project.amount)}
                      </Text>
                      <Text size="sm" c="#9ca3af">
                        Pagado: {formatCurrency(project.totalPaid)}
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Card>
      </Box>
    </Box>
  );
}
