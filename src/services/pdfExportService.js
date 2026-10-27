/**
 * ============================================================================
 * SERVICIO DE EXPORTACIÓN DE REPORTES A FORMATO PDF (MULTI-DISPOSITIVO)
 * ============================================================================
 * Permite descargar el historial de eventos filtrados (Tipo de Evento, Detalle,
 * Fecha/Hora de Inicio y Fecha/Hora de Término) en formato PDF listo para
 * computadora o dispositivo móvil.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateTimeCL } from './awsApiService';

export function exportEventsToPDF(events, filters = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Encabezado Institucional BeeSense
  doc.setFillColor(18, 43, 82); // #122B52 Azul Marino BeeSense
  doc.rect(0, 0, 297, 32, 'F');

  doc.setTextColor(212, 160, 23); // #D4A017 Dorado BeeSense
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BeeSense', 14, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(' | Reporte Oficial de Eventos y Alertas Telemétricas IoT', 48, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Colmenar: Colmenar Principal - Sector Norte   |   Generado: ${formatDateTimeCL(new Date())}`, 14, 24);

  // Resumen de filtros aplicados
  const tipoLabel = filters.tipoEvento || 'TODOS';
  const desdeLabel = filters.fechaDesde || 'Sin límite inicial';
  const hastaLabel = filters.fechaHasta || 'Sin límite final';

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `Filtros Aplicados -> Tipo de Evento: ${tipoLabel}   |   Desde: ${desdeLabel}   |   Hasta: ${hastaLabel}   |   Total Registros: ${events.length}`,
    14,
    41
  );

  // Construcción de filas de la tabla
  const tableRows = events.map((ev, index) => [
    index + 1,
    ev.tipoEvento || 'N/A',
    ev.titulo || ev.tipoEvento,
    ev.detalle || '-',
    ev.fechaInicio || '-',
    ev.fechaTermino || 'En curso (Activa)',
  ]);

  autoTable(doc, {
    startY: 46,
    head: [[
      '#',
      'Categoría (DB)',
      'Evento',
      'Descripción Detallada',
      'Fecha y Hora de Inicio',
      'Fecha y Hora de Término',
    ]],
    body: tableRows.length > 0
      ? tableRows
      : [['-', 'SIN REGISTROS', 'No existen eventos para los filtros seleccionados', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [18, 43, 82],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [244, 247, 251],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 78 },
      4: { cellWidth: 46 },
      5: { cellWidth: 46 },
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `BeeSense 2026. - Plataforma de Monitoreo Apícola IoT (AWS IoT Core + Amazon DynamoDB) - Página ${data.pageNumber}`,
        14,
        pageHeight - 8
      );
    },
  });

  const fileTimestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  doc.save(`BeeSense_Reporte_Eventos_${fileTimestamp}.pdf`);
}
