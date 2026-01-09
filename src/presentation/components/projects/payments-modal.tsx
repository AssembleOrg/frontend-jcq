"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText, Receipt, DollarSign } from "lucide-react";
import type { Project, CreatePaidDto, Paid } from "@/src/core/entities";
import { usePaidsStore, useProjectsStore } from "@/src/presentation/stores";
import { useDolarStore } from "@/src/presentation/stores/dolar.store";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Badge,
  Stack,
  Group,
  Paper,
  Text,
  Box,
  ScrollArea,
  ActionIcon,
  Switch,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "dayjs/locale/es";
import {
  formatDate,
  formatARS,
  generatePaymentReceipt,
} from "@/src/presentation/utils";
import { DeleteConfirmationModal } from "@/src/presentation/components/common";

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onPaymentChange?: () => void; // Callback when payments change
}

export function PaymentsModal({
  isOpen,
  onClose,
  project,
  onPaymentChange,
}: PaymentsModalProps) {
  const { paids, fetchPaidsByProject, createPaid, deletePaid, isLoading } =
    usePaidsStore();
  const { fetchProjectById } = useProjectsStore();
  const { dolar, fetchDolar } = useDolarStore();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaid, setSelectedPaid] = useState<Paid | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<{
    amount: string;
    date: Date | string | null;
    bill: string;
    hasUSD: boolean;
    usdValue: string;
    amountUSD: string;
  }>({
    amount: "",
    date: null,
    bill: "",
    hasUSD: false,
    usdValue: "",
    amountUSD: "",
  });

  useEffect(() => {
    if (project && isOpen) {
      fetchPaidsByProject(project.id);
      fetchDolar();
    }
  }, [project, isOpen, fetchPaidsByProject, fetchDolar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 handleSubmit called", { formData, project });

    if (!project) {
      console.error("❌ No project");
      return;
    }

    // Validate required fields
    if (!formData.date || !formData.amount) {
      console.error("❌ Missing required fields", { 
        date: formData.date, 
        amount: formData.amount 
      });
      return;
    }

    console.log("✅ Validation passed, creating paid...");

    try {
      // Format date to YYYY-MM-DD (local timezone, no UTC conversion)
      let dateString: string;
      if (formData.date instanceof Date) {
        // Get local date components to avoid timezone issues
        const year = formData.date.getFullYear();
        const month = String(formData.date.getMonth() + 1).padStart(2, '0');
        const day = String(formData.date.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      } else if (typeof formData.date === 'string') {
        // Already in string format, validate and use
        dateString = formData.date;
      } else {
        throw new Error("Invalid date format");
      }
      
      const data: CreatePaidDto = {
        amount: parseFloat(formData.amount),
        date: dateString,
        bill: formData.bill,
        projectId: project.id,
        hasUSD: formData.hasUSD,
        usdValue: formData.hasUSD && formData.usdValue ? parseFloat(formData.usdValue) : undefined,
        amountUSD: formData.hasUSD && formData.amountUSD ? parseFloat(formData.amountUSD) : undefined,
      };

      console.log("📤 Sending data:", data);
      const newPaid = await createPaid(data);
      console.log("✅ Paid created successfully", newPaid);
      
      // Generate PDF receipt automatically after creating the payment
      // includeRemaining: true para mostrar el saldo restante cuando se crea un pago
      if (newPaid && project.client) {
        console.log("📄 Generating PDF receipt...");
        await generatePaymentReceipt({
          paid: newPaid,
          client: project.client,
          projectName: project.event 
            ? `${project.client.fullname} - ${project.event}`
            : project.client.fullname,
          project: project,
          includeRemaining: true, // Muestra el saldo restante al crear el pago
        });
      }
      
      await fetchProjectById(project.id); // Refresh project data
      
      // Notify parent component to refresh
      if (onPaymentChange) {
        onPaymentChange();
      }

      setFormData({ amount: "", date: null, bill: "", hasUSD: false, usdValue: "", amountUSD: "" });
      setShowForm(false);
    } catch (error) {
      console.error("❌ Error creating paid:", error);
      // Error handled by store
    }
  };

  const handleDeleteClick = (paid: Paid) => {
    setSelectedPaid(paid);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPaid) return;

    setIsDeleting(true);
    try {
      await deletePaid(selectedPaid.id);
      if (project) {
        await fetchProjectById(project.id); // Refresh project data
      }
      
      // Notify parent component to refresh
      if (onPaymentChange) {
        onPaymentChange();
      }
      
      setShowDeleteModal(false);
      setSelectedPaid(null);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateReceipt = async (paidId: string) => {
    if (!project?.client) {
      alert("No se puede generar el comprobante: falta información del cliente");
      return;
    }

    const paid = paids.find((p) => p.id === paidId);
    if (!paid) return;

    // includeRemaining: false para NO mostrar el saldo restante al re-descargar
    await generatePaymentReceipt({
      paid,
      client: project.client,
      projectName: project.event 
        ? `${project.client.fullname} - ${project.event}`
        : project.client.fullname,
      project: project,
      includeRemaining: false, // No muestra el saldo restante al descargar desde la lista
    });
  };

  if (!project) return null;

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
      title={`Pagos - ${project.client.fullname}`}
      size="lg"
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
      <Stack gap="md">
        {/* Project Summary */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: "#2d2d2d",
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Monto Total:
              </Text>
              <Text size="sm" fw={600} c="white">
                {formatARS(project.amount)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Total Pagado:
              </Text>
              <Text size="sm" fw={600} c="#10b981">
                {formatARS(project.totalPaid)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#9ca3af">
                Restante:
              </Text>
              <Text size="sm" fw={600} c="#f59e0b">
                {formatARS(project.rest)}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* Add Payment Button */}
        {!showForm && (
          <Button
            variant="light"
            color="orange"
            leftSection={<Plus size={16} />}
            onClick={() => setShowForm(true)}
            fullWidth
          >
            Agregar Pago
          </Button>
        )}

        {/* Payment Form */}
        {showForm && (
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              backgroundColor: "#0a0a0a",
              borderColor: "#2d2d2d",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <NumberInput
                  label="Monto"
                  placeholder="100.000"
                  value={formData.amount ? parseFloat(formData.amount) : undefined}
                  onChange={(value) => {
                    const amountValue = value?.toString() || "";
                    // Si hasUSD está activo, recalcular el monto USD
                    let calcUSD = formData.amountUSD;
                    if (formData.hasUSD && value && formData.usdValue && parseFloat(formData.usdValue) > 0) {
                      calcUSD = (Number(value) / parseFloat(formData.usdValue)).toFixed(2);
                    }
                    setFormData({ ...formData, amount: amountValue, amountUSD: calcUSD });
                  }}
                  required
                  min={0}
                  hideControls
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={0}
                  styles={inputStyles}
                />
                <DatePickerInput
                  label="Fecha"
                  placeholder="Seleccionar fecha"
                  value={formData.date}
                  onChange={(value) => {
                    console.log("📅 Date changed:", value);
                    setFormData({ ...formData, date: value as Date | null });
                  }}
                  required
                  locale="es"
                  valueFormat="DD/MM/YYYY"
                  styles={{
                    label: { color: "#e5e7eb", marginBottom: "0.5rem" },
                    input: {
                      backgroundColor: "#2d2d2d",
                      borderColor: "#404040",
                      color: "white",
                    },
                  }}
                />
                <TextInput
                  label="Nº Factura (opcional)"
                  placeholder="FC-2025-001"
                  value={formData.bill}
                  onChange={(e) =>
                    setFormData({ ...formData, bill: e.target.value })
                  }
                  styles={inputStyles}
                />

                {/* Sección USD */}
                <Paper p="xs" style={{ backgroundColor: formData.hasUSD ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.03)", border: formData.hasUSD ? "1px solid #22c55e" : "1px solid #404040", borderRadius: "6px" }}>
                  <Group justify="space-between" mb={formData.hasUSD ? "xs" : 0}>
                    <Text size="xs" fw={500} c={formData.hasUSD ? "#22c55e" : "#9ca3af"}>Pago en Dólares</Text>
                    <Switch
                      checked={formData.hasUSD}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        // Al activar, usar el valor actual del dólar
                        const currentUsdValue = dolar?.venta?.toString() || "";
                        let calcUSD = "";
                        if (checked && formData.amount && dolar?.venta) {
                          calcUSD = (parseFloat(formData.amount) / dolar.venta).toFixed(2);
                        }
                        setFormData({
                          ...formData,
                          hasUSD: checked,
                          usdValue: checked ? currentUsdValue : "",
                          amountUSD: calcUSD
                        });
                      }}
                      size="xs"
                      color="green"
                    />
                  </Group>
                  {formData.hasUSD && (
                    <Stack gap="xs">
                      <NumberInput
                        label="Valor del Dólar"
                        placeholder="0.00"
                        value={formData.usdValue ? parseFloat(formData.usdValue) : undefined}
                        onChange={(value) => {
                          const usdVal = value?.toString() || "";
                          // Recalcular amountUSD con el nuevo valor del dólar
                          let calcUSD = "";
                          if (formData.amount && value && Number(value) > 0) {
                            calcUSD = (parseFloat(formData.amount) / Number(value)).toFixed(2);
                          }
                          setFormData({ ...formData, usdValue: usdVal, amountUSD: calcUSD });
                        }}
                        min={0}
                        decimalScale={2}
                        prefix="$ "
                        styles={{ 
                          label: { color: "#9ca3af", marginBottom: "0.25rem", fontSize: "11px" }, 
                          input: { ...inputStyles.input, borderColor: "#22c55e" } 
                        }}
                      />
                      <NumberInput
                        label="Monto en USD (editar para auto-calcular ARS)"
                        placeholder="0.00"
                        value={formData.amountUSD ? parseFloat(formData.amountUSD) : undefined}
                        onChange={(value) => {
                          const usdAmount = value?.toString() || "";
                          // Calcular monto ARS automáticamente
                          let calcARS = formData.amount;
                          if (value && formData.usdValue && parseFloat(formData.usdValue) > 0) {
                            calcARS = (Number(value) * parseFloat(formData.usdValue)).toFixed(0);
                          }
                          setFormData({ ...formData, amountUSD: usdAmount, amount: calcARS });
                        }}
                        min={0}
                        decimalScale={2}
                        prefix="USD "
                        styles={{ 
                          label: { color: "#22c55e", marginBottom: "0.25rem", fontSize: "11px" }, 
                          input: { ...inputStyles.input, borderColor: "#22c55e" } 
                        }}
                      />
                    </Stack>
                  )}
                </Paper>

                <Group gap="xs" justify="flex-end">
                  <Button
                    type="button"
                    variant="subtle"
                    color="gray"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" color="orange" loading={isLoading}>
                    Guardar Pago
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        )}

        {/* Payments List */}
        <ScrollArea h={400} type="auto">
          <Stack gap="sm">
            {paids.length === 0 ? (
              <Text ta="center" c="#9ca3af" py="xl">
                No hay pagos registrados
              </Text>
            ) : (
              paids.map((paid) => (
                <Paper
                  key={paid.id}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "#2d2d2d",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d2d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#0a0a0a";
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Text fw={600} c="white" size="lg">
                          {formatARS(paid.amount)}
                        </Text>
                        {paid.hasUSD && paid.amountUSD && (
                          <Badge
                            color="green"
                            variant="light"
                            leftSection={<DollarSign size={10} />}
                            size="sm"
                          >
                            USD {paid.amountUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Badge>
                        )}
                        {paid.bill && (
                          <Badge
                            color="gray"
                            variant="light"
                            leftSection={<FileText size={12} />}
                            size="sm"
                          >
                            {paid.bill}
                          </Badge>
                        )}
                      </Group>
                      <Group gap="xs">
                        <Calendar size={14} color="#9ca3af" />
                        <Text size="sm" c="#9ca3af">
                          {formatDate(paid.date)}
                        </Text>
                      </Group>
                    </Box>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="orange"
                        size="lg"
                        onClick={() => handleGenerateReceipt(paid.id)}
                        title="Descargar comprobante PDF"
                      >
                        <Receipt size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="lg"
                        onClick={() => handleDeleteClick(paid)}
                        title="Eliminar pago"
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>

      {/* Delete Payment Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPaid(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Pago"
        message="¿Está seguro que desea eliminar este pago?"
        itemName={
          selectedPaid
            ? `${formatARS(selectedPaid.amount)} - ${formatDate(selectedPaid.date)}${
                selectedPaid.bill ? ` - ${selectedPaid.bill}` : ""
              }`
            : ""
        }
        isLoading={isDeleting}
      />
    </Modal>
  );
}
