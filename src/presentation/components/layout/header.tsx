"use client";

import { useEffect, useMemo } from "react";
import { Bell, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation"; 
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
  Menu,
  ScrollArea,
  ThemeIcon,
} from "@mantine/core";
import { useDolarStore } from "@/src/presentation/stores/dolar.store";
import { useProjectsStore } from "@/src/presentation/stores/projects.store"; 

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const router = useRouter();
  
  // Store del Dólar
  const { dolar, isLoading: loadingDolar, fetchDolar, error: errorDolar } = useDolarStore();

  //Store de Proyectos
  const { projects, fetchProjects } = useProjectsStore(); 

  // Cargar datos SOLO al montar el componente (Array vacío [])
  useEffect(() => {
    fetchDolar();
    
    if (fetchProjects) {
        fetchProjects();
    }
    // IMPORTANTE: Dejar el array de dependencias vacío para evitar bucles infinitos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGICA DE NOTIFICACIONES 
  const notifications = useMemo(() => {
    // Si projects es undefined o null (mientras carga), se devuelve un array vacío
    if (!projects) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return projects.filter((project) => {
      // Ignorar terminados o borrados
      if (project.status === "FINISHED" || project.status === "DELETED") {
        return false;
      }

      const endDate = new Date(project.dateEnd);
      
      // Condición: Vence en los próximos 7 días (o antes y sigue activo)
      return endDate <= sevenDaysFromNow; 
    });
  }, [projects]);

  const hasNotifications = notifications.length > 0;

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
          {/* Valor del Dolar */}
          {!errorDolar && (
            <Tooltip label={`Actualizado: ${dolar ? new Date(dolar.fechaActualizacion).toLocaleTimeString() : ''}`} color="dark">
                <Badge 
                  variant="light" 
                  color="green" 
                  size="lg" 
                  radius="sm"
                  leftSection={loadingDolar ? <Loader color="green" size={12} /> : "💵"}
                  styles={{ root: { textTransform: 'none', cursor: 'default' } }}
                >
                  {dolar ? `Dólar : $${dolar.venta}` : 'Cargando...'}
                </Badge>
            </Tooltip>
          )}

          {action}
          
          {/* MENÚ DE NOTIFICACIONES */}
          <Menu shadow="md" width={380} position="bottom-end" withArrow>
            <Menu.Target>
              <Indicator 
                color="#ff6b35" 
                size={10} 
                offset={4} 
                disabled={!hasNotifications} 
                processing
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="md"
                  styles={{
                    root: {
                      color: hasNotifications ? "#ff6b35" : "#9ca3af",
                      "&:hover": { backgroundColor: "#2d2d2d", color: "white" },
                    },
                  }}
                >
                  <Bell size={20} />
                </ActionIcon>
              </Indicator>
            </Menu.Target>

            <Menu.Dropdown style={{ backgroundColor: '#1a1a1a', borderColor: '#2d2d2d' }}>
              <Menu.Label>Vencimientos Próximos</Menu.Label>
              
              <ScrollArea.Autosize mah={300} type="scroll">
                {hasNotifications ? (
                  notifications.map((project) => (
                    <Menu.Item
                      key={project.id}
                      onClick={() => {
                          // Ahora se envia el ID como parámetro en la URL
                          router.push(`/dashboard/projects?highlight=${project.id}`);
                        }}
                      style={{ padding: '12px', borderBottom: '1px solid #2d2d2d' }}
                    >
                      <Group wrap="nowrap" align="flex-start">
                        <ThemeIcon color="red" variant="light" size="lg" radius="sm">
                          <CalendarClock size={20} />
                        </ThemeIcon>
                        <Stack gap={2}>
                          <Text size="sm" c="white" fw={600} style={{ lineHeight: 1.2 }}>
                            {project.event.toUpperCase()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Vence: <Text span c="red.4" fw={700}>{new Date(project.dateEnd).toLocaleDateString()}</Text>
                          </Text>
                          <Text size="xs" c="orange.4" fw={700} style={{ marginTop: 4 }}>
                            ⚠️ ¡NO OLVIDES RETIRAR LAS ESTRUCTURAS!
                          </Text>
                        </Stack>
                      </Group>
                    </Menu.Item>
                  ))
                ) : (
                  <Box p="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <ThemeIcon color="gray" variant="light" size="xl" radius="xl">
                        <Bell size={24} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed" ta="center">
                      Estás al día.<br/>No hay vencimientos próximos.
                    </Text>
                  </Box>
                )}
              </ScrollArea.Autosize>
            </Menu.Dropdown>
          </Menu>

        </Group>
      </Group>
    </Box>
  );
}