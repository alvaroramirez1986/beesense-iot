/**
 * ============================================================================
 * SERVICIO DE EXPORTACIÓN DE REPORTES A FORMATO PDF CON LOGOTIPO BEESENSE
 * ============================================================================
 * Incluye en el diseño (layout) del documento PDF el logotipo oficial de BeeSense,
 * metadatos del colmenar, resumen de filtros aplicados (incluyendo el filtro
 * opcional de rango horario) y tabla detallada de eventos en DynamoDB.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateTimeCL } from './awsApiService';
import { BEESENSE_LOGO_BASE64 } from './logoBase64';

export function exportEventsToPDF(events, filters = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Franja Superior Institucional Azul Marino BeeSense (#122B52)
  doc.setFillColor(18, 43, 82);
  doc.rect(0, 0, 297, 36, 'F');

  // 2. Línea acento inferior dorada (#D4A017)
  doc.setFillColor(212, 160, 23);
  doc.rect(0, 35, 297, 1.5, 'F');

  // 3. Contenedor blanco redondeado para el Logotipo Oficial de BeeSense en la esquina superior izquierda
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 5.5, 58, 24, 3, 3, 'F');

  try {
    doc.addImage(BEESENSE_LOGO_BASE64, 'PNG', 14.5, 7.5, 53, 19.5);
  } catch (err) {
    console.warn('[BeeSense PDF] Fallback de texto si addImage falla:', err);
    doc.setTextColor(18, 43, 82);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('BeeSense IoT', 18, 19);
  }

  // 4. Título y Subtítulo del Reporte Oficial a la derecha del Logotipo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('REPORTE OFICIAL DE EVENTOS Y ALERTAS TELEMÉTRICAS IoT', 76, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Colmenar: Colmenar Principal - Sector Norte   |   Origen: Amazon DynamoDB   |   Emisión: ${formatDateTimeCL(new Date())}`,
    76,
    22.5
  );

  // 5. Resumen de filtros aplicados (incluyendo Rango Horario si fue activado manualmente)
  const tipoLabel = filters.tipoEvento || 'TODOS';
  const desdeLabel = filters.fechaDesde || 'Inicio';
  const hastaLabel = filters.fechaHasta || 'Actualidad';
  const horarioLabel = filters.rangoHorarioActivo
    ? `${filters.horaDesde || '00:00'} a ${filters.horaHasta || '23:59'} hrs`
    : 'Desactivado (Consulta día completo)';

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `Filtros -> Tipo: ${tipoLabel}  |  Fechas: ${desdeLabel} - ${hastaLabel}  |  Rango Horario: ${horarioLabel}  |  Total: ${events.length} evento(s)`,
    76,
    29.5
  );

  // 6. Construcción de filas de la tabla
  const tableRows = events.map((ev, index) => [
    index + 1,
    ev.tipoEvento || 'N/A',
    ev.titulo || ev.tipoEvento,
    ev.detalle || '-',
    ev.fechaInicio || '-',
    ev.fechaTermino || 'En curso (Activa)',
  ]);

  autoTable(doc, {
    startY: 42,
    head: [[
      '#',
      'Categoría (DB)',
      'Evento',
      'Descripción Detallada',
      'Fecha y Hora de Inicio',
      'Fecha y Hora de Término',
    ]],
    body:
      tableRows.length > 0
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
        `BeeSense 2026. — Plataforma de Monitoreo Apícola IoT (AWS IoT Core + Amazon DynamoDB) — Página ${data.pageNumber}`,
        14,
        pageHeight - 8
      );
    },
  });

  const fileTimestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  doc.save(`BeeSense_Reporte_Eventos_${fileTimestamp}.pdf`);
}
