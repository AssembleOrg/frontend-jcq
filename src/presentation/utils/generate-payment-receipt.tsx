import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paid, Client, Project } from "@/src/core/entities";
import { formatARS } from "./format-currency";

interface PaymentReceiptData {
  paid: Paid;
  client: Client;
  projectName?: string;
  project?: Project;
  includeRemaining?: boolean; // Si es true, muestra el monto restante
}

// Estilos modernos y delicados
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    position: "relative",
  },
  // Marca de agua
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  watermark: {
    position: "absolute",
    fontSize: 60,
    color: "#000000",
    opacity: 0.03,
    transform: "rotate(-45deg)",
    fontWeight: "bold",
    letterSpacing: 4,
  },
  // Encabezado
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "2px solid #ff6b35",
  },
  headerLeft: {
    flexDirection: "column",
  },
  logo: {
    width: 60,
    height: 30,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
    lineHeight: 1.3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ff6b35",
    marginBottom: 6,
  },
  docNumber: {
    fontSize: 9,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  docDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Título central
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 25,
    letterSpacing: 1,
  },
  // Sección de cliente
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ff6b35",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clientBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 15,
    marginBottom: 25,
    borderLeft: "3px solid #ff6b35",
  },
  clientRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  clientLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    width: 90,
  },
  clientValue: {
    fontSize: 9,
    color: "#1a1a1a",
    flex: 1,
  },
  // Tabla de detalles
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ff6b35",
    padding: 10,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottom: "1px solid #e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 9,
    color: "#1a1a1a",
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  col1: {
    width: "30%",
  },
  col2: {
    width: "45%",
  },
  col3: {
    width: "25%",
    textAlign: "right",
  },
  // Totales
  totalsContainer: {
    alignItems: "flex-end",
    marginTop: 15,
    paddingTop: 15,
    borderTop: "1px solid #e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 10,
    color: "#1a1a1a",
  },
  remainingRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed #e5e7eb",
  },
  remainingLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff6b35",
  },
  remainingValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff6b35",
  },
  totalFinal: {
    fontSize: 12,
    fontWeight: "bold",
    paddingTop: 8,
    borderTop: "2px solid #1a1a1a",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 2,
  },
});

// Componente de marca de agua repetida
const Watermark: React.FC = () => {
  const positions: Array<{ x: number; y: number }> = [];
  
  // Generar posiciones para la marca de agua con espaciado muy amplio (menos superposición)
  for (let x = -100; x < 800; x += 280) {
    for (let y = 50; y < 1000; y += 200) {
      positions.push({ x, y });
    }
  }

  return (
    <View style={styles.watermarkContainer}>
      {positions.map((pos, idx) => (
        <Text
          key={idx}
          style={[
            styles.watermark,
            { top: pos.y, left: pos.x },
          ]}
        >
          JCQ ANDAMIOS
        </Text>
      ))}
    </View>
  );
};

// Componente del documento PDF
const PaymentReceiptDocument: React.FC<PaymentReceiptData> = ({
  paid,
  client,
  projectName,
  project,
  includeRemaining = false,
}) => {
  const emissionDate = format(new Date(), "dd/MM/yyyy");
  const paymentDate = format(new Date(paid.date), "dd 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  // Calcular monto restante si se proporciona el proyecto
  const remaining = project ? project.amount - paid.amount : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Watermark />

        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/jcq.png" style={styles.logo} />
            <Text style={styles.companyName}>J.C.Q. ANDAMIOS S.A.</Text>
            <Text style={styles.companyInfo}>C.U.I.T. No 30-71577465-4</Text>
            <Text style={styles.companyInfo}>
              ESPAÑA 130 – PISO 1 – Dto. 9 – AVELLANEDA
            </Text>
            <Text style={styles.companyInfo}>Tel: 11-6098-6558</Text>
            <Text style={styles.companyInfo}>Email: jcqandamios@gmail.com</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>COMPROBANTE DE PAGO</Text>
            <Text style={styles.docNumber}>
              N°: {paid.number || paid.id.substring(0, 13)}
            </Text>
            <Text style={styles.docDate}>Fecha: {emissionDate}</Text>
          </View>
        </View>

        {/* TÍTULO CENTRAL */}
        <Text style={styles.mainTitle}>COMPROBANTE</Text>

        {/* DATOS DEL CLIENTE */}
        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
        <View style={styles.clientBox}>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Razón Social:</Text>
            <Text style={styles.clientValue}>{client.fullname}</Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Teléfono:</Text>
            <Text style={styles.clientValue}>{client.phone || "N/A"}</Text>
          </View>
          {client.cuit && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>CUIT:</Text>
              <Text style={styles.clientValue}>{client.cuit}</Text>
            </View>
          )}
          {client.dni && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>DNI:</Text>
              <Text style={styles.clientValue}>{client.dni}</Text>
            </View>
          )}
        </View>

        {/* DETALLE DEL PAGO */}
        <Text style={styles.sectionTitle}>Detalle del Pago</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Concepto</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>
              Descripción
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Importe</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, styles.col1]}>
              Fecha de Pago
            </Text>
            <Text style={[styles.tableCell, styles.col2]}>{paymentDate}</Text>
            <Text style={[styles.tableCell, styles.col3]}>-</Text>
          </View>

          {projectName && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCellBold, styles.col1]}>Proyecto</Text>
              <Text style={[styles.tableCell, styles.col2]}>{projectName}</Text>
              <Text style={[styles.tableCell, styles.col3]}>-</Text>
            </View>
          )}

          {paid.bill && (
            <View style={[styles.tableRow, projectName ? {} : styles.tableRowAlt]}>
              <Text style={[styles.tableCellBold, styles.col1]}>
                N° Factura
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>{paid.bill}</Text>
              <Text style={[styles.tableCell, styles.col3]}>-</Text>
            </View>
          )}

          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, styles.col1]}>
              Monto Pagado
            </Text>
            <Text style={[styles.tableCell, styles.col2]}>Pago recibido</Text>
            <Text style={[styles.tableCellBold, styles.col3]}>
              {formatARS(paid.amount)}
            </Text>
          </View>
        </View>

        {/* TOTALES */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatARS(paid.amount)}</Text>
          </View>

          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={[styles.totalLabel, styles.totalFinal]}>TOTAL PAGADO:</Text>
            <Text style={[styles.totalValue, styles.totalFinal]}>
              {formatARS(paid.amount)}
            </Text>
          </View>

          {/* Mostrar monto restante solo si includeRemaining es true */}
          {includeRemaining && project && remaining > 0 && (
            <View style={[styles.totalRow, styles.remainingRow]}>
              <Text style={styles.remainingLabel}>RESTANTE:</Text>
              <Text style={styles.remainingValue}>
                {formatARS(remaining)}
              </Text>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>NO VÁLIDO COMO FACTURA</Text>
          <Text style={styles.footerText}>
            Este comprobante no tiene validez como documento fiscal.
          </Text>
          <Text style={styles.footerText}>
            Para consultas, contacte a jcqandamios@gmail.com o al Tel: 11-6098-6558
          </Text>
          <Text style={styles.footerText}>
            Documento generado el{" "}
            {format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
              locale: es,
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Genera y descarga un PDF de comprobante de pago con diseño profesional
 */
export async function generatePaymentReceipt(
  data: PaymentReceiptData
): Promise<void> {
  const { paid, client, includeRemaining = false } = data;

  // Generar el documento PDF
  const blob = await pdf(<PaymentReceiptDocument {...data} />).toBlob();

  // Crear nombre de archivo
  const cleanClientName = client.fullname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-zA-Z0-9\s]/g, "") // Quitar caracteres especiales
    .replace(/\s+/g, "_") // Reemplazar espacios con guión bajo
    .substring(0, 50); // Limitar longitud

  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const fileName = `Comprobante_${cleanClientName}_${timestamp}.pdf`;

  // Descargar el archivo
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
