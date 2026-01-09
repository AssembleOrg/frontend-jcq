"use client";
import { useState, useEffect } from "react";
import { useBudgetsStore } from "@/src/presentation/stores/budget.store"; 
import { useClientsStore } from "@/src/presentation/stores/clients.store";
import { useStructuresStore } from "@/src/presentation/stores/structures.store";
import { useDolarStore } from "@/src/presentation/stores/dolar.store"; 
import { 
  Button, 
  TextInput, 
  NumberInput, 
  Select, 
  Switch, 
  Group, 
  Stack, 
  ActionIcon, 
  Text, 
  Divider,
  Paper,
  Checkbox,
  Grid,
  Alert,
  LoadingOverlay
} from "@mantine/core";
import { Plus, Trash, FileText, X, Download, CheckCircle, AlertCircle } from "lucide-react";
import { CreateBudgetDto, CreateBudgetItemDto, Budget } from "@/src/core/entities";
import { pdf } from "@react-pdf/renderer";
import { BudgetPdfDocument } from "./budget-pdf";
import { formatCurrency } from "@/src/presentation/utils/format-currency";

export const BudgetForm = () => {
  const { 
    createBudget, 
    updateBudget, 
    selectedBudget, 
    setSelectedBudget, 
    isLoading 
  } = useBudgetsStore();

  const { clients, fetchClients } = useClientsStore();
  const { structuresList, fetchStructures } = useStructuresStore();
  const { dolar, fetchDolar } = useDolarStore(); 

  const [mounted, setMounted] = useState(false);
  
  const [lastSavedBudget, setLastSavedBudget] = useState<Budget | null>(null);
  const [isManualClient, setIsManualClient] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateBudgetDto>>({
    date: new Date().toISOString().split('T')[0],
    netAmount: 0,
    hasIva: true,
    ivaPercentage: 21,
    hasIibb: false,
    iibbPercentage: 3,
    hasUSD: false,
    usdValue: undefined,
    items: []
  });

  const [newItem, setNewItem] = useState<{
    quantity: number; 
    desc: string; 
    structureId?: string 
  }>({ quantity: 1, desc: '', structureId: undefined });

  // Efecto para marcar que ya estamos en el cliente
  useEffect(() => {
    setMounted(true);
    fetchClients();
    fetchStructures();
    fetchDolar();
  }, [fetchClients, fetchStructures, fetchDolar]);

  // Efecto para cargar datos si estamos editando
  useEffect(() => {
    if (selectedBudget) {
      setLastSavedBudget(null); 
      setIsManualClient(!!selectedBudget.manualClientName);
      
      setFormData({
        date: selectedBudget.date ? new Date(selectedBudget.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        clientId: selectedBudget.clientId,
        manualClientName: selectedBudget.manualClientName,
        manualClientCuit: selectedBudget.manualClientCuit,
        netAmount: Number(selectedBudget.netAmount),
        hasIva: selectedBudget.hasIva,
        ivaPercentage: selectedBudget.ivaPercentage,
        hasIibb: selectedBudget.hasIibb,
        iibbPercentage: selectedBudget.iibbPercentage,
        hasUSD: selectedBudget.hasUSD,
        usdValue: selectedBudget.usdValue,
        items: selectedBudget.items.map((item: any) => ({
            quantity: item.quantity,
            manualName: item.manualName,
            structureId: item.structureId
        }))
      });
    }
  }, [selectedBudget]);

  const handleResetForm = () => {
    setFormData({
        date: new Date().toISOString().split('T')[0],
        netAmount: 0,
        hasIva: true,
        ivaPercentage: 21,
        hasIibb: false,
        iibbPercentage: 3,
        hasUSD: false,
        usdValue: undefined,
        items: []
      });
      setIsManualClient(false);
      setSelectedBudget(null); 
      setLastSavedBudget(null); 
  };

  const handleDownloadPdf = async () => {
    if (!lastSavedBudget) return;
    try {
        // SE GENRA SOLO cuando el usuario hace click.
        const blob = await pdf(<BudgetPdfDocument budget={lastSavedBudget} />).toBlob();
        window.open(URL.createObjectURL(blob), '_blank');
    } catch (error) {
        console.error("Error generando PDF:", error);
    }
  };

  const handleSelectStructure = (structureId: string | null) => {
    if (!structureId) {
        setNewItem({ ...newItem, structureId: undefined }); 
        return;
    }
    setNewItem({ 
        ...newItem, 
        structureId: structureId 
    });
  };

  const handleAddItem = () => {
    if (!newItem.desc && !newItem.structureId) return;

    const selectedStructure = structuresList.find(s => s.id === newItem.structureId);
    const structureName = selectedStructure ? selectedStructure.name : '';

    let finalName = newItem.desc;
    if (structureName) {
        finalName = newItem.desc 
            ? `${structureName} - ${newItem.desc}` 
            : structureName;
    }

    const itemDto: CreateBudgetItemDto = {
        quantity: Number(newItem.quantity),
        manualName: finalName, 
        structureId: newItem.structureId 
    };

    setFormData(prev => ({ ...prev, items: [...(prev.items || []), itemDto] }));
    setNewItem({ quantity: 1, desc: '', structureId: undefined });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
        ...prev,
        items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.netAmount || formData.netAmount <= 0) return; 

    const payload: CreateBudgetDto = {
        date: new Date(formData.date!).toISOString(),
        clientId: !isManualClient ? formData.clientId : undefined,
        manualClientName: isManualClient ? formData.manualClientName : undefined,
        manualClientCuit: isManualClient ? formData.manualClientCuit : undefined,
        netAmount: Number(formData.netAmount),
        hasIva: Boolean(formData.hasIva),
        ivaPercentage: Number(formData.ivaPercentage),
        hasIibb: Boolean(formData.hasIibb),
        iibbPercentage: Number(formData.iibbPercentage),
        hasUSD: Boolean(formData.hasUSD),
        usdValue: formData.hasUSD ? Number(formData.usdValue) : undefined,
        items: formData.items || []
    };

    let result;
    if (selectedBudget && selectedBudget.id) {
        result = await updateBudget(selectedBudget.id, payload);
    } else {
        result = await createBudget(payload);
    }
    
    if (result) {
        setLastSavedBudget(result);
    }
  };

  const neto = Number(formData.netAmount || 0);
  const iva = formData.hasIva ? neto * (Number(formData.ivaPercentage)/100) : 0;
  const iibb = formData.hasIibb ? neto * (Number(formData.iibbPercentage)/100) : 0;
  const total = neto + iva + iibb;
  const totalUSD = formData.hasUSD && formData.usdValue && formData.usdValue > 0 
    ? total / formData.usdValue 
    : null;

  const clientOptions = clients.map(c => ({ value: c.id, label: c.fullname }));
  const structureOptions = structuresList?.map(s => ({ value: s.id, label: s.name })) || [];
  const isFormDisabled = !!lastSavedBudget;

  // Lógica de validación de Stock
  const selectedStructureRef = structuresList.find(s => s.id === newItem.structureId);
  const currentAvailable = selectedStructureRef ? selectedStructureRef.available : 0; 
  const isExceedingStock = selectedStructureRef && newItem.quantity > currentAvailable;

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

        {lastSavedBudget && (
            <Alert variant="light" color="green" title="Éxito" icon={<CheckCircle size={16}/>}>
                Presupuesto guardado correctamente.
            </Alert>
        )}

        <Paper withBorder p="sm" radius="md">
            <Group justify="space-between" mb="xs">
                <Group>
                    <Text fw={600} size="sm">Datos del Cliente</Text>
                    {selectedBudget && !lastSavedBudget && <Text size="xs" c="orange" fw={700}>(Editando)</Text>}
                </Group>
                
                <Checkbox 
                    label="Ingresar cliente manualmente" 
                    checked={isManualClient}
                    onChange={(e) => {
                        setIsManualClient(e.currentTarget.checked);
                        setFormData(prev => ({...prev, clientId: undefined, manualClientName: '', manualClientCuit: ''}));
                    }}
                    disabled={isFormDisabled}
                />
            </Group>

            <Grid>
                <Grid.Col span={8}>
                    {!isManualClient ? (
                        <Select
                            label="Buscar cliente existente"
                            placeholder="Seleccionar cliente..."
                            data={clientOptions}
                            searchable
                            value={formData.clientId}
                            onChange={(val) => setFormData({...formData, clientId: val || undefined})}
                            clearable
                            disabled={isManualClient || isFormDisabled} 
                        />
                    ) : (
                        <TextInput 
                            label="Nombre / Razón Social" 
                            placeholder="Ej: Consumidor Final"
                            value={formData.manualClientName || ""}
                            onChange={(e) => setFormData({...formData, manualClientName: e.target.value})}
                            required={isManualClient}
                            disabled={isFormDisabled}
                        />
                    )}
                </Grid.Col>
                <Grid.Col span={4}>
                      <TextInput 
                        label={isManualClient ? "CUIT (Manual)" : "CUIT (Del Cliente)"}
                        placeholder="20-..."
                        value={isManualClient ? (formData.manualClientCuit || "") : (clients.find(c => c.id === formData.clientId)?.cuit || "")}
                        onChange={(e) => isManualClient && setFormData({...formData, manualClientCuit: e.target.value})} 
                        disabled={!isManualClient || isFormDisabled} 
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                      <TextInput
                        label="Fecha del Presupuesto"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                        disabled={isFormDisabled}
                    />
                </Grid.Col>
            </Grid>
        </Paper>

        <Divider my="sm" label="Detalle del Presupuesto" labelPosition="center" />

        <Paper withBorder p="md" radius="md" bg="dark.7">
            <Text size="sm" fw={700} mb="sm">Agregar Items</Text>

            <Grid align="flex-end" mb="xs">
                <Grid.Col span={2}>
                    <NumberInput
                        label="Cant."
                        min={1}
                        value={newItem.quantity}
                        onChange={(val) => setNewItem({ ...newItem, quantity: Number(val) })}
                        disabled={isFormDisabled}
                        error={isExceedingStock}
                    />
                </Grid.Col>

                <Grid.Col span={4}>
                    <Select
                        label="Buscar Estructura"
                        placeholder="Seleccionar..."
                        data={structureOptions}
                        searchable
                        clearable
                        value={newItem.structureId}
                        onChange={handleSelectStructure}
                        disabled={isFormDisabled}
                    />
                </Grid.Col>

                <Grid.Col span={5}>
                    <TextInput
                        label="Descripción / Medida"
                        placeholder="Ej: 1,85x1M"
                        value={newItem.desc}
                        onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })}
                        disabled={isFormDisabled}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddItem();
                            }
                        }}
                    />
                </Grid.Col>

                <Grid.Col span={1}>
                    <Button
                        onClick={handleAddItem}
                        variant="filled"
                        color={isExceedingStock ? "orange" : "blue"}
                        fullWidth
                        p={0}
                        disabled={isFormDisabled}
                    >
                        <Plus size={20} />
                    </Button>
                </Grid.Col>
            </Grid>

             {/* Alerta de Stock Insuficiente */}
             {isExceedingStock && (
                <Alert 
                    variant="light" 
                    color="orange" 
                    title="Stock Insuficiente" 
                    icon={<AlertCircle size={16} />} 
                    mb="md"
                >
                    Actualmente solo dispones de <b>{currentAvailable} unidades</b> disponibles de esa estructura. Aun asi puedes agregarla al presupuesto.
                </Alert>
            )}

            <Stack gap="xs">
                {formData.items?.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="sm">No hay items agregados</Text>
                )}

                {formData.items?.map((it, idx) => (
                    <Group
                        key={idx}
                        justify="space-between"
                        p="xs"
                        style={{
                            borderRadius: 8,
                            backgroundColor: "var(--mantine-color-dark-6)",
                            border: "1px solid var(--mantine-color-dark-4)",
                        }}
                    >
                        <Text size="sm" c="gray.2">
                            <span style={{ fontWeight: 700 }}>{it.quantity}x</span>{" "}
                            {it.manualName}
                        </Text>

                        <ActionIcon
                            color="red"
                            variant="light"
                            size="sm"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={isFormDisabled}
                        >
                            <Trash size={14} />
                        </ActionIcon>
                    </Group>
                ))}
            </Stack>
        </Paper>


        <Divider my="sm" label="Valores y Totales" labelPosition="center" />

        <Paper withBorder p="md" radius="md">
            <Stack gap="md">
                <NumberInput
                    label="Monto Neto Total"
                    prefix="$ "
                    thousandSeparator="."
                    decimalSeparator=","
                    size="md"
                    fw={700}
                    value={formData.netAmount}
                    onChange={(val) => setFormData({...formData, netAmount: Number(val)})}
                    disabled={isFormDisabled}
                />

                <Group grow align="flex-start">
                    <Paper p="xs" withBorder bg={formData.hasIva ? "dark.6" : "transparent"}>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" fw={500}>Aplicar IVA</Text>
                                <Switch 
                                    checked={formData.hasIva}
                                    onChange={(e) => setFormData({...formData, hasIva: e.currentTarget.checked})}
                                    disabled={isFormDisabled}
                                />
                            </Group>
                            {formData.hasIva && (
                                <NumberInput 
                                    label="Porcentaje %"
                                    size="xs"
                                    value={formData.ivaPercentage}
                                    onChange={(val) => setFormData({...formData, ivaPercentage: Number(val)})}
                                    suffix="%"
                                    disabled={isFormDisabled}
                                />
                            )}
                            <Text size="sm" ta="right" fw={700} c="dimmed">{formatCurrency(iva)}</Text>
                        </Stack>
                    </Paper>

                    <Paper p="xs" withBorder bg={formData.hasIibb ? "dark.6" : "transparent"}>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" fw={500}>Aplicar IIBB</Text>
                                <Switch 
                                    checked={formData.hasIibb}
                                    onChange={(e) => setFormData({...formData, hasIibb: e.currentTarget.checked})}
                                    disabled={isFormDisabled}
                                />
                            </Group>
                             {formData.hasIibb && (
                                <NumberInput 
                                    label="Porcentaje %"
                                    size="xs"
                                    value={formData.iibbPercentage}
                                    onChange={(val) => setFormData({...formData, iibbPercentage: Number(val)})}
                                    suffix="%"
                                    disabled={isFormDisabled}
                                />
                            )}
                            <Text size="sm" ta="right" fw={700} c="dimmed">{formatCurrency(iibb)}</Text>
                        </Stack>
                    </Paper>
                </Group>

                {/* Sección USD */}
                <Paper p="xs" withBorder bg={formData.hasUSD ? "green.9" : "transparent"} mt="sm">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>💵 Cotizar en Dólares</Text>
                            <Switch 
                                checked={formData.hasUSD}
                                onChange={(e) => {
                                    const checked = e.currentTarget.checked;
                                    setFormData({
                                        ...formData, 
                                        hasUSD: checked,
                                        usdValue: checked && dolar ? dolar.venta : undefined
                                    });
                                }}
                                disabled={isFormDisabled}
                                color="green"
                            />
                        </Group>
                        {formData.hasUSD && (
                            <NumberInput 
                                label="Valor del Dólar"
                                size="xs"
                                prefix="$ "
                                decimalScale={2}
                                value={formData.usdValue}
                                onChange={(val) => setFormData({...formData, usdValue: Number(val)})}
                                disabled={isFormDisabled}
                                min={0}
                            />
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Paper>

        <Paper p="md" bg="blue.6" radius="md" mt="md">
            <Stack gap="xs">
                <Group justify="space-between">
                    <Text size="lg" fw={700} c="white">TOTAL FINAL (ARS)</Text>
                    <Text size="xl" fw={900} c="white">{formatCurrency(total)}</Text>
                </Group>
                {formData.hasUSD && totalUSD !== null && (
                    <Group justify="space-between">
                        <Text size="md" fw={600} c="white">TOTAL EN USD</Text>
                        <Text size="lg" fw={800} c="lime.3">USD {totalUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </Group>
                )}
            </Stack>
        </Paper>

        <Group grow>
            {lastSavedBudget ? (
                <>
                    <Button 
                        size="lg" 
                        variant="default" 
                        onClick={handleResetForm}
                        leftSection={<Plus size={20} />}
                    >
                        Nuevo Presupuesto
                    </Button>
                    <Button 
                        size="lg" 
                        color="green" 
                        onClick={handleDownloadPdf}
                        leftSection={<Download size={20} />}
                    >
                        Descargar Presupuesto
                    </Button>
                </>
            ) : (
                <>
                    {(selectedBudget) && (
                        <Button 
                            size="lg" 
                            variant="default" 
                            onClick={handleResetForm}
                            leftSection={<X size={20} />}
                        >
                            Cancelar Edición
                        </Button>
                    )}
                    
                    <Button 
                        fullWidth={!selectedBudget} 
                        size="lg" 
                        type="submit" 
                        leftSection={<FileText size={20} />} 
                        loading={isLoading}
                        color="orange" 
                    >
                        {selectedBudget ? "Guardar Cambios" : "Generar Presupuesto"}
                    </Button>
                </>
            )}
        </Group>

      </Stack>
    </form>
  );
};