import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Dispatch } from '@/src/core/entities';

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

    // Estilos de tabla
    tableContainer: {
        marginTop: 15, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.lightGray
    },
    tableHeader: {
        flexDirection: 'row', backgroundColor: COLORS.dark, padding: 8,
    },
    tableRow: {
        flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray
    },
    colStructure: { width: '60%', fontSize: 10, color: COLORS.dark },
    colQuantity: { width: '40%', fontSize: 10, textAlign: 'right', fontWeight: 'bold', color: COLORS.dark },
    headerCell: { width: '60%', color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    headerCellQty: { width: '40%', color: '#ea580c', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' },

    infoBox: {
        backgroundColor: COLORS.lightGray, padding: 12, borderRadius: 4, marginBottom: 15
    },
    footer: {
        position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: COLORS.gray, borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 10
    }
});

interface DispatchPdfProps {
    dispatch: Dispatch;
}

export const DispatchPdf = ({ dispatch }: DispatchPdfProps) => {
    const totalItems = dispatch.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Watermark */}
                <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>JCQ ANDAMIOS</Text>
                </View>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image src="/jcq.png" style={{ width: 90, marginRight: 12 }} />
                        <View>
                            <Text style={styles.companyName}>JCQ ANDAMIOS</Text>
                            <Text style={{ fontSize: 9, color: COLORS.gray }}>Remito de Despacho</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.documentTitle}>REMITO</Text>
                        <Text style={{ fontSize: 10, marginTop: 4 }}>
                            Fecha: {new Date(dispatch.createdAt).toLocaleDateString('es-AR')}
                        </Text>
                    </View>
                </View>

                {/* Project/Client Info */}
                <View style={styles.infoBox}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 11, color: COLORS.gray }}>Cliente:</Text>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.dark }}>
                            {dispatch.project?.client?.fullname || 'N/A'}
                        </Text>
                    </View>
                    {dispatch.project?.locationAddress && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 10, color: COLORS.gray }}>Dirección:</Text>
                            <Text style={{ fontSize: 10, color: COLORS.dark }}>
                                {dispatch.project.locationAddress}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Driver Info */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase' }}>
                        Datos del Transporte
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>CHOFER:</Text>
                        <Text style={styles.value}>{dispatch.firstName} {dispatch.lastName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>CUIT:</Text>
                        <Text style={styles.value}>{dispatch.cuit || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>PATENTE:</Text>
                        <Text style={styles.value}>{dispatch.licensePlate || 'N/A'}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase' }}>
                        Materiales Despachados
                    </Text>

                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>ESTRUCTURA</Text>
                            <Text style={styles.headerCellQty}>CANTIDAD</Text>
                        </View>
                        {dispatch.items?.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.colStructure}>
                                    {item.projectItem?.structureName || 
                                     (item.projectItem?.structure?.name ? 
                                        `${item.projectItem.structure.name}${item.projectItem.structure.measure ? ` (${item.projectItem.structure.measure})` : ''}` 
                                        : 'Item')}
                                </Text>
                                <Text style={styles.colQuantity}>{item.quantity} unidades</Text>
                            </View>
                        ))}
                    </View>

                    {/* Total */}
                    <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.dark }}>
                            Total: <Text style={{ color: COLORS.primary }}>{totalItems} unidades</Text>
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {dispatch.notes && (
                    <View style={styles.section}>
                        <Text style={{ fontSize: 10, color: COLORS.gray, marginBottom: 4 }}>Observaciones:</Text>
                        <Text style={{ fontSize: 10, color: COLORS.dark }}>{dispatch.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Documento generado automáticamente por el sistema de gestión de JCQ Andamios.
                </Text>

            </Page>
        </Document>
    );
};
