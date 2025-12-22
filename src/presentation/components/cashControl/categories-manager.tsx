"use client";

import { useState } from 'react';
import { 
  TextInput, Button, Group, Stack, Text, ActionIcon, 
  Table, ScrollArea 
} from '@mantine/core';
import { IconTrash, IconPlus, IconDeviceFloppy, IconX, IconPencil } from '@tabler/icons-react';
import { useCashControlStore } from '@/src/presentation/stores/cash-control.store';

export function CategoriesManager() {
  const { categoriesList, createCategory, updateCategory, deleteCategory, isLoading } = useCashControlStore();
  
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    if (editingId) {
      // MODO EDICIÓN
      await updateCategory(editingId, { name: categoryName });
      setEditingId(null); // Salir de modo edición
    } else {
      // MODO CREACIÓN
      await createCategory({ name: categoryName });
    }
    setCategoryName('');
  };

  const handleStartEdit = (cat: { id: string, name: string }) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName('');
  };

  return (
    <Stack>
      <Group align="end">
        <TextInput
          label={editingId ? "Editando categoría" : "Nueva categoría"}
          placeholder="Ej: Viáticos"
          value={categoryName}
          onChange={(e) => setCategoryName(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Group gap="xs">
            {editingId && (
                <Button 
                    variant="default" 
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                >
                    <IconX size={16} />
                </Button>
            )}
            <Button 
                onClick={handleSubmit} 
                loading={isLoading} 
                disabled={!categoryName.trim()}
                leftSection={editingId ? <IconDeviceFloppy size={16}/> : <IconPlus size={16}/>}
                color={editingId ? "blue" : "filled"}
            >
            {editingId ? "Guardar" : "Agregar"}
            </Button>
        </Group>
      </Group>

      <Text size="sm" fw={500} c="dimmed" mt="xs">
        Categorías existentes:
      </Text>

      <ScrollArea h={200} type="always" offsetScrollbars>
        <Table>
            <Table.Tbody>
            {categoriesList.map((cat) => (
                <Table.Tr key={cat.id}>
                <Table.Td>{cat.name}</Table.Td>
                <Table.Td style={{ width: 80 }}> 
                    <Group gap={4} justify="flex-end">
                        <ActionIcon 
                            color="blue" 
                            variant="subtle" 
                            onClick={() => handleStartEdit(cat)}
                            loading={isLoading}
                        >
                            <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon 
                            color="red" 
                            variant="subtle" 
                            onClick={() => deleteCategory(cat.id)}
                            loading={isLoading}
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