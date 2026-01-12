"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Button,
    TextInput,
    NumberInput,
    Group,
    Stack,
    Text,
    Paper,
    Divider,
    Loader,
    ScrollArea,
    Grid,
    Table,
    Badge,
    Center,
    ActionIcon,
    Tooltip,
    Textarea,
    Alert,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconHistory,
    IconDownload,
    IconFileTypePdf,
    IconPlus,
    IconTruck,
    IconUser,
    IconId,
    IconEdit,
    IconAlertCircle,
    IconTrash,
} from "@tabler/icons-react";
import { dispatchApi } from "@/src/infrastructure/api/dispatch.api";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DispatchPdf } from './dispatch-pdf';
import type { Project, Dispatch, CreateDispatchDto, ProjectStructure, UpdateDispatchDto } from "@/src/core/entities";
import { showToast } from "@/src/presentation/utils";
import { useProjectsStore } from "@/src/presentation/stores/projects.store";

interface DispatchModalProps {
    project: Project;
    onClose: () => void;
    onSuccess: () => void;
}

export const DispatchModal = ({ project, onClose, onSuccess }: DispatchModalProps) => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cuit, setCuit] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [notes, setNotes] = useState("");

    // Items state - structure selection with quantities
    const [selectedItems, setSelectedItems] = useState<{ projectItemId: string; quantity: number }[]>([]);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSavedDispatch, setLastSavedDispatch] = useState<Dispatch | null>(null);
    const [history, setHistory] = useState<Dispatch[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [shouldRefreshParent, setShouldRefreshParent] = useState(false);

    // Edit mode state
    const [editingDispatch, setEditingDispatch] = useState<Dispatch | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const { updateProjectDispatchedQuantities } = useProjectsStore();

    // Calculate if there's anything to dispatch
    const canCreateNewDispatch = useMemo(() => {
        const structures = project.structures || [];
        return structures.some(item => {
            const remaining = item.quantity - (item.dispatchedQuantity || 0);
            return remaining > 0;
        });
    }, [project.structures]);

    const fetchHistory = useCallback(async () => {
        if (!project?.id) return;
        try {
            setLoadingHistory(true);
            const dispatches = await dispatchApi.getByProject(project.id);
            setHistory(dispatches || []);
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setLoadingHistory(false);
        }
    }, [project]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleItemQuantityChange = (projectItemId: string, quantity: number) => {
        setSelectedItems(prev => {
            const existing = prev.find(item => item.projectItemId === projectItemId);
            if (quantity <= 0) {
                return prev.filter(item => item.projectItemId !== projectItemId);
            }
            if (existing) {
                return prev.map(item =>
                    item.projectItemId === projectItemId ? { ...item, quantity } : item
                );
            }
            return [...prev, { projectItemId, quantity }];
        });
        if (lastSavedDispatch) setLastSavedDispatch(null);
    };

    const handleResetForm = () => {
        setLastSavedDispatch(null);
        setEditingDispatch(null);
        setIsEditMode(false);
        setFirstName("");
        setLastName("");
        setCuit("");
        setLicensePlate("");
        setNotes("");
        setSelectedItems([]);
    };

    const handleSmartClose = () => {
        if (shouldRefreshParent) {
            onSuccess();
        } else {
            onClose();
        }
    };

    // Edit dispatch handler
    const handleEditDispatch = (dispatch: Dispatch) => {
        setEditingDispatch(dispatch);
        setIsEditMode(true);
        setFirstName(dispatch.firstName);
        setLastName(dispatch.lastName);
        setCuit(dispatch.cuit || "");
        setLicensePlate(dispatch.licensePlate || "");
        setNotes(dispatch.notes || "");
    };

    // Save edit handler
    const handleSaveEdit = async () => {
        if (!editingDispatch) return;
        
        if (!firstName || !lastName) {
            showToast.error('Complete el nombre y apellido del chofer');
            return;
        }

        if (!cuit && !licensePlate) {
            showToast.error('Debe proporcionar CUIT o Patente');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: UpdateDispatchDto = {
                firstName,
                lastName,
                cuit,
                licensePlate,
                notes: notes || undefined,
            };

            await dispatchApi.update(editingDispatch.id, payload);
            await fetchHistory();
            
            showToast.success('Despacho actualizado correctamente');
            handleResetForm();
            setShouldRefreshParent(true);

        } catch (error: any) {
            console.error("Error actualizando:", error);
            const msg = error?.response?.data?.message || "Error al actualizar.";
            showToast.error(Array.isArray(msg) ? msg.join('\n') : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete dispatch handler
    const handleDeleteDispatch = async (dispatchId: string) => {
        if (!confirm('¿Está seguro que desea eliminar este despacho?')) return;
        
        try {
            // Find dispatch before deleting to get items for rollback
            const dispatchToDelete = history.find(d => d.id === dispatchId);

            await dispatchApi.delete(dispatchId);
            await fetchHistory();

            // Optimistically update global store to return stock
            if (dispatchToDelete && dispatchToDelete.items) {
                const itemsToRestore = dispatchToDelete.items.map(item => ({
                    projectItemId: item.projectItem.id, // Ensure this maps correctly to projectItemId
                    quantity: -item.quantity // Negative quantity to decrement dispatched (increment available)
                }));
                updateProjectDispatchedQuantities(project.id, itemsToRestore);
            }

            showToast.success('Despacho eliminado correctamente');
            setShouldRefreshParent(true);
        } catch (error: any) {
            console.error("Error eliminando:", error);
            const msg = error?.response?.data?.message || "Error al eliminar.";
            showToast.error(Array.isArray(msg) ? msg.join('\n') : msg);
        }
    };



    const handleSave = async () => {
        if (!firstName || !lastName) {
            showToast.error('Complete el nombre y apellido del chofer');
            return;
        }

        if (!cuit && !licensePlate) {
            showToast.error('Debe proporcionar CUIT o Patente');
            return;
        }

        if (selectedItems.length === 0) {
            showToast.error('Seleccione al menos una estructura para despachar');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateDispatchDto = {
                projectId: project.id,
                firstName,
                lastName,
                cuit,
                licensePlate,
                notes: notes || undefined,
                items: selectedItems.map(item => ({
                    projectItemId: item.projectItemId,
                    quantity: item.quantity,
                })),
            };

            const savedDispatch = await dispatchApi.create(payload);
            await fetchHistory();

            // Optimistically update global store so UI updates immediately across all components
            updateProjectDispatchedQuantities(project.id, selectedItems);

            setLastSavedDispatch(savedDispatch);
            setShouldRefreshParent(true);

            showToast.success('Despacho creado correctamente');

        } catch (error: any) {
            console.error("Error guardando:", error);
            const msg = error?.response?.data?.message || "Error al guardar.";
            showToast.error(Array.isArray(msg) ? msg.join('\n') : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getItemQuantity = (projectItemId: string) => {
        return selectedItems.find(item => item.projectItemId === projectItemId)?.quantity || 0;
    };

    return (
        <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            Proyecto: <Text span fw={700} c="white">{project.client?.fullname}</Text>
                        </Text>
                        {project.locationAddress && (
                            <Text size="xs" c="dimmed">{project.locationAddress}</Text>
                        )}
                    </Group>

                    {/* Edit mode indicator */}
                    {isEditMode && (
                        <Alert icon={<IconEdit size={16} />} color="yellow" variant="light">
                            Modo edición - Modificando datos del despacho
                        </Alert>
                    )}

                    {/* No items to dispatch warning */}
                    {!canCreateNewDispatch && !isEditMode && !lastSavedDispatch && (
                        <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
                            Todas las estructuras ya fueron despachadas. Solo puede editar despachos existentes.
                        </Alert>
                    )}

                    {/* Driver Info */}
                    <Paper p="sm" bg="#1a1a1a" withBorder style={{ borderColor: '#2d2d2d' }}>
                        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">
                            <IconUser size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Datos del Chofer
                        </Text>

                        <Group grow>
                            <TextInput
                                label="Nombre"
                                placeholder="Juan"
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value); if (lastSavedDispatch) setLastSavedDispatch(null); }}
                                disabled={!!lastSavedDispatch}
                                styles={{
                                    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
                                    label: { color: "#9ca3af" }
                                }}
                            />
                            <TextInput
                                label="Apellido"
                                placeholder="Pérez"
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value); if (lastSavedDispatch) setLastSavedDispatch(null); }}
                                disabled={!!lastSavedDispatch}
                                styles={{
                                    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
                                    label: { color: "#9ca3af" }
                                }}
                            />
                        </Group>

                        <Group grow mt="sm">
                            <TextInput
                                label="CUIT"
                                placeholder="20-12345678-9"
                                leftSection={<IconId size={16} />}
                                value={cuit}
                                onChange={(e) => { setCuit(e.target.value); if (lastSavedDispatch) setLastSavedDispatch(null); }}
                                disabled={!!lastSavedDispatch}
                                styles={{
                                    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
                                    label: { color: "#9ca3af" }
                                }}
                            />
                            <TextInput
                                label="Patente"
                                placeholder="ABC123"
                                leftSection={<IconTruck size={16} />}
                                value={licensePlate}
                                onChange={(e) => { setLicensePlate(e.target.value.toUpperCase()); if (lastSavedDispatch) setLastSavedDispatch(null); }}
                                disabled={!!lastSavedDispatch}
                                styles={{
                                    input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
                                    label: { color: "#9ca3af" }
                                }}
                            />
                        </Group>
                    </Paper>

                    {/* Structures Selection - Only show if not in edit mode */}
                    {!isEditMode && (
                        <Paper p="sm" bg="#1a1a1a" withBorder style={{ borderColor: '#2d2d2d' }}>
                            <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">
                                Estructuras a Despachar
                            </Text>

                            <ScrollArea.Autosize mah={200} type="auto" offsetScrollbars>
                                <Stack gap="xs">
                                    {project.structures?.map((item: ProjectStructure) => {
                                        // Use dispatchedQuantity directly from project prop (updated via store)
                                        const remaining = item.quantity - (item.dispatchedQuantity || 0);
                                        return (
                                        <Group key={item.id} justify="space-between" wrap="nowrap">
                                            <Text size="sm" c="white" style={{ flex: 1 }}>
                                                {item.structure?.name}
                                                {item.structure?.measure && ` (${item.structure.measure})`}
                                            </Text>
                                            <Badge size="xs" color={remaining > 0 ? "green" : "gray"} variant="light">
                                                Disp: {remaining}
                                            </Badge>
                                            <NumberInput
                                                placeholder="0"
                                                min={0}
                                                max={remaining}
                                                value={getItemQuantity(item.id)}
                                                onChange={(val) => handleItemQuantityChange(item.id, Number(val) || 0)}
                                                disabled={!!lastSavedDispatch || remaining <= 0}
                                                styles={{
                                                    input: {
                                                        backgroundColor: "#0f0f0f",
                                                        borderColor: "#2d2d2d",
                                                        color: "white",
                                                        width: 70,
                                                        textAlign: 'center'
                                                    }
                                                }}
                                                hideControls
                                            />
                                        </Group>
                                        );
                                    })}
                                    {(!project.structures || project.structures.length === 0) && (
                                        <Text size="sm" c="dimmed" ta="center">No hay estructuras asignadas</Text>
                                    )}
                                </Stack>
                            </ScrollArea.Autosize>
                        </Paper>
                    )}

                    {/* Notes */}
                    <Textarea
                        label="Notas (opcional)"
                        placeholder="Observaciones adicionales..."
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); if (lastSavedDispatch) setLastSavedDispatch(null); }}
                        disabled={!!lastSavedDispatch}
                        minRows={2}
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" },
                            label: { color: "#9ca3af" }
                        }}
                    />

                    {/* Summary - Only show if not in edit mode */}
                    {!isEditMode && (
                        <Paper p="md" radius="md" style={{ backgroundColor: "#25262b", border: "1px solid #373a40" }}>
                            <Group justify="space-between" align="center">
                                <Text size="md" fw={700} c="orange">ITEMS SELECCIONADOS:</Text>
                                <Text size="xl" fw={900} c="green">
                                    {selectedItems.reduce((acc, item) => acc + item.quantity, 0)} unidades
                                </Text>
                            </Group>
                        </Paper>
                    )}

                    {/* Actions */}
                    <Group justify="flex-end" mt="auto">
                        {isEditMode ? (
                            <>
                                <Button
                                    variant="default"
                                    onClick={handleResetForm}
                                    styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}
                                >
                                    Cancelar Edición
                                </Button>
                                <Button
                                    color="yellow"
                                    onClick={handleSaveEdit}
                                    loading={isSubmitting}
                                    leftSection={<IconEdit size={18} />}
                                >
                                    Guardar Cambios
                                </Button>
                            </>
                        ) : !lastSavedDispatch ? (
                            <>
                                <Button
                                    variant="default"
                                    onClick={handleSmartClose}
                                    styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}
                                >
                                    Cancelar
                                </Button>
                                <Tooltip 
                                    label="Todas las estructuras ya fueron despachadas" 
                                    disabled={canCreateNewDispatch}
                                    withArrow
                                >
                                    <Button
                                        color="green"
                                        onClick={handleSave}
                                        loading={isSubmitting}
                                        leftSection={<IconTruck size={18} />}
                                        disabled={!canCreateNewDispatch}
                                    >
                                        Crear Despacho
                                    </Button>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="subtle"
                                    color="gray"
                                    onClick={handleResetForm}
                                    leftSection={<IconPlus size={16} />}
                                >
                                    Nuevo Despacho
                                </Button>

                                <PDFDownloadLink
                                    document={<DispatchPdf dispatch={lastSavedDispatch} />}
                                    fileName={`Remito_${project.client?.fullname}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {({ loading }) => (
                                        <Button
                                            color="blue"
                                            leftSection={<IconDownload size={18} />}
                                            loading={loading}
                                        >
                                            Descargar Remito
                                        </Button>
                                    )}
                                </PDFDownloadLink>
                            </>
                        )}
                    </Group>
                </Stack>
            </Grid.Col>

            {/* History Panel */}
            <Grid.Col
                span={{ base: 12, md: 6 }}
                style={{
                    borderLeft: isMobile ? 'none' : '1px solid #2d2d2d',
                    borderTop: isMobile ? '1px solid #2d2d2d' : 'none',
                    marginTop: isMobile ? '1rem' : 0,
                    paddingTop: '1rem',
                    paddingLeft: isMobile ? 0 : '1.5rem'
                }}
            >
                <Stack h="100%">
                    <Group justify="space-between">
                        <Group gap="xs">
                            <IconHistory size={20} color="orange" />
                            <Text fw={700} c="white">Despachos Anteriores</Text>
                        </Group>
                        <Badge color="gray" variant="light">{history.length} Registros</Badge>
                    </Group>

                    <Divider color="#2d2d2d" />

                    <ScrollArea h={isMobile ? 300 : 400} type="always" offsetScrollbars>
                        {loadingHistory ? (
                            <Center h={200}><Loader color="orange" type="bars" /></Center>
                        ) : history.length === 0 ? (
                            <Center h={200}><Text c="dimmed" size="sm">Sin despachos previos</Text></Center>
                        ) : (
                            <Table verticalSpacing="sm" highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th c="dimmed">Fecha</Table.Th>
                                        <Table.Th c="dimmed">Chofer</Table.Th>
                                        <Table.Th c="dimmed">Items</Table.Th>
                                        <Table.Th w={80}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {history.map((dispatch) => (
                                        <Table.Tr key={dispatch.id}>
                                            <Table.Td>
                                                <Text size="sm" c="white">
                                                    {new Date(dispatch.createdAt).toLocaleDateString()}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="white">
                                                    {dispatch.firstName} {dispatch.lastName}
                                                </Text>
                                                <Text size="xs" c="dimmed">{dispatch.licensePlate}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="orange" variant="light" size="sm">
                                                    {dispatch.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} unidades
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Tooltip label="Editar" withArrow position="top">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="yellow"
                                                            radius="md"
                                                            size="lg"
                                                            onClick={() => handleEditDispatch(dispatch)}
                                                        >
                                                            <IconEdit size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <PDFDownloadLink
                                                        document={<DispatchPdf dispatch={dispatch} />}
                                                        fileName={`Remito_${dispatch.firstName}${dispatch.lastName}.pdf`}
                                                    >
                                                        {({ loading }) => (
                                                            <Tooltip label="Descargar PDF" withArrow position="top">
                                                                <ActionIcon
                                                                    variant="light"
                                                                    color="blue"
                                                                    loading={loading}
                                                                    radius="md"
                                                                    size="lg"
                                                                >
                                                                    <IconFileTypePdf size={18} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        )}
                                                    </PDFDownloadLink>
                                                    <Tooltip label="Eliminar" withArrow position="top">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            radius="md"
                                                            size="lg"
                                                            onClick={() => handleDeleteDispatch(dispatch.id)}
                                                        >
                                                            <IconTrash size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </ScrollArea>
                </Stack>
            </Grid.Col>
        </Grid>
    );
};
