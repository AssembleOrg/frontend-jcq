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
import { useMediaQuery } from "@mantine/hooks";
import { 
  IconHistory, 
  IconEye, 
  IconDownload, 
  IconFileTypePdf, 
  IconPlus,
  IconPencil,
  IconDeviceFloppy 
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
  
  // Hook para detectar si es móvil (menos de 768px, que es el breakpoint 'md' de Mantine)
  const isMobile = useMediaQuery('(max-width: 768px)'); 

  // Estado para controlar la edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const [hours, setHours] = useState<{ [key: string]: number | string }>({
    lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo:"",
    lunesExtra:"", martesExtra:"", miercolesExtra:"", juevesExtra:"", viernesExtra:"", sabadoExtra:"", domingoExtra:"",
    ultSemana:"",
  });

  const [advance, setAdvance] = useState<number | string>("");
  
  const [totalPay, setTotalPay] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
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
    const sumAmounts = Object.values(hours).reduce((acc: number, curr: number | string) => acc + Number(curr || 0), 0);
    const adv = Number(advance || 0);
    
    setTotalAmount(sumAmounts);
    setTotalPay(sumAmounts - adv);
  }, [hours, advance]);

  const handleHourChange = (day: string, value: number | string) => {
    setHours(prev => ({ ...prev, [day]: value }));
    if(lastSavedRecord) setLastSavedRecord(null);
  };

  const handleResetForm = () => {
    setLastSavedRecord(null);
    setEditingId(null);
    setEditingDate(null);
    setHours({ 
        lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo: "",
        lunesExtra: "", martesExtra: "", miercolesExtra: "", juevesExtra: "", viernesExtra: "", sabadoExtra: "", domingoExtra: "",
        ultSemana: ""
    });
    setAdvance("");
  };

  const handleEdit = (record: any) => {
    setLastSavedRecord(null);
    setEditingId(record.id);
    setEditingDate(record.startDate || record.date);
    
    setHours({
      lunes: record.hoursMonday || "",
      martes: record.hoursTuesday || "",
      miercoles: record.hoursWednesday || "",
      jueves: record.hoursThursday || "",
      viernes: record.hoursFriday || "",
      sabado: record.hoursSaturday || "",
      domingo: record.hoursSunday || "",
      lunesExtra: record.hoursMondayExtra || "",
      martesExtra: record.hoursTuesdayExtra || "",
      miercolesExtra: record.hoursWednesdayExtra || "",
      juevesExtra: record.hoursThursdayExtra || "",
      viernesExtra: record.hoursFridayExtra || "",
      sabadoExtra: record.hoursSaturdayExtra || "",
      domingoExtra: record.hoursSundayExtra || "",
      ultSemana: record.hoursLastWeek || ""
    });
    
    setAdvance(record.advance || "");
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
      let recordDateStr = "";
      if (editingId && editingDate) {
         recordDateStr = editingDate;
      } else {
         const currentDay = referenceDate.getDay(); 
         const diffToMonday = referenceDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
         const mondayDate = new Date(referenceDate);
         mondayDate.setDate(diffToMonday);
         mondayDate.setHours(0, 0, 0, 0);
         recordDateStr = mondayDate.toISOString();
      }

      const payload: CreateWorkRecordDto = {
        staffId: staff.id,
        advance: Number(advance) || 0,
        hoursMonday: Number(hours.lunes) || 0,
        hoursTuesday: Number(hours.martes) || 0,
        hoursWednesday: Number(hours.miercoles) || 0,
        hoursThursday: Number(hours.jueves) || 0,
        hoursFriday: Number(hours.viernes) || 0,
        hoursSaturday: Number(hours.sabado) || 0,
        hoursSunday: Number(hours.domingo) || 0,
        hoursMondayExtra: Number(hours.lunesExtra) || 0,
        hoursTuesdayExtra: Number(hours.martesExtra) || 0,
        hoursWednesdayExtra: Number(hours.miercolesExtra) || 0,
        hoursThursdayExtra: Number(hours.juevesExtra) || 0,
        hoursFridayExtra: Number(hours.viernesExtra) || 0,
        hoursSaturdayExtra: Number(hours.sabadoExtra) || 0,
        hoursSundayExtra : Number(hours.domingoExtra) || 0,
        hoursLastWeek : Number(hours.ultSemana) || 0,
        startDate: recordDateStr, 
      };

      if (editingId) {
        await staffApi.updateWorkRecord(editingId, payload); 
      } else {
        await staffApi.createWorkRecord(payload);
      }

      await fetchHistory(); 
      
      const savedPdfData: PdfData = {
        employeeName: `${staff.firstName} ${staff.lastName}`,
        date: new Date(recordDateStr).toLocaleDateString(),
        amountsDetail: { 
            lunes:     { normal: Number(hours.lunes || 0), extra: Number(hours.lunesExtra || 0) },
            martes:    { normal: Number(hours.martes || 0), extra: Number(hours.martesExtra || 0) },
            miercoles: { normal: Number(hours.miercoles || 0), extra: Number(hours.miercolesExtra || 0) },
            jueves:    { normal: Number(hours.jueves || 0), extra: Number(hours.juevesExtra || 0) },
            viernes:   { normal: Number(hours.viernes || 0), extra: Number(hours.viernesExtra || 0) },
            sabado:    { normal: Number(hours.sabado || 0), extra: Number(hours.sabadoExtra || 0) },
            domingo:   { normal: Number(hours.domingo || 0), extra: Number(hours.domingoExtra || 0) }
        },
        lastWeekPayment: Number(hours.ultSemana || 0),
        grossTotal: totalAmount,
        advance: Number(advance),
        totalPay: totalPay
      };
      
      setLastSavedRecord(savedPdfData);
      setShouldRefreshParent(true); 
      setEditingId(null);

    } catch (error: any) {
      console.error("Error guardando:", error);
      const msg = error?.response?.data?.message || "Error al guardar.";
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMoneyInput = (key: string, label: string, color: string = "white") => (
    <NumberInput
      key={key}
      label={label}
      placeholder="0"
      thousandSeparator="."
      decimalSeparator=","
      leftSection={<Text size="xs" c="dimmed">$</Text>}
      min={0}
      allowNegative={false}
      value={hours[key]}
      onChange={(val) => handleHourChange(key, val)}
      disabled={!!lastSavedRecord}
      styles={{
        input: { 
          backgroundColor: "#0f0f0f", 
          borderColor: "#2d2d2d", 
          color: color, 
          textAlign: 'center', 
          paddingLeft: isMobile ? 18 : 24, 
          opacity: lastSavedRecord ? 0.5 : 1,
          fontSize: isMobile ? '12px' : '14px' 
        },
        label: { color: "#9ca3af", fontSize: 10, textAlign: 'center', width: '100%' }
      }}
      hideControls
    />
  );

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
                Empleado: <Text span fw={700} c="white">{staff?.firstName} {staff?.lastName}</Text>
            </Text>
            {editingId && (
                <Badge color="yellow" variant="filled">Modificando Registro</Badge>
            )}
          </Group>

          <Paper p={isMobile ? "xs" : "sm"} bg="#1a1a1a" withBorder style={{ borderColor: editingId ? '#fcc419' : '#2d2d2d' }}>
            <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Jornada Normal</Text>
            
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="xs" verticalSpacing="xs">
              {['sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => 
                renderMoneyInput(day, day.slice(0,3).toUpperCase())
              )}
            </SimpleGrid>

            <Divider 
                my="md" 
                color="#2d2d2d" 
                label={<Text size="xs" c="dimmed">Horas Extras</Text>} 
                labelPosition="center"
            />

            <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="xs" verticalSpacing="xs">
              {['sabadoExtra', 'domingoExtra', 'lunesExtra', 'martesExtra', 'miercolesExtra', 'juevesExtra', 'viernesExtra'].map((day) => 
                renderMoneyInput(day, day.replace('Extra','').slice(0,3).toUpperCase() + ' (EX)')
              )}
            </SimpleGrid>
          </Paper>

          <Group grow align="flex-start">
            <NumberInput
              label="Pago Semana Anterior"
              thousandSeparator="."
              decimalSeparator=","
              leftSection={<Text size="xs" c="dimmed">$</Text>}
              value={hours.ultSemana}
              placeholder="0"
              onChange={(val) => handleHourChange('ultSemana', val)}
              disabled={!!lastSavedRecord}
              styles={{ 
                input: { 
                  backgroundColor: "#0f0f0f", 
                  borderColor: "#2d2d2d", 
                  color: "#ffd43b",
                  opacity: lastSavedRecord ? 0.5 : 1 
                }, 
                label: {color: 'white'} 
              }}
            />

            <NumberInput
              label="Adelanto"
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
              <Text c="dimmed" size="sm">Adelanto: <Text span c="red">-${Number(advance || 0).toLocaleString('es-AR')}</Text></Text>
            </Group>
            <Divider my={8} color="#373a40" />
            <Group justify="space-between" align="center">
              <Text size="md" fw={700} c="orange">TOTAL A PAGAR:</Text>
              <Text size="xl" fw={900} c="green">
                $ {totalPay.toLocaleString('es-AR')}
              </Text>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="auto">
            {!lastSavedRecord ? (
                <>
                  <Button variant="default" onClick={editingId ? handleResetForm : handleSmartClose} styles={{ root: { backgroundColor: "transparent", borderColor: "#2d2d2d", color: "white" } }}>
                    {editingId ? "Cancelar Edición" : "Cancelar"}
                  </Button>
                  <Button 
                    color={editingId ? "yellow" : "green"} 
                    onClick={handleSave} 
                    loading={isSubmitting}
                    leftSection={editingId ? <IconDeviceFloppy size={18}/> : undefined}
                  >
                    {editingId ? "Guardar Cambios" : "Confirmar Carga"}
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
               <Text fw={700} c="white">Registros creados</Text>
             </Group>
             <Badge color="gray" variant="light">{history.length} Registros</Badge>
          </Group>

          <Divider color="#2d2d2d" />

          <ScrollArea h={isMobile ? 300 : 400} type="always" offsetScrollbars>
            {loadingHistory ? (
              <Center h={200}><Loader color="orange" type="bars" /></Center>
            ) : history.length === 0 ? (
              <Center h={200}><Text c="dimmed" size="sm">Sin registros previos</Text></Center>
            ) : (
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th c="dimmed">Fecha</Table.Th>
                    <Table.Th c="dimmed">Detalle Pago</Table.Th>
                    <Table.Th c="dimmed" style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.isArray(history) && history.map((record: any) => {
                     const grossTotal = (
                        (record.hoursMonday || 0) + (record.hoursTuesday || 0) + (record.hoursWednesday || 0) + 
                        (record.hoursThursday || 0) + (record.hoursFriday || 0) + (record.hoursSaturday || 0) + 
                        (record.hoursSunday || 0) +
                        (record.hoursMondayExtra || 0) + (record.hoursTuesdayExtra || 0) + (record.hoursWednesdayExtra || 0) +
                        (record.hoursThursdayExtra || 0) + (record.hoursFridayExtra || 0) + (record.hoursSaturdayExtra || 0) +
                        (record.hoursSundayExtra || 0) +
                        (record.hoursLastWeek || 0)
                      );

                    const isEditingThis = editingId === record.id;

                    return (
                    <Table.Tr key={record.id} bg={isEditingThis ? "rgba(252, 196, 25, 0.1)" : undefined}>
                      <Table.Td>
                        <Text size="sm" c="white">{new Date(record.startDate || record.date).toLocaleDateString()}</Text>
                        <Text size="xs" c="dimmed">Semana</Text>
                      </Table.Td>

                      <Table.Td>
                        <Stack gap={4}>
                           <Text size="sm" fw={500} c="white">
                             Bruto: ${grossTotal.toLocaleString('es-AR')}
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
                                 Ver detalle
                               </Button>
                             </Popover.Target>
                             <Popover.Dropdown style={{ backgroundColor: '#25262b', borderColor: '#373a40', color: 'white' }}>
                               <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Pagos por día</Text>
                               <Stack gap={4}>
                                 <Group justify="space-between">
                                   <Text size="xs">Sáb:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursSaturday + record.hoursSaturdayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Dom:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursSunday + record.hoursSundayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Lun:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursMonday + record.hoursMondayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Mar:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursTuesday + record.hoursTuesdayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Mié:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursWednesday + record.hoursWednesdayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Jue:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursThursday + record.hoursThursdayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 <Group justify="space-between">
                                   <Text size="xs">Vie:</Text>
                                   <Text size="xs" fw={700} c="orange">${(record.hoursFriday + record.hoursFridayExtra).toLocaleString('es-AR')}</Text>
                                 </Group>
                                 {record.hoursLastWeek > 0 && (
                                     <Group justify="space-between">
                                        <Text size="xs">Sem. Ant:</Text>
                                        <Text size="xs" fw={700} c="yellow">${record.hoursLastWeek.toLocaleString('es-AR')}</Text>
                                     </Group>
                                 )}
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
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                            <Tooltip label="Editar Carga" withArrow>
                                <ActionIcon 
                                    variant="subtle" 
                                    color="yellow" 
                                    onClick={() => handleEdit(record)}
                                >
                                    <IconPencil size={18} />
                                </ActionIcon>
                            </Tooltip>

                            <PDFDownloadLink
                                document={
                                    <WorkRecordPdf data={{
                                        employeeName: `${staff?.firstName} ${staff?.lastName}`,
                                        date: new Date(record.startDate || record.date).toLocaleDateString(),
                                        amountsDetail: {
                                            lunes:     { normal: record.hoursMonday || 0, extra: record.hoursMondayExtra || 0 },
                                            martes:    { normal: record.hoursTuesday || 0, extra: record.hoursTuesdayExtra || 0 },
                                            miercoles: { normal: record.hoursWednesday || 0, extra: record.hoursWednesdayExtra || 0 },
                                            jueves:    { normal: record.hoursThursday || 0, extra: record.hoursThursdayExtra || 0 },
                                            viernes:   { normal: record.hoursFriday || 0, extra: record.hoursFridayExtra || 0 },
                                            sabado:    { normal: record.hoursSaturday || 0, extra: record.hoursSaturdayExtra || 0 },
                                            domingo:   { normal: record.hoursSunday || 0, extra: record.hoursSundayExtra || 0 },
                                        },
                                        lastWeekPayment: record.hoursLastWeek || 0,
                                        grossTotal: grossTotal,
                                        advance: record.advance,
                                        totalPay: record.total
                                    }} />
                                }
                                fileName={`recibo_${staff?.lastName}${staff?.firstName}.pdf`}
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
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )})}
                </Table.Tbody>
              </Table>
            )}
          </ScrollArea>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};