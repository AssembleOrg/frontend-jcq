"use client";

import { useEffect } from "react"; //
import { Bell } from "lucide-react";
import {
  Group,
  Title,
  Text,
  ActionIcon,
  Indicator,
  Box,
  Stack,
  Badge,
  Loader,
  Tooltip,
} from "@mantine/core";
import { useDolarStore } from "@/src/presentation/stores/dolar.store"; 

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const { dolar, isLoading, fetchDolar, error } = useDolarStore();

  // Pedir la cotización al montar el componente
  useEffect(() => {
    fetchDolar();
  }, [fetchDolar]);

  return (
    <Box
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #2d2d2d",
        padding: "1.5rem 2rem",
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Title order={2} c="white" size="1.75rem">
            {title}
          </Title>
          {description && (
            <Text size="sm" c="#9ca3af">
              {description}
            </Text>
          )}
        </Stack>

        <Group gap="md">
          {/* Inicio de la implementacion del valor del Dolar */}
          {/* Mostrar solo el valor si no hay error */}
          {!error && (
            <Tooltip label={`Actualizado: ${dolar ? new Date(dolar.fechaActualizacion).toLocaleTimeString() : ''}`} color="dark">
                <Badge 
                  variant="light" 
                  color="green" 
                  size="lg" 
                  radius="sm"
                  leftSection={isLoading ? <Loader color="green" size={12} /> : "💵"}
                  styles={{ root: { textTransform: 'none', cursor: 'default' } }}
                >
                  {dolar ? `Dólar : $${dolar.venta}` : 'Cargando...'}
                </Badge>
            </Tooltip>
          )}

          {action}
          
          <Indicator color="#ff6b35" size={8} offset={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              styles={{
                root: {
                  color: "#9ca3af",
                  "&:hover": { backgroundColor: "#2d2d2d", color: "white" },
                },
              }}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>
        </Group>
      </Group>
    </Box>
  );
}