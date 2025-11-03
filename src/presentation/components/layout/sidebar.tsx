"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserCog,
  LogOut,
  Building2,
  X,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "@/src/presentation/stores";
import {
  Stack,
  Text,
  Button,
  Box,
  Group,
  Title,
  ActionIcon,
  Drawer,
} from "@mantine/core";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUBADMIN", "MANAGER"],
  },
  {
    name: "Proyectos",
    href: "/dashboard/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "SUBADMIN", "MANAGER"],
  },
  {
    name: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["ADMIN", "SUBADMIN", "MANAGER"],
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: UserCog,
    roles: ["ADMIN", "SUBADMIN"],
  },
  {
    name: "Pagos",
    href: "/dashboard/paids",
    icon: DollarSign,
    roles: ["ADMIN", "SUBADMIN", "MANAGER"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpened, setMobileOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debug: log user info
  useEffect(() => {
    console.log("👤 Current User:", user);
    console.log("🔑 User Role:", user?.role);
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  // Debug: mostrar siempre algo si no hay navegación filtrada
  const displayNavigation =
    filteredNavigation.length > 0 ? filteredNavigation : navigation;

  const handleNavClick = (href: string) => {
    router.push(href);
    if (isMobile) {
      setMobileOpened(false);
    }
  };

  const SidebarContent = () => (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1a1a1a",
      }}
    >
      {/* Logo */}
      <Box
        p="xl"
        style={{
          borderBottom: "1px solid #2d2d2d",
        }}
      >
        <Group gap="md" justify="space-between">
          <Group gap="md">
            <Building2 size={40} color="#ff6b35" strokeWidth={2.5} />
            <div>
              <Title
                order={3}
                c="#ff6b35"
                style={{ lineHeight: 1, fontWeight: 900 }}
              >
                JCQ
              </Title>
              <Text
                size="xs"
                c="#9ca3af"
                fw={600}
                style={{ letterSpacing: "0.15em" }}
              >
                ANDAMIOS
              </Text>
            </div>
          </Group>
          {isMobile && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setMobileOpened(false)}
            >
              <X size={20} />
            </ActionIcon>
          )}
        </Group>
      </Box>

      {/* Navigation */}
      <Box p="md" style={{ flex: 1, overflowY: "auto" }}>
        {displayNavigation.length === 0 ? (
          <Text c="white" size="sm" p="md">
            Cargando navegación... (Role: {user?.role || "no role"})
          </Text>
        ) : (
          <Stack gap="xs">
            {displayNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "filled" : "subtle"}
                  color={isActive ? "orange" : "gray"}
                  fullWidth
                  leftSection={<Icon size={20} />}
                  justify="flex-start"
                  onClick={() => handleNavClick(item.href)}
                  styles={{
                    root: {
                      height: 48,
                      padding: "0 16px",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                    },
                    label: {
                      color: isActive ? "white" : "#e5e7eb",
                    },
                    section: {
                      marginRight: 12,
                      color: isActive ? "white" : "#9ca3af",
                    },
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* User section */}
      <Box
        p="md"
        style={{
          borderTop: "1px solid #2d2d2d",
        }}
      >
        <Box
          p="md"
          mb="md"
          style={{
            backgroundColor: "#2d2d2d",
            borderRadius: "8px",
          }}
        >
          <Text size="sm" fw={500} c="white">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text size="xs" c="#9ca3af" truncate>
            {user?.email}
          </Text>
          <Text size="xs" c="#ff6b35" mt={4} fw={600}>
            {user?.role}
          </Text>
        </Box>
        <Button
          variant="light"
          color="red"
          fullWidth
          leftSection={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="aside"
          style={{
            height: "100vh",
            width: 280,
            backgroundColor: "#1a1a1a",
            position: "fixed",
            left: 0,
            top: 0,
            borderRight: "1px solid #2d2d2d",
            zIndex: 1000,
            boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
          }}
        >
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <ActionIcon
          variant="filled"
          color="orange"
          size="lg"
          onClick={() => setMobileOpened(true)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 999,
          }}
        >
          <Building2 size={24} />
        </ActionIcon>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          opened={mobileOpened}
          onClose={() => setMobileOpened(false)}
          size={280}
          padding={0}
          withCloseButton={false}
          styles={{
            content: {
              backgroundColor: "#1a1a1a",
            },
            body: {
              padding: 0,
              height: "100%",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}
    </>
  );
}
