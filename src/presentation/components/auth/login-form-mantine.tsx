"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Stack,
  Group,
  Alert,
} from "@mantine/core";
import { IconMail, IconLock } from "@tabler/icons-react";
import { useAuthStore } from "@/src/presentation/stores";

export function LoginFormMantine() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        padding: "1.5rem",
      }}
    >
      <Container size={460} my={40}>
        <Paper
          withBorder
          shadow="xl"
          p={40}
          radius="lg"
          style={{
            backgroundColor: "#1a1a1a",
            borderColor: "#2d2d2d",
          }}
        >
          <Stack gap="lg">
            {/* Logo and Title */}
            <Group justify="center" gap="md" mb="xs">
              <Building2 size={48} color="#ff6b35" strokeWidth={2.5} />
              <div>
                <Title
                  order={1}
                  size="2rem"
                  c="#ff6b35"
                  style={{ lineHeight: 1 }}
                >
                  JCQ
                </Title>
                <Text
                  size="xs"
                  c="#9ca3af"
                  fw={500}
                  style={{ letterSpacing: "0.1em" }}
                >
                  ANDAMIOS
                </Text>
              </div>
            </Group>

            <div style={{ textAlign: "center" }}>
              <Title order={2} size="h3" mb="xs" c="white">
                Iniciar Sesión
              </Title>
              <Text size="sm" c="#9ca3af">
                Ingresa tus credenciales para acceder
              </Text>
            </div>

            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {error && (
                  <Alert color="red" variant="light" title="Error">
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Correo Electrónico"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftSection={<IconMail size={20} />}
                  size="md"
                  required
                  autoComplete="email"
                  styles={{
                    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                    input: {
                      backgroundColor: "#2d2d2d",
                      borderColor: "#404040",
                      color: "white",
                      height: "48px",
                    },
                  }}
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftSection={<IconLock size={20} />}
                  size="md"
                  required
                  autoComplete="current-password"
                  styles={{
                    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                    input: {
                      backgroundColor: "#2d2d2d",
                      borderColor: "#404040",
                      color: "white",
                      height: "48px",
                    },
                    innerInput: { color: "white" },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={isLoading}
                  mt="sm"
                  style={{ height: "48px" }}
                  color="orange"
                >
                  Ingresar
                </Button>
              </Stack>
            </form>

            <Text
              size="xs"
              c="#6b7280"
              ta="center"
              pt="md"
              style={{ borderTop: "1px solid #2d2d2d" }}
            >
              © 2025 JCQ Andamios. Todos los derechos reservados.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
