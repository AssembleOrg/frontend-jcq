"use client";

import { useState } from 'react';
import { 
  TextInput, Button, Group, Stack, Text, ActionIcon, 
  Table, ScrollArea, Textarea
} from '@mantine/core';
import { IconTrash, IconPlus, IconDeviceFloppy, IconX, IconPencil } from '@tabler/icons-react';
import { useStructuresStore } from '@/src/presentation/stores/structures.store';
import type { StructureCategory } from '@/src/core/entities/structure-entity';

export function StructureCategoriesManager() {
  const { categoriesList, createCategory, updateCategory, deleteCategory, isCategoriesLoading } = useStructuresStore();
  
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    if (editingId) {
      // MODO EDICIÓN
      await updateCategory(editingId, { 
        name: categoryName,
        description: categoryDescription || undefined 
      });
      setEditingId(null);
    } else {
      // MODO CREACIÓN
      await createCategory({ 
        name: categoryName,
        description: categoryDescription || undefined 
      });
    }
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleStartEdit = (cat: StructureCategory) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      await deleteCategory(id);
    }
  };

  return (
    <Stack>
      <Stack gap="xs">
        <TextInput
          label={editingId ? "Editando categoría" : "Nueva categoría"}
          placeholder="Ej: Andamios Tubulares"
          value={categoryName}
          onChange={(e) => setCategoryName(e.currentTarget.value)}
          styles={{ 
            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, 
            label: { color: "#9ca3af" } 
          }}
        />
        <Textarea
          label="Descripción (opcional)"
          placeholder="Descripción de la categoría..."
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.currentTarget.value)}
          minRows={2}
          autosize
          styles={{ 
            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }, 
            label: { color: "#9ca3af" } 
          }}
        />
        <Group gap="xs" justify="flex-end">
          {editingId && (
            <Button 
              variant="default" 
              onClick={handleCancelEdit}
              disabled={isCategoriesLoading}
              styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}
            >
              <IconX size={16} />
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            loading={isCategoriesLoading} 
            disabled={!categoryName.trim()}
            leftSection={editingId ? <IconDeviceFloppy size={16}/> : <IconPlus size={16}/>}
            color={editingId ? "blue" : "orange"}
          >
            {editingId ? "Guardar" : "Agregar"}
          </Button>
        </Group>
      </Stack>

      <Text size="sm" fw={500} c="dimmed" mt="xs">
        Categorías existentes ({categoriesList.length}):
      </Text>

      <ScrollArea h={250} type="always" offsetScrollbars>
        <Table>
          <Table.Tbody>
            {categoriesList.map((cat) => (
              <Table.Tr key={cat.id} style={{ backgroundColor: editingId === cat.id ? 'rgba(255, 107, 53, 0.1)' : undefined }}>
                <Table.Td>
                  <Text size="sm" fw={500} c="white">{cat.name}</Text>
                  {cat.description && (
                    <Text size="xs" c="dimmed">{cat.description}</Text>
                  )}
                </Table.Td>
                <Table.Td style={{ width: 80 }}> 
                  <Group gap={4} justify="flex-end">
                    <ActionIcon 
                      color="blue" 
                      variant="subtle" 
                      onClick={() => handleStartEdit(cat)}
                      disabled={isCategoriesLoading}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => handleDelete(cat.id)}
                      disabled={isCategoriesLoading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {categoriesList.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={2} align="center">
                  <Text size="xs" c="dimmed">No hay categorías creadas</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
