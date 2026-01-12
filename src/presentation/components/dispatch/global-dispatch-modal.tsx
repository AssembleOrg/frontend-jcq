"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Button,
    TextInput,
    Group,
    Stack,
    Text,
    Paper,
    Divider,
    Loader,
    ScrollArea,
    Table,
    Badge,
    Center,
    ActionIcon,
    Tooltip,
    Pagination,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconSearch,
    IconFileTypePdf,
    IconFilter,
    IconTruck,
    IconUser,
    IconId,
    IconCalendar,
} from "@tabler/icons-react";
import { dispatchApi } from "@/src/infrastructure/api/dispatch.api";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DispatchPdf } from '../projects/dispatch-pdf';
import type { Dispatch, DispatchFilters } from "@/src/core/entities";

interface GlobalDispatchModalProps {
    onClose: () => void;
}

export const GlobalDispatchModal = ({ onClose }: GlobalDispatchModalProps) => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Filter state
    const [filters, setFilters] = useState<DispatchFilters>({
        page: 1,
        limit: 10,
    });
    const [driverCuit, setDriverCuit] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [clientName, setClientName] = useState("");
    const [dateInit, setDateInit] = useState<Date | null>(null);
    const [dateEnd, setDateEnd] = useState<Date | null>(null);

    // Data state
    const [dispatches, setDispatches] = useState<Dispatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchDispatches = useCallback(async () => {
        try {
            setLoading(true);
            const params: DispatchFilters = {
                page: filters.page,
                limit: filters.limit,
            };
            if (driverCuit) params.driverCuit = driverCuit;
            if (licensePlate) params.licensePlate = licensePlate;
            if (clientName) params.clientName = clientName;
            if (dateInit) params.dateInit = dateInit.toISOString().split('T')[0];
            if (dateEnd) params.dateEnd = dateEnd.toISOString().split('T')[0];

            const response = await dispatchApi.getPaginated(params);
            setDispatches(response.data || []);
            if (response.meta) {
                setTotalPages(response.meta.totalPages || 1);
                setTotal(response.meta.total || 0);
            }
        } catch (error) {
            console.error("Error cargando despachos:", error);
        } finally {
            setLoading(false);
        }
    }, [filters.page, filters.limit, driverCuit, licensePlate, clientName, dateInit, dateEnd]);

    useEffect(() => {
        fetchDispatches();
    }, [fetchDispatches]);

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchDispatches();
    };

    const handleClearFilters = () => {
        setDriverCuit("");
        setLicensePlate("");
        setClientName("");
        setDateInit(null);
        setDateEnd(null);
        setFilters({ page: 1, limit: 10 });
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    return (
        <Stack gap="md" h="100%">
            {/* Filters */}
            <Paper p="md" bg="#1a1a1a" withBorder style={{ borderColor: '#2d2d2d' }}>
                <Group gap="xs" mb="sm">
                    <IconFilter size={16} color="orange" />
                    <Text size="sm" fw={700} c="white">Filtros</Text>
                </Group>
                
                <Group grow gap="sm" wrap="wrap">
                    <TextInput
                        placeholder="CUIT Chofer"
                        leftSection={<IconId size={16} />}
                        value={driverCuit}
                        onChange={(e) => setDriverCuit(e.target.value)}
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }
                        }}
                    />
                    <TextInput
                        placeholder="Patente"
                        leftSection={<IconTruck size={16} />}
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }
                        }}
                    />
                    <TextInput
                        placeholder="Nombre Cliente"
                        leftSection={<IconUser size={16} />}
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }
                        }}
                    />
                </Group>
                
                <Group grow gap="sm" mt="sm" wrap="wrap">
                    <DateInput
                        placeholder="Fecha Desde"
                        leftSection={<IconCalendar size={16} />}
                        value={dateInit}
                        onChange={(date: any) => setDateInit(date)}
                        clearable
                        valueFormat="DD/MM/YYYY"
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }
                        }}
                    />
                    <DateInput
                        placeholder="Fecha Hasta"
                        leftSection={<IconCalendar size={16} />}
                        value={dateEnd}
                        onChange={(date: any) => setDateEnd(date)}
                        clearable
                        valueFormat="DD/MM/YYYY"
                        styles={{
                            input: { backgroundColor: "#0f0f0f", borderColor: "#2d2d2d", color: "white" }
                        }}
                    />
                    <Group gap="xs">
                        <Button
                            variant="light"
                            color="cyan"
                            leftSection={<IconSearch size={16} />}
                            onClick={handleSearch}
                        >
                            Buscar
                        </Button>
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={handleClearFilters}
                        >
                            Limpiar
                        </Button>
                    </Group>
                </Group>
            </Paper>

            {/* Results Summary */}
            <Group justify="space-between">
                <Text size="sm" c="dimmed">
                    {loading ? "Cargando..." : `${total} despachos encontrados`}
                </Text>
                <Badge color="orange" variant="light">
                    Página {filters.page} de {totalPages}
                </Badge>
            </Group>

            <Divider color="#2d2d2d" />

            {/* Results Table */}
            <ScrollArea h={isMobile ? 300 : 400} type="always" offsetScrollbars>
                {loading ? (
                    <Center h={200}><Loader color="orange" type="bars" /></Center>
                ) : dispatches.length === 0 ? (
                    <Center h={200}>
                        <Stack align="center" gap="sm">
                            <IconTruck size={48} color="gray" />
                            <Text c="dimmed" size="sm">No hay despachos que coincidan con los filtros</Text>
                        </Stack>
                    </Center>
                ) : (
                    <Table verticalSpacing="sm" highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th c="dimmed">Fecha</Table.Th>
                                <Table.Th c="dimmed">Cliente</Table.Th>
                                <Table.Th c="dimmed">Chofer</Table.Th>
                                <Table.Th c="dimmed">Patente</Table.Th>
                                <Table.Th c="dimmed">Items</Table.Th>
                                <Table.Th w={50}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {dispatches.map((dispatch) => (
                                <Table.Tr key={dispatch.id}>
                                    <Table.Td>
                                        <Text size="sm" c="white">
                                            {new Date(dispatch.createdAt).toLocaleDateString()}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="white" lineClamp={1}>
                                            {dispatch.project?.client?.fullname || 'Sin cliente'}
                                        </Text>
                                        <Text size="xs" c="dimmed" lineClamp={1}>
                                            {dispatch.project?.locationAddress || ''}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="white">
                                            {dispatch.firstName} {dispatch.lastName}
                                        </Text>
                                        {dispatch.cuit && (
                                            <Text size="xs" c="dimmed">{dispatch.cuit}</Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color="gray" variant="light" size="sm">
                                            {dispatch.licensePlate || 'N/A'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color="orange" variant="light" size="sm">
                                            {dispatch.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} unidades
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <PDFDownloadLink
                                            document={<DispatchPdf dispatch={dispatch} />}
                                            fileName={`Remito_${dispatch.firstName}${dispatch.lastName}_${new Date(dispatch.createdAt).toLocaleDateString().replace(/\//g, '-')}.pdf`}
                                        >
                                            {({ loading }) => (
                                                <Tooltip label="Descargar PDF" withArrow position="left">
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
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
                <Group justify="center">
                    <Pagination
                        total={totalPages}
                        value={filters.page || 1}
                        onChange={handlePageChange}
                        color="orange"
                        styles={{
                            control: {
                                backgroundColor: '#1a1a1a',
                                borderColor: '#2d2d2d',
                                color: 'white',
                                '&[data-active]': {
                                    backgroundColor: '#ff6b35',
                                    borderColor: '#ff6b35',
                                }
                            }
                        }}
                    />
                </Group>
            )}
        </Stack>
    );
};
