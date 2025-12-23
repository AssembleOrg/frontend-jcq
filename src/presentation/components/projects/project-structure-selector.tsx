"use client";

import { useEffect, useState } from "react";
import { 
  Select, 
  Group, 
  Text, 
  Button, 
  ActionIcon, 
  Stack,  
  Loader, 
  Paper
} from "@mantine/core";
import { Plus, Minus, Trash, Package } from "lucide-react";
import { structuresApi } from "@/src/infrastructure/api/structures.api";
import type { Structure } from "@/src/core/entities";

export interface SelectedItem {
  structureId: string;
  name: string;
  quantity: number;
  maxStock: number;
}

interface Props {
  value: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
}

export function ProjectStructuresSelector({ value, onChange }: Props) {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Pedimos todas las estructuras para tener la info actualizada de stock/available
        const data = await structuresApi.getAll({ limit: 100 });
        setStructures(data);
      } catch (e) {
        console.error("Error cargando estructuras", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddStructure = () => {
    if (!selectedId) return;

    const structure = structures.find((s) => s.id === selectedId);
    if (!structure) return;

    // Evitar duplicados si ya está en la lista
    const exists = value.find((item) => item.structureId === structure.id);
    if (exists) return; 

    const newItem: SelectedItem = {
      structureId: structure.id,
      name: structure.name,
      quantity: 1, 
      // CORRECCION/FIX : Usar 'available' como límite para nuevos ítems
      maxStock: structure.available, 
    };

    onChange([...value, newItem]);
    setSelectedId(null); 
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = value.map((item) => {
      if (item.structureId === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        // Respetamos el maxStock que se asigno al crear el item (o al cargarlo)
        if (newQty > item.maxStock) return item; 
        return { ...item, quantity: newQty };
      }
      return item;
    });
    onChange(updated);
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.structureId !== id));
  };

  const selectOptions = structures
    .filter(s => !value.find(v => v.structureId === s.id))
    .map(s => ({
      value: s.id,
      // CORRECCION/FIX VISUAL: Mostramos Disponible en vez de Stock total
      label: `${s.name} (Disponible: ${s.available})`,
      // Deshabilitamos si no hay un disponible real
      disabled: s.available <= 0
    }));

  if (loading) return <Loader size="sm" color="orange" />;

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500} c="white">Asignar Estructuras (Opcional)</Text>
      
      {/* Selector y botón agregar */}
      <Group align="flex-end">
        <Select
          placeholder="Buscar estructura..."
          data={selectOptions}
          value={selectedId}
          onChange={setSelectedId}
          searchable
          style={{ flex: 1 }}
          styles={{
            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
            dropdown: { backgroundColor: "#1a1a1a", borderColor: "#2d2d2d", color: "white" },
            option: { 
                '&[data-hovered]': { backgroundColor: "#2d2d2d" },
                '&[data-selected]': { backgroundColor: "#f97316", color: "white" },
                // Estilo visual para aquellas opciones que esten sin stock
                '&[data-disabled]': { opacity: 0.5, cursor: "not-allowed", color: "#6b7280" }
              }
          }}
        />
        <Button 
          onClick={handleAddStructure} 
          disabled={!selectedId}
          color="orange"
          variant="light"
        >
          Agregar
        </Button>
      </Group>

      {/* Lista de items seleccionados */}
      <Stack gap="xs" mt="xs">
        {value.map((item) => {
          // Calcular cuánto más se puede agregar
          const remainingToAdd = item.maxStock - item.quantity;
          
          return (
            <Paper 
              key={item.structureId} 
              p="xs" 
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2d2d2d" }}
              radius="sm"
            >
              <Group justify="space-between">
                
                {/* Info del Item */}
                <Group gap="xs">
                  <Package size={18} color="#9ca3af" />
                  <Stack gap={0}>
                      <Text size="sm" c="white" fw={500}>{item.name}</Text>
                      <Text size="xs" c={remainingToAdd === 0 ? "red" : "dimmed"}>
                          Límite: {item.maxStock} (Quedan: {remainingToAdd})  
                      </Text>
                  </Stack>
                </Group>

                {/* Controles de Cantidad */}
                <Group gap={4}>
                  <ActionIcon 
                      variant="default" 
                      size="sm" 
                      onClick={() => updateQuantity(item.structureId, -1)}
                      style={{ borderColor: "#2d2d2d", backgroundColor: "transparent", color: "white" }}
                  >
                    <Minus size={12} />
                  </ActionIcon>
                  
                  <Text size="sm" c="white" w={30} ta="center">{item.quantity}</Text>
                  
                  <ActionIcon 
                      variant="default" 
                      size="sm" 
                      onClick={() => updateQuantity(item.structureId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      style={{ borderColor: "#2d2d2d", backgroundColor: "transparent", color: "white" }}
                  >
                    <Plus size={12} />
                  </ActionIcon>

                  <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      size="sm" 
                      ml="sm"
                      onClick={() => removeItem(item.structureId)}
                  >
                    <Trash size={14} />
                  </ActionIcon>
                </Group>

              </Group>
            </Paper>
          );
        })}
        
        {value.length === 0 && (
            <Text size="xs" c="dimmed" ta="center">No se han asignado estructuras aún.</Text>
        )}
      </Stack>
    </Stack>
  );
}