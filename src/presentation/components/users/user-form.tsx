"use client";

import { useState, useEffect } from "react";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserRole,
} from "@/src/core/entities";
import { useUsersStore } from "@/src/presentation/stores/users.store";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Group,
  Stack,
  Grid,
} from "@mantine/core";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export function UserForm({ isOpen, onClose, user }: UserFormProps) {
  const { createUser, updateUser, isLoading } = useUsersStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "MANAGER" as UserRole,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "MANAGER",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user) {
        const data: UpdateUserDto = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        };
        await updateUser(user.id, data);
      } else {
        const data: CreateUserDto = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        };
        await createUser(data);
      }

      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const roleOptions = [
    { value: "MANAGER", label: "Manager" },
    { value: "SUBADMIN", label: "Sub Admin" },
    { value: "ADMIN", label: "Admin" },
  ];

  const inputStyles = {
    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
    input: {
      backgroundColor: "#2d2d2d",
      borderColor: "#404040",
      color: "white",
    },
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={user ? "Editar Usuario" : "Nuevo Usuario"}
      styles={{
        content: {
          backgroundColor: "#1a1a1a",
        },
        header: {
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2d2d2d",
        },
        title: {
          color: "white",
          fontSize: "1.25rem",
          fontWeight: 600,
        },
        body: {
          padding: "1.5rem",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                styles={inputStyles}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            styles={inputStyles}
          />

          {!user && (
            <TextInput
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              styles={inputStyles}
            />
          )}

          <Select
            label="Rol"
            data={roleOptions}
            value={formData.role}
            onChange={(value) =>
              setFormData({ ...formData, role: value as UserRole })
            }
            required
            styles={inputStyles}
          />

          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              variant="subtle"
              color="gray"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" color="orange" loading={isLoading}>
              {user ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
