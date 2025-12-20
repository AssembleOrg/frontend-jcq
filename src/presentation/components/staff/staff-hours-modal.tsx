import { useState, useEffect, useCallback } from "react";
import { 
  Button, 
  NumberInput, 
  Group, 
  Stack, 
  Text, 
  SimpleGrid, 
  Paper,
  Divider,
  Loader,
  ScrollArea,
  Grid,
  Table,
  Badge,
  Popover,
  Center,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import { 
  IconHistory, 
  IconEye, 
  IconDownload, 
  IconFileTypePdf, 
  IconPlus 
} from "@tabler/icons-react"; 
import { staffApi } from "@/src/infrastructure/api/staff.api";
import type { Staff } from "@/src/core/entities";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { WorkRecordPdf, PdfData } from './work-record-pdf';
import { CreateWorkRecordDto } from "@/src/core/entities";

interface StaffHoursModalProps {
  staff: Staff | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffHoursModal = ({ staff, onClose, onSuccess }: StaffHoursModalProps) => {
  const [referenceDate] = useState<Date>(new Date());
  
  // Strings vacios para placeholders 
  const [hours, setHours] = useState<{ [key: string]: number | string }>({
    lunes: "", 
    martes: "", 
    miercoles: "", 
    jueves: "", 
    viernes: "",
    sabado: "",
    domingo:"",
  });

  const [hourlyRate, setHourlyRate] = useState<number | string>("");
  const [advance, setAdvance] = useState<number | string>("");
  
  const [totalPay, setTotalPay] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedRecord, setLastSavedRecord] = useState<PdfData | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [shouldRefreshParent, setShouldRefreshParent] = useState(false); 

  const fetchHistory = useCallback(async () => {
    if (!staff?.id) return;
    try {
      setLoadingHistory(true);
      const records = await staffApi.getWorkRecords(staff.id);
      setHistory(records || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [staff]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const sumHours = Object.values(hours).reduce((acc: number, curr: number | string) => acc + Number(curr || 0), 0);
    
    const rate = Number(hourlyRate || 0);
    const adv = Number(advance || 0);
    
    setTotalHours(sumHours);
    setTotalPay((sumHours * rate) - adv);
  }, [hours, hourlyRate, advance]);

  const handleHourChange = (day: string, value: number | string) => {
    setHours(prev => ({ ...prev, [day]: value }));
  };

  const handleResetForm = () => {
    setLastSavedRecord(null);
    setHours({ lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo: "" });
    setAdvance("");
  };

  const handleSmartClose = () => {
    if (shouldRefreshParent) {
      onSuccess(); 
    } else {
      onClose(); 
    }
  };

  const handleSave = async () => {
    if (!staff) return;
    setIsSubmitting(true);

    try {
      const currentDay = referenceDate.getDay(); 
      const diffToMonday = referenceDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
      const mondayDate = new Date(referenceDate);
      mondayDate.setDate(diffToMonday);
      mondayDate.setHours(0, 0, 0, 0);

      // Enviar datos limpios al backend
      const payload: CreateWorkRecordDto = {
        staffId: staff.id,
        valuePerHour: Number(hourlyRate) || 0,
        advance: Number(advance) || 0,
        hoursMonday: Number(hours.lunes) || 0,
        hoursTuesday: Number(hours.martes) || 0,
        hoursWednesday: Number(hours.miercoles) || 0,
        hoursThursday: Number(hours.jueves) || 0,
        hoursFriday: Number(hours.viernes) || 0,
        hoursSaturday: Number(hours.sabado) || 0,
        hoursSunday: Number(hours.domingo) || 0,
        startDate: mondayDate.toISOString(), 
      };

      await staffApi.createWorkRecord(payload);
      await fetchHistory(); 
      
      const savedPdfData: PdfData = {
        employeeName: `${staff.firstName} ${staff.lastName}`,
        date: new Date().toLocaleDateString(),
        hoursDetail: { 
            lunes: Number(hours.lunes || 0),
            martes: Number(hours.martes || 0),
            miercoles: Number(hours.miercoles || 0),
            jueves: Number(hours.jueves || 0),
            viernes: Number(hours.viernes || 0),
            sabado: Number(hours.sabado || 0),
            domingo: Number(hours.domingo || 0)
        },
        totalHours: totalHours,
        hourlyRate: Number(hourlyRate),
        advance: Number(advance),
        totalPay: totalPay
      };
      
      setLastSavedRecord(savedPdfData);
      setShouldRefreshParent(true); 

    } catch (error: any) {
      console.error("Error guardando:", error);
      const msg = error?.response?.data?.message || "Error al guardar.";
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Empleado: <Text span fw={700} c="white">{staff?.firstName} {staff?.lastName}</Text>
          </Text>

          <Paper p="sm" bg="#1a1a1a" withBorder style={{ borderColor: '#2d2d2d' }}>
            <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Registro Diario (Lun - Dom)</Text>
            <SimpleGrid cols={5} spacing="xs" verticalSpacing="xs">
              {Object.keys(hours).map((day) => (
                <NumberInput
                  key={day}
                  label={day.slice(0,3).toUpperCase()}
                  placeholder="0"
                  min={0}
                  max={24}
                  allowNegative={false}
                  value={hours[day]}
                  onChange={(val) => handleHourChange(day, val)}
                  disabled={!!lastSavedRecord}
                  styles={{
                    input: { 
                      backgroundColor: "#0f0f0f", 
                      borderColor: "#2d2d2d", 
                      color: "white", 
                      textAlign: 'center', 
                      padding: '0 2px',
                      opacity: lastSavedRecord ? 0.5 : 1
                    },
                    label: { color: "#9ca3af", fontSize: 10, textAlign: 'center', width: '100%' }
                  }}
                  hideControls
                />
              ))}
            </SimpleGrid>
          </Paper>

          <Group grow>
            <NumberInput
              label="Valor Hora ($)"
              thousandSeparator="."
              decimalSeparator=","
              leftSection={<Text size="xs" c="dimmed">$</Text>}
              value={hourlyRate}
              placeholder="0"
              onChange={(val) => { setHourlyRate(val); if(lastSavedRecord) setLastSavedRecord(null); }}
              disabled={!!lastSavedRecord}
              styles={{ 
                input: { 
                  backgroundColor: "#0f0f0f", 
                  borderColor: "#2d2d2d", 
                  color: "white",
                  opacity: lastSavedRecord ? 0.5 : 1 
                }, 
                label: {color: 'white'} 
              }}
            />
            <NumberInput
              label="Adelanto ($)"
              thousandSeparator="."
              decimalSeparator=","
              leftSection={<Text size="xs" c="dimmed">$</Text>}
              value={advance}
              placeholder="0"
              onChange={(val) => { setAdvance(val); if(lastSavedRecord) setLastSavedRecord(null); }}
              disabled={!!lastSavedRecord}
              styles={{ 
                input: { 
                  backgroundColor: "#0f0f0f", 
                  borderColor: "#2d2d2d", 
                  color: "#ef4444",
                  opacity: lastSavedRecord ? 0.5 : 1
                }, 
                label: {color: 'white'} 
              }}
            />
          </Group>

          <Paper p="md" radius="md" style={{ backgroundColor: "#25262b", border: "1px solid #373a40" }}>
            <Group justify="space-between">
              <Text c="dimmed" size="sm">Total Horas: <Text span c="white" fw={700}>{totalHours}hs</Text></Text>
              <Text c="dimmed" size="sm">Adelanto: <Text span c="red">-${Number(advance || 0)}</Text></Text>
            </Group>
            <Divider my={8} color="#373a40" />
            <Group justify="space-between" align="center">
              <Text size="md" fw={700} c="orange">TOTAL ESTIMADO:</Text>
              <Text size="xl" fw={900} c="green">
                $ {totalPay.toLocaleString('es-AR')}
              </Text>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="auto">
            {!lastSavedRecord ? (
                <>
                  <Button variant="default" onClick={handleSmartClose} styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}>
                    Cancelar
                  </Button>
                  <Button color="green" onClick={handleSave} loading={isSubmitting}>
                    Confirmar Carga
                  </Button>
                </>
            ) : (
                <>
                  <Button 
                    variant="subtle" 
                    color="gray" 
                    onClick={handleResetForm}
                    leftSection={<IconPlus size={16}/>}
                  >
                    Nueva Carga
                  </Button>
                  
                  <PDFDownloadLink
                    document={<WorkRecordPdf data={lastSavedRecord} />}
                    fileName={`LiquidacionSemanal_${staff?.lastName}_${new Date().toLocaleDateString()}.pdf`}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ loading }) => (
                      <Button 
                        color="blue" 
                        leftSection={<IconDownload size={18} />}
                        loading={loading}
                      >
                        Descargar Comprobante
                      </Button>
                    )}
                  </PDFDownloadLink>
                </>
            )}
          </Group>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }} style={{ borderLeft: '1px solid #2d2d2d' }}>
        <Stack h="100%">
          <Group justify="space-between">
             <Group gap="xs">
               <IconHistory size={20} color="orange" />
               <Text fw={700} c="white">Registros creados</Text>
             </Group>
             <Badge color="gray" variant="light">{history.length} Registros</Badge>
          </Group>

          <Divider color="#2d2d2d" />

          <ScrollArea h={400} type="always" offsetScrollbars>
            {loadingHistory ? (
              <Center h={200}><Loader color="orange" type="bars" /></Center>
            ) : history.length === 0 ? (
              <Center h={200}><Text c="dimmed" size="sm">Sin registros previos</Text></Center>
            ) : (
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th c="dimmed">Fecha</Table.Th>
                    <Table.Th c="dimmed">Detalle</Table.Th>
                    <Table.Th c="dimmed" style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th w={50}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.isArray(history) && history.map((record: any) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text size="sm" c="white">{new Date(record.startDate || record.date).toLocaleDateString()}</Text>
                        <Text size="xs" c="dimmed">Semana</Text>
                      </Table.Td>

                      <Table.Td>
                        <Stack gap={4}>
                           <Text size="sm" fw={500} c="white">
                             {(record.hoursMonday + record.hoursTuesday + record.hoursWednesday + record.hoursThursday + record.hoursFriday + record.hoursSaturday + record.hoursSunday) || record.hours || 0} hs totales
                           </Text>

                           <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                             Valor: <Text span c="orange" fw={700}>${record.valuePerHour?.toLocaleString('es-AR')}</Text> /hr
                           </Text>
                           
                           <Popover width={200} position="bottom" withArrow shadow="md">
                             <Popover.Target>
                               <Button 
                                 size="compact-xs" 
                                 variant="subtle" 
                                 color="gray" 
                                 leftSection={<IconEye size={12} />}
                                 styles={{ 
                                   root: { justifyContent: 'flex-start', paddingLeft: 0, height: 24 },
                                   label: { fontSize: 11 } 
                                 }}
                               >
                                 Ver días
                               </Button>
                             </Popover.Target>
                             <Popover.Dropdown style={{ backgroundColor: '#25262b', borderColor: '#373a40', color: 'white' }}>
                               <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Desglose Semanal</Text>
                               <Stack gap={4}>
                                 <Group justify="space-between">
                                   <Text size="xs">Lunes:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursMonday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Martes:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursTuesday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Miércoles:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursWednesday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Jueves:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursThursday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Viernes:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursFriday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Sabado:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursSaturday || 0} hs</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Domingo:</Text>
                                   <Text size="xs" fw={700} c="orange">{record.hoursSunday || 0} hs</Text>
                                 </Group>
                               </Stack>
                             </Popover.Dropdown>
                           </Popover>

                           {record.advance > 0 && (
                            <Badge size="xs" color="red" variant="filled" radius="sm">Adelanto: -${record.advance}</Badge>
                          )}
                        </Stack>
                      </Table.Td>

                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text fw={700} size="sm" c="green">
                          ${record.total?.toLocaleString('es-AR')}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <PDFDownloadLink
                             document={
                                <WorkRecordPdf data={{
                                    employeeName: `${staff?.firstName} ${staff?.lastName}`,
                                    date: new Date(record.startDate || record.date).toLocaleDateString(),
                                    hoursDetail: {
                                        lunes: record.hoursMonday || 0,
                                        martes: record.hoursTuesday || 0,
                                        miercoles: record.hoursWednesday || 0,
                                        jueves: record.hoursThursday || 0,
                                        viernes: record.hoursFriday || 0,
                                        sabado: record.hoursSaturday || 0,
                                        domingo: record.hoursSunday || 0,
                                    },
                                    totalHours: (record.hoursMonday + record.hoursTuesday + record.hoursWednesday + record.hoursThursday + record.hoursFriday + record.hoursSaturday + record.hoursSunday),
                                    hourlyRate: record.valuePerHour,
                                    advance: record.advance,
                                    totalPay: record.total
                                }} />
                             }
                             fileName={`recibo_${record.id}.pdf`}
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
                                        <IconFileTypePdf size={20} />
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
        </Stack>
      </Grid.Col>
    </Grid>
  );
};