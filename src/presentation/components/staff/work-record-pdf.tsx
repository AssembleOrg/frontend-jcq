import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Paleta de colores JCQ
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
    position: 'relative' 
  },
  watermarkContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: -1, opacity: 0.08, 
  },
  watermarkText: {
    fontSize: 60, fontWeight: 'bold', color: COLORS.watermark,
    transform: 'rotate(-45deg)', textTransform: 'uppercase'
  },
  headerContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 10
  },
  companyName: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, textTransform: 'uppercase' },
  documentTitle: { fontSize: 12, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginVertical: 10, padding: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, paddingVertical: 8, alignItems: 'center' },
  label: { width: '40%', fontSize: 12, color: COLORS.gray, fontWeight: 'bold' },
  value: { width: '60%', fontSize: 12, textAlign: 'right', color: COLORS.dark },
  
  // --- ESTILOS DE TABLA ---
  tableContainer: {
    marginTop: 15, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.lightGray
  },
  tableHeader: { 
    flexDirection: 'row', backgroundColor: COLORS.dark, padding: 8, 
  },
  tableRow: { 
    flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray 
  },
  // Columnas: Día (40%), Normal (30%), Extra (30%)
  colDay: { width: '40%', fontSize: 10, color: COLORS.dark },
  colNormal: { width: '30%', fontSize: 10, textAlign: 'right', color: COLORS.dark },
  colExtra: { width: '30%', fontSize: 10, textAlign: 'right', fontWeight: 'bold', color: COLORS.dark },
  
  // Celdas Header
  headerCellDay: { width: '40%', color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  headerCellNormal: { width: '30%', color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' },
  headerCellExtra: { width: '30%', color: '#ea580c', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' }, 

  totalContainer: {
    marginTop: 20, backgroundColor: COLORS.lightGray, padding: 15, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: COLORS.primary
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  finalTotal: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#d1d5db'
  },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  footer: {
    position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: COLORS.gray, borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 10
  }
});

// INTERFAZ ACTUALIZADA PARA SOPORTAR NORMAL Y EXTRA
export interface PdfData {
  employeeName: string;
  date: string;
  amountsDetail: {
    lunes: { normal: number; extra: number };
    martes: { normal: number; extra: number };
    miercoles: { normal: number; extra: number };
    jueves: { normal: number; extra: number };
    viernes: { normal: number; extra: number };
    sabado: { normal: number; extra: number };
    domingo: { normal: number; extra: number };
  };
  lastWeekPayment: number;
  grossTotal: number;
  advance: number;
  totalPay: number;
}

export const WorkRecordPdf = ({ data }: { data: PdfData }) => {
  
  const renderRow = (label: string, dayData: { normal: number; extra: number }) => {
    return (
        <View style={styles.tableRow}>
            <Text style={styles.colDay}>{label}</Text>
            <Text style={styles.colNormal}>
                {dayData.normal > 0 ? `$${dayData.normal.toLocaleString('es-AR')}` : '-'}
            </Text>
            <Text style={[styles.colExtra, { color: dayData.extra > 0 ? COLORS.primary : '#d1d5db' }]}>
                {dayData.extra > 0 ? `$${dayData.extra.toLocaleString('es-AR')}` : '-'}
            </Text>
        </View>
    );
  };

  return (
    <Document>
        <Page size="A4" style={styles.page}>
        
        <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>JCQ ANDAMIOS</Text>
        </View>

        <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Asegúrate que la ruta de la imagen sea correcta en tu proyecto */}
            <Image src="/jcq.png" style={{ width: 90, marginRight: 12 }} />
            <View>
                <Text style={styles.companyName}>JCQ ANDAMIOS</Text>
                <Text style={{ fontSize: 9, color: COLORS.gray }}>Gestión de Personal</Text>
            </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.documentTitle}>LIQUIDACION SEMANAL</Text>
            <Text style={{ fontSize: 10, marginTop: 4 }}>Fecha: {data.date}</Text>
        </View>
        </View>

        <View style={styles.section}>
            <View style={styles.row}>
                <Text style={styles.label}>EMPLEADO:</Text>
                <Text style={styles.value}>{data.employeeName}</Text>
            </View>

            {/* TABLA DE 3 COLUMNAS */}
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerCellDay}>DÍA</Text>
                    <Text style={styles.headerCellNormal}>NORMAL ($)</Text>
                    <Text style={styles.headerCellExtra}>EXTRA ($)</Text>
                </View>
                {renderRow('Sábado', data.amountsDetail.sabado)}
                {renderRow('Domingo', data.amountsDetail.domingo)}
                {renderRow('Lunes', data.amountsDetail.lunes)}
                {renderRow('Martes', data.amountsDetail.martes)}
                {renderRow('Miércoles', data.amountsDetail.miercoles)}
                {renderRow('Jueves', data.amountsDetail.jueves)}
                {renderRow('Viernes', data.amountsDetail.viernes)}
            </View>

            <View style={styles.totalContainer}>
                {data.lastWeekPayment > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={{ fontSize: 12, color: COLORS.gray }}>Pago Semana Anterior:</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>${data.lastWeekPayment.toLocaleString('es-AR')}</Text>
                    </View>
                )}

                <View style={styles.totalRow}>
                    <Text style={{ fontSize: 12, color: COLORS.gray }}>Total Bruto:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>${data.grossTotal.toLocaleString('es-AR')}</Text>
                </View>
                
                {data.advance > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={{ fontSize: 12, color: '#dc2626' }}>Adelanto:</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#dc2626' }}>-${data.advance.toLocaleString('es-AR')}</Text>
                    </View>
                )}

                <View style={styles.finalTotal}>
                    <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
                    <Text style={styles.totalValue}>${data.totalPay.toLocaleString('es-AR')}</Text>
                </View>
            </View>
        </View>

        <Text style={styles.footer}>
            Documento generado automáticamente por el sistema de gestión de JCQ Andamios.
        </Text>

        </Page>
    </Document>
  );
};