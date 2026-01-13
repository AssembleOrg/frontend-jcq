import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Budget } from '@/src/core/entities';
import { formatCurrency } from '@/src/presentation/utils/format-currency';
import { formatDate } from '@/src/presentation/utils/format';

const COLORS = {
  primary: '#ea580c',    
  dark: '#1a1a1a',       
  gray: '#6b7280',       
  lightGray: '#f3f4f6',  
  white: '#ffffff',
  watermark: '#ea580c'
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    padding: 40,
    fontFamily: 'Helvetica',
    position: 'relative',
    fontSize: 10,
  },

  // Marca de agua de fondo
  watermarkContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    opacity: 0.08,
  },
  watermarkText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: COLORS.watermark,
    transform: 'rotate(-45deg)',
    textTransform: 'uppercase'
  },

  // Cabecera
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Agregado para centrar verticalmente el logo y el título
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  companySub: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
  },
  budgetInfo: {
    alignItems: 'flex-end',
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    textTransform: 'uppercase',
  },
  budgetDate: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
  },

  // Información del Cliente
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 80,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  value: {
    flex: 1,
    color: COLORS.gray,
  },

  // Tabla
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    padding: 8,
    alignItems: 'center',
  },
  tableCell: {
    color: COLORS.dark,
    fontSize: 10,
  },
  // Anchos de columnas
  colIndex: { width: '10%', textAlign: 'center' },
  colQty: { width: '15%', textAlign: 'center' },
  colDesc: { width: '75%', textAlign: 'left', paddingLeft: 10 },

  // Totales
  totalContainer: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalLabel: {
    color: COLORS.gray,
    fontSize: 10,
  },
  totalValue: {
    color: COLORS.dark,
    fontWeight: 'bold',
    fontSize: 10,
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  finalTotalText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
  }
});

export const BudgetPdfDocument = ({ budget }: { budget: Budget }) => {
  const clientName = budget.client?.fullname || budget.manualClientName || 'Consumidor Final';
  const clientCuit = budget.client?.cuit || budget.manualClientCuit || '-';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Marca de agua */}
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>JCQ ANDAMIOS</Text>
        </View>

        {/* Cabecera */}
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              src="/jcq.png"
              style={{ width: 90, marginRight: 12 }}
            />
            <View style={styles.logoContainer}>
              <Text style={styles.companyName}>JCQ ANDAMIOS</Text>
              <Text style={styles.companySub}>Alquiler y Montaje de Estructuras</Text>
            </View>
          </View>

          <View style={styles.budgetInfo}>
            <Text style={styles.budgetTitle}>PRESUPUESTO</Text>
            <Text style={styles.budgetDate}>N° {budget.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.budgetDate}>{formatDate(budget.date)}</Text>
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CUIT/DNI:</Text>
            <Text style={styles.value}>{clientCuit}</Text>
          </View>
        </View>

        {/* Tabla de Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>CANT</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIPCIÓN / DETALLE</Text>
          </View>

          {budget.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colIndex]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {item.manualName || item.structure?.name || 'Ítem sin descripción'}
              </Text>
            </View>
          ))}
          
          {budget.items.length < 5 && Array.from({ length: 5 - budget.items.length }).map((_, i) => (
             <View key={`empty-${i}`} style={styles.tableRow}>
               <Text style={[styles.tableCell, styles.colIndex]}>-</Text>
               <Text style={[styles.tableCell, styles.colQty]}></Text>
               <Text style={[styles.tableCell, styles.colDesc]}></Text>
             </View>
          ))}
        </View>

        {/* Tabla de Items de Descripción (Servicios/Adicionales) */}
        {budget.descriptionItems && budget.descriptionItems.length > 0 && (
          <View style={[styles.table, { marginTop: 0 }]}>
             <View style={[styles.tableHeader, { backgroundColor: COLORS.dark }]}>
                <Text style={[styles.tableHeaderCell, styles.colIndex]}>#</Text>
                <Text style={[styles.tableHeaderCell, styles.colQty]}>CANT</Text>
                <Text style={[styles.tableHeaderCell, styles.colDesc]}>SERVICIOS / DETALLES ADICIONALES</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right', color: 'white' }]}>TOTAL</Text>
            </View>

             {budget.descriptionItems.map((item, index) => (
                <View key={`desc-${index}`} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colIndex]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                   <Text style={[styles.tableCell, styles.colDesc]}>
                    {item.title} {item.unit ? `(${item.unit})` : ''}
                  </Text>
                   <Text style={[styles.tableCell, { width: '15%', textAlign: 'right', fontSize: 10 }]}>
                      {formatCurrency(item.price * (item.quantity))}
                   </Text>
                </View>
              ))}
          </View>
        )}

        {/* Sección de Totales */}
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal Neto:</Text>
            <Text style={styles.totalValue}>{formatCurrency(budget.netAmount)}</Text>
          </View>

          {budget.hasIva && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({budget.ivaPercentage}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(budget.ivaValue)}</Text>
            </View>
          )}

          {budget.hasIibb && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IIBB ({budget.iibbPercentage}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(budget.iibbValue)}</Text>
            </View>
          )}

          <View style={styles.finalTotal}>
            <Text style={[styles.finalTotalText, { fontSize: 12 }]}>TOTAL (ARS)</Text>
            <Text style={[styles.finalTotalText, { marginLeft: 12 }]}>
                {formatCurrency(budget.totalAmount)}
            </Text>
          </View>

          {budget.hasUSD && budget.usdValue && budget.totalAmountUSD && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 8, color: '#22c55e', marginBottom: 4 }}>
                Cotización USD: ${budget.usdValue.toLocaleString('es-AR')}
              </Text>
              <View style={[styles.finalTotal, { borderTopColor: '#22c55e' }]}>
                <Text style={[styles.finalTotalText, { fontSize: 12, color: '#22c55e' }]}>
                  TOTAL (USD)
                </Text>
                <Text style={[styles.finalTotalText, { marginLeft: 12, color: '#22c55e' }]}>
                  USD {budget.totalAmountUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Documento generado por el sistema de presupuestos de JCQ Andamios.
        </Text>

      </Page>
    </Document>
  );
};