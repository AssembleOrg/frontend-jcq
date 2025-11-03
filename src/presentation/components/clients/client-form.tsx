"use client";

import { useState, useEffect } from "react";
import type {
  Client,
  CreateClientDto,
  UpdateClientDto,
} from "@/src/core/entities";
import { useClientsStore } from "@/src/presentation/stores";
import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  Grid,
  Text,
} from "@mantine/core";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

export function ClientForm({ isOpen, onClose, client }: ClientFormProps) {
  const { createClient, updateClient, isLoading } = useClientsStore();

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    cuit: "",
    dni: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        fullname: client.fullname,
        phone: client.phone,
        cuit: client.cuit || "",
        dni: client.dni || "",
      });
    } else {
      setFormData({
        fullname: "",
        phone: "",
        cuit: "",
        dni: "",
      });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cuit && !formData.dni) {
      alert("Debe ingresar CUIT o DNI");
      return;
    }

    try {
      const data = {
        fullname: formData.fullname,
        phone: formData.phone,
        cuit: formData.cuit || undefined,
        dni: formData.dni || undefined,
      };

      if (client) {
        await updateClient(client.id, data as UpdateClientDto);
      } else {
        await createClient(data as CreateClientDto);
      }

      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

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
      title={client ? "Editar Cliente" : "Nuevo Cliente"}
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
          <TextInput
            label="Nombre/Razón Social"
            placeholder="Constructora ABC S.A."
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            required
            styles={inputStyles}
          />

          <TextInput
            label="Teléfono"
            placeholder="11 1234-5678"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
            styles={inputStyles}
          />

          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="CUIT"
                placeholder="20123456789"
                value={formData.cuit}
                onChange={(e) =>
                  setFormData({ ...formData, cuit: e.target.value })
                }
                styles={inputStyles}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="DNI"
                placeholder="12345678"
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                styles={inputStyles}
              />
            </Grid.Col>
          </Grid>

          <Text size="xs" c="#9ca3af">
            * Debe ingresar al menos CUIT o DNI
          </Text>

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
              {client ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
